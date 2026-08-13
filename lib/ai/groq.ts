/**
 * Groq adapter — OpenAI-compatible chat completions.
 *
 * Uses strict `json_schema` structured output, which *guarantees* schema
 * adherence rather than Gemini's best-effort constraint. Strict mode is only
 * supported on the gpt-oss models, which is why the model is not a free choice.
 *
 * Free-tier budget is far more forgiving than Gemini's: ~1000 requests/day
 * against Gemini's ~30, which is what makes this a viable fallback rather than
 * a second way to hit the same wall.
 */

import type { AIProvider, AIResult, GenerateJsonRequest } from "./types";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Strict structured output is supported only on `openai/gpt-oss-20b` and
 * `openai/gpt-oss-120b`. The 20b model is on the free tier and sufficient for
 * extraction — do not swap this for a Llama or Qwen model without dropping to
 * best-effort or json_object mode.
 */
export const GROQ_MODEL = "openai/gpt-oss-20b";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: { content?: string | null };
    finish_reason?: string;
  }>;
};

/**
 * Strict mode requires `additionalProperties: false` on every object node and
 * requires `required` to list *every* property. Our schemas are written for
 * Gemini, where optional fields are genuinely optional, so they are adapted
 * here rather than at the call site — the shared schema must stay neutral.
 */
function toStrictSchema(schema: Record<string, unknown>): Record<string, unknown> {
  if (schema.type !== "object" || typeof schema.properties !== "object") {
    return schema;
  }

  const properties = schema.properties as Record<string, Record<string, unknown>>;

  const adapted = Object.fromEntries(
    Object.entries(properties).map(([key, value]) => {
      if (value?.type === "object") return [key, toStrictSchema(value)];

      if (value?.type === "array" && typeof value.items === "object") {
        return [key, { ...value, items: toStrictSchema(value.items as Record<string, unknown>) }];
      }

      return [key, value];
    }),
  );

  return {
    ...schema,
    properties: adapted,
    additionalProperties: false,
    // Strict mode demands every key be listed. Fields the resume does not cover
    // come back empty rather than absent, which applyExtracted() already skips.
    required: Object.keys(adapted),
  };
}

async function generateJson<T>(req: GenerateJsonRequest): Promise<AIResult<T>> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      kind: "request_failed",
      message: "GROQ_API_KEY is not configured.",
      provider: "groq",
    };
  }

  let response: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: req.prompt }],
        temperature: req.temperature ?? 0.3,
        max_completion_tokens: req.maxOutputTokens ?? 4000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: req.schemaName ?? "response",
            strict: true,
            schema: toStrictSchema(req.schema),
          },
        },
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[ai/groq] request timeout:", error);
      return {
        ok: false,
        kind: "request_failed",
        message: "The AI service timed out. Please try again.",
        provider: "groq",
      };
    }

    console.error("[ai/groq] network error:", error);
    return {
      ok: false,
      kind: "request_failed",
      message: "Could not reach the AI service.",
      provider: "groq",
    };
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 429) {
    const body = await response.text().catch(() => "");
    // Groq reports the exhausted window in the error text; per-day does not
    // recover today, so it must not be reported as "try again in a minute".
    const isDaily = /per day|RPD|requests per day/i.test(body);

    return {
      ok: false,
      kind: isDaily ? "quota_exhausted" : "rate_limit",
      message: isDaily
        ? "The daily free-tier limit for this AI provider has been reached."
        : "The AI service is busy right now. Please try again in a minute.",
      provider: "groq",
    };
  }

  if (response.status === 503 || response.status === 500 || response.status === 502) {
    return {
      ok: false,
      kind: "unavailable",
      message: "The AI service is temporarily unavailable.",
      provider: "groq",
    };
  }

  if (response.status === 400 || response.status === 401 || response.status === 403) {
    const body = await response.text().catch(() => "");
    const credentialIssue =
      /invalid api key|api key|authentication|unauthorized|forbidden|token/i.test(body) ||
      response.status === 401 ||
      response.status === 403;

    if (credentialIssue) {
      return {
        ok: false,
        kind: "config_error",
        message: "The AI provider credentials are invalid or not configured.",
        provider: "groq",
      };
    }
  }

  if (!response.ok) {
    console.error("[ai/groq] HTTP", response.status, await response.text().catch(() => ""));
    return {
      ok: false,
      kind: "request_failed",
      message: "The AI service returned an error.",
      provider: "groq",
    };
  }

  let body: ChatCompletionResponse;

  try {
    body = (await response.json()) as ChatCompletionResponse;
  } catch {
    return {
      ok: false,
      kind: "bad_response",
      message: "The AI service returned an invalid reply.",
      provider: "groq",
    };
  }

  const choice = body.choices?.[0];

  // Truncation is reported here rather than surfacing as unparseable JSON, so
  // a budget problem reads as itself.
  if (choice?.finish_reason === "length") {
    console.error("[ai/groq] response truncated — max_completion_tokens too low");
    return {
      ok: false,
      kind: "bad_response",
      message: "The AI response was cut short. Please try again.",
      provider: "groq",
    };
  }

  const text = choice?.message?.content;

  if (!text || !text.trim()) {
    console.error("[ai/groq] empty content in response");
    return {
      ok: false,
      kind: "bad_response",
      message: "The AI service returned an empty reply.",
      provider: "groq",
    };
  }

  try {
    return { ok: true, data: JSON.parse(text) as T, provider: "groq" };
  } catch {
    console.error("[ai/groq] unparseable JSON:", text.slice(0, 300));
    return {
      ok: false,
      kind: "bad_response",
      message: "The AI service returned malformed data.",
      provider: "groq",
    };
  }
}

export const groqProvider: AIProvider = {
  name: "groq",
  isConfigured: () => Boolean(process.env.GROQ_API_KEY),
  generateJson,
};

/**
 * Gemini adapter — Google AI Studio, Interactions API.
 *
 * Called over `fetch` rather than the @google/genai SDK: we need exactly one
 * endpoint, and the SDK is a large dependency for a single POST.
 *
 * Raw-REST behaviours the SDK hides, each of which silently breaks naive code:
 *   1. There is no `output_text` field. That is an SDK convenience; over REST
 *      the payload lives in `steps[]`.
 *   2. `steps[0]` is usually a `thought` step, not the answer. The answer is the
 *      step with `type: "model_output"` and must be found by type.
 *   3. Thinking tokens are drawn from `max_output_tokens`, so a budget sized for
 *      the visible reply gets consumed before the reply is written.
 */

import type { AIProvider, AIResult, GenerateJsonRequest } from "./types";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";

/** Free-tier Flash model. Verified live — note `gemini-2.0-flash` is shut down. */
export const GEMINI_MODEL = "gemini-3.5-flash";

type InteractionStep = {
  type?: string;
  content?: Array<{ type?: string; text?: string }> | null;
};

type InteractionResponse = {
  status?: string;
  steps?: InteractionStep[];
  output_text?: string;
};

function readOutputText(body: InteractionResponse): string | null {
  if (typeof body.output_text === "string" && body.output_text.trim()) {
    return body.output_text;
  }

  const steps = body.steps ?? [];
  // Found by type — step 0 is typically the model's `thought` step.
  const output = steps.find((s) => s.type === "model_output") ?? steps[steps.length - 1];
  const text = output?.content?.find((c) => c.type === "text")?.text;

  return typeof text === "string" && text.trim() ? text : null;
}

async function generateJson<T>(req: GenerateJsonRequest): Promise<AIResult<T>> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      kind: "request_failed",
      message: "GEMINI_API_KEY is not configured.",
      provider: "gemini",
    };
  }

  let response: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        input: req.prompt,
        generation_config: {
          temperature: req.temperature ?? 0.3,
          max_output_tokens: req.maxOutputTokens ?? 4000,
          // Thinking competes with output for the budget and varies run to run.
          // Measured on a real resume: "low" truncated 1 run in 5 and populated
          // roughly half the fields; "minimal" completed every time with twice
          // as many. Extraction is transcription, not reasoning. ("none" is
          // rejected by the API — "minimal" is the supported floor.)
          thinking_level: "minimal",
        },
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: req.schema,
        },
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[ai/gemini] request timeout:", error);
      return {
        ok: false,
        kind: "request_failed",
        message: "The AI service timed out. Please try again.",
        provider: "gemini",
      };
    }

    console.error("[ai/gemini] network error:", error);
    return {
      ok: false,
      kind: "request_failed",
      message: "Could not reach the AI service.",
      provider: "gemini",
    };
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 429) {
    // Gemini returns 429 for both the short per-minute cap and a longer daily
    // one, and the honest message differs: one clears in seconds, the other
    // does not come back today. The body carries a "Please retry in 16.9s"
    // hint on the short window and names a *_per_day metric on the long one —
    // both are more reliable signals than looking for the word "daily".
    const body = await response.text().catch(() => "");
    const retryMatch = body.match(/retry in ([\d.]+)s/i);
    const retrySeconds = retryMatch ? Number(retryMatch[1]) : null;
    const isDaily = /per_day|per day|PerDay/i.test(body) || (retrySeconds ?? 0) > 600;

    return {
      ok: false,
      kind: isDaily ? "quota_exhausted" : "rate_limit",
      message: isDaily
        ? "The daily free-tier limit for this AI provider has been reached."
        : retrySeconds
          ? `The AI service is busy. Retrying is possible in about ${Math.ceil(retrySeconds)} seconds.`
          : "The AI service is busy right now. Please try again in a minute.",
      provider: "gemini",
    };
  }

  if (response.status === 503 || response.status === 500) {
    return {
      ok: false,
      kind: "unavailable",
      message: "The AI service is temporarily unavailable.",
      provider: "gemini",
    };
  }

  if (response.status === 400 || response.status === 401 || response.status === 403) {
    const body = await response.text().catch(() => "");
    const credentialIssue =
      /invalid api key|api key|key is invalid|authentication|auth.*failed|forbidden/i.test(body) ||
      response.status === 401 ||
      response.status === 403;

    if (credentialIssue) {
      return {
        ok: false,
        kind: "config_error",
        message: "The AI provider credentials are invalid or not configured.",
        provider: "gemini",
      };
    }
  }

  if (!response.ok) {
    console.error("[ai/gemini] HTTP", response.status, await response.text().catch(() => ""));
    return {
      ok: false,
      kind: "request_failed",
      message: "The AI service returned an error.",
      provider: "gemini",
    };
  }

  let body: InteractionResponse;

  try {
    body = (await response.json()) as InteractionResponse;
  } catch {
    return {
      ok: false,
      kind: "bad_response",
      message: "The AI service returned an invalid reply.",
      provider: "gemini",
    };
  }

  // Budget ran out mid-write. Reported distinctly from malformed data because
  // the cause is ours, and the JSON is truncated rather than wrong.
  if (body.status === "incomplete") {
    console.error("[ai/gemini] response incomplete — max_output_tokens too low");
    return {
      ok: false,
      kind: "bad_response",
      message: "The AI response was cut short. Please try again.",
      provider: "gemini",
    };
  }

  const text = readOutputText(body);

  if (!text) {
    console.error("[ai/gemini] no output text in response");
    return {
      ok: false,
      kind: "bad_response",
      message: "The AI service returned an empty reply.",
      provider: "gemini",
    };
  }

  try {
    return { ok: true, data: JSON.parse(text) as T, provider: "gemini" };
  } catch {
    console.error("[ai/gemini] unparseable JSON:", text.slice(0, 300));
    return {
      ok: false,
      kind: "bad_response",
      message: "The AI service returned malformed data.",
      provider: "gemini",
    };
  }
}

export const geminiProvider: AIProvider = {
  name: "gemini",
  isConfigured: () => Boolean(process.env.GEMINI_API_KEY),
  generateJson,
};

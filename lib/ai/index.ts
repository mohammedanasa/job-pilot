/**
 * The AI entry point. Routes import from here and never from a provider module.
 *
 * Provider order is set by `AI_PROVIDER` in the environment ("groq" or
 * "gemini"), defaulting to groq — its free tier allows roughly 1000 requests a
 * day against Gemini's ~30, so it is the sensible primary.
 *
 * When the preferred provider is out of quota or unreachable, the call falls
 * through to the other one. That is the whole point: a spent free-tier quota
 * used to take the feature down completely.
 */

import { geminiProvider } from "./gemini";
import { groqProvider } from "./groq";
import type {
  AIErrorKind,
  AIProvider,
  AIProviderName,
  AIResult,
  GenerateJsonRequest,
} from "./types";

export type { AIProviderName, AIResult, GenerateJsonRequest } from "./types";

const PROVIDERS: Record<AIProviderName, AIProvider> = {
  gemini: geminiProvider,
  groq: groqProvider,
};

/** Failures that another provider might succeed at. A malformed reply is not
 *  one of them — that is a prompt or schema problem, and retrying elsewhere
 *  just spends a second quota to get the same answer. */
const WORTH_FAILING_OVER: readonly AIErrorKind[] = [
  "rate_limit",
  "quota_exhausted",
  "unavailable",
  "request_failed",
];

function preferredOrder(): AIProviderName[] {
  const preferred = process.env.AI_PROVIDER === "gemini" ? "gemini" : "groq";
  const other: AIProviderName = preferred === "gemini" ? "groq" : "gemini";
  return [preferred, other];
}

/**
 * Generate JSON, trying the preferred provider first and falling back on
 * quota/availability failures.
 *
 * Providers without an API key are skipped rather than attempted, so adding a
 * key is the only step needed to bring one into rotation.
 */
export async function generateJson<T>(req: GenerateJsonRequest): Promise<AIResult<T>> {
  const order = preferredOrder().map((name) => PROVIDERS[name]);
  const configured = order.filter((p) => p.isConfigured());

  if (configured.length === 0) {
    return {
      ok: false,
      kind: "request_failed",
      message: "No AI provider is configured. Set GROQ_API_KEY or GEMINI_API_KEY.",
      provider: order[0].name,
    };
  }

  // Non-null after the loop: `configured` is non-empty, and every iteration
  // either returns or assigns this.
  let lastFailure!: AIResult<T> & { ok: false };

  for (const provider of configured) {
    const result = await provider.generateJson<T>(req);

    if (result.ok) return result;

    lastFailure = result;

    if (!WORTH_FAILING_OVER.includes(result.kind)) return result;

    console.warn(`[ai] ${provider.name} failed with ${result.kind} — trying next provider`);
  }

  // Every configured provider failed. With more than one in rotation, say so
  // plainly — "try again in a minute" would be misleading when both are down.
  if (configured.length > 1) {
    return {
      ok: false,
      kind: lastFailure.kind,
      message: "All AI providers are currently unavailable or out of quota. Please try again later.",
      provider: lastFailure.provider,
    };
  }

  return lastFailure;
}

/**
 * Provider-neutral AI contract.
 *
 * Call sites depend on this file, never on a specific provider. Adding or
 * swapping a provider must not require touching a route.
 */

export type AIProviderName = "gemini" | "groq";

/**
 * Why a call failed, so callers can say something true.
 *
 * `rate_limit` is split by recovery time because the honest message differs:
 * a per-minute cap clears on its own, a daily cap does not come back today.
 */
export type AIErrorKind =
  | "rate_limit"
  | "quota_exhausted"
  | "unavailable"
  | "bad_response"
  | "request_failed"
  | "config_error";

export type AIResult<T> =
  | { ok: true; data: T; provider: AIProviderName }
  | { ok: false; kind: AIErrorKind; message: string; provider: AIProviderName };

export type GenerateJsonRequest = {
  prompt: string;
  /** JSON Schema object. Constrains shape, not just format. */
  schema: Record<string, unknown>;
  /** Name for the schema — required by some providers, ignored by others. */
  schemaName?: string;
  temperature?: number;
  /**
   * Must cover any provider-internal reasoning as well as the visible reply.
   * Gemini 3.x spends this budget on a thinking phase first, so budget
   * generously even when the expected output is small.
   */
  maxOutputTokens?: number;
};

/**
 * What every provider must implement. Provider-specific tuning (Gemini's
 * thinking_level, Groq's strict mode) stays inside the adapter — it must not
 * leak into this signature, or call sites become provider-aware again.
 */
export type AIProvider = {
  name: AIProviderName;
  /** Whether the provider is configured — i.e. its API key is present. */
  isConfigured: () => boolean;
  generateJson: <T>(req: GenerateJsonRequest) => Promise<AIResult<T>>;
};

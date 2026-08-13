# Memory — Features 06 + 07 (Profile Save, AI Extraction, Multi-Provider AI Layer)

Last updated: 2026-08-13

## What was built

**Feature 06 — Profile Save Logic** (was already on disk, unrecorded, at session start):

- `actions/profile.ts` — `saveProfile` Server Action; upserts the whole form, computes completion, `revalidatePath('/profile')`
- `app/api/resume/upload/route.ts` + `app/api/resume/download/route.ts`
- `migrations/20260813104026_add-resume-pdf-key.sql` — applied live
- `app/profile/page.tsx` prefills from DB and passes real `userEmail`

**Feature 07 — AI Profile Extraction:**

- `app/api/resume/extract/route.ts` — auth guard → fetch PDF from storage by `resume_pdf_key` → pdf-parse → 200-char floor → AI → shape check
- `types/index.ts` — added `ExtractedProfile` (narrower than `ProfileFormData` by design)
- `components/profile/ResumeSection.tsx` — Extract button, gated on `uploadState === "success"`
- `components/profile/ProfileForm.tsx` — `applyExtracted()` with dirty-check confirm
- `next.config.ts` — `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]`

**The AI layer — `lib/ai/`** (replaced a single-provider `lib/gemini.ts`):

- `index.ts` — orchestrator; provider selection + fallback. **The only module routes import.**
- `types.ts` — provider-neutral contract
- `gemini.ts` — Google AI Studio adapter (`gemini-3.5-flash`, Interactions API)
- `groq.ts` — Groq adapter (`openai/gpt-oss-20b`, strict `json_schema`)

## Decisions made

- **AI is provider-neutral.** Routes import `@/lib/ai` only, never an adapter. Provider-specific tuning (Gemini's `thinking_level`, Groq's strict-schema rewriting) stays inside its adapter and must never leak into `GenerateJsonRequest`.
- **`AI_PROVIDER` env var, default `groq`** — chosen over a UI dropdown because AI vendor choice is a deployment concern, not something to put in front of a job seeker. Groq's ~1000 req/day vs Gemini's ~20 req/minute makes it the sensible primary.
- **Fallback on quota, availability, and network failures only.** Invalid credentials, missing config, and other auth/config errors do *not* fall over — they are hard failures that must be surfaced instead of silently rerouting traffic to another provider. `bad_response` also deliberately does *not* fail over — malformed JSON is a prompt/schema problem, so retrying elsewhere spends a second quota for the same answer.
- **Groq model is constrained, not free choice.** Strict `json_schema` (guaranteed adherence) works only on `openai/gpt-oss-20b` / `120b`. Do not swap in Llama/Qwen without dropping to best-effort.
- **Extraction fills only resume-derived fields.** Job preferences (salary, remote, tone, titles sought) are intentions not history, never overwritten. Work experience replaced wholesale, not merged (merging duplicates roles). Dirty form → confirm first.
- **Text to the model, not the PDF.** Keeps the empty-text guard meaningful — a scanned PDF sent directly yields confidently invented fields.
- **Errors distinguish our fault from the user's.** Worker/environment failure → 500 "problem on our side"; genuinely unreadable PDF → 422 "try a different file".

## Problems solved

- **pdfjs worker did not resolve under Turbopack** — every extraction threw and was reported to the user as a bad PDF. Fixed with `serverExternalPackages`. The failure appears *only at runtime*; `npm run build` passed throughout.
- **pdf-parse v2 is a class**, not the v1 default-export function that `library-docs.md` documented. `new PDFParse({data})` → `getText()` → `destroy()`.
- **Gemini's Interactions API has no `output_text` over raw REST** (SDK-only), and `steps[0]` is the *thought* step — the answer must be found by `type === "model_output"`.
- **Thinking tokens consume `max_output_tokens`.** The build plan's 800 (written for GPT-4o) left 18 tokens for output. Fixed with `thinking_level: "minimal"`, `maxItems` bounds, and a `required` list.
- **`gemini-2.0-flash` is shut down** — verified live rather than assumed.
- **Gemini's limit is ~20/minute, not daily** — an earlier note in the tracker recorded this wrongly; corrected there.

## Current state

- Features 04, 06, 07 all complete. **Developer confirmed extraction working in the browser on a real resume.**
- Verified in the Next runtime (not just `tsx`): pdf-parse → `lib/ai` → Groq returns complete, correct extraction.
- Fallback verified: with `AI_PROVIDER=gemini` and Gemini rate-limited or temporarily unavailable, requests still succeed via Groq. Invalid keys or misconfigured credentials are treated as hard failures and do not silently reroute.
- `npm run lint` and `npm run build` pass.
- **All of Features 04, 06, and 07 are UNCOMMITTED.** Last commit is `9a6d749` (Feature 05).

## Next session starts with

1. `/remember restore`
2. **Commit Features 04, 06, 07** — three features deep in the working tree is the top risk right now.
3. Then Feature 08 — Resume PDF Generation from Profile. Run `/architect feature 08` first.
   - Scope: `POST /api/resume/generate`, read profile → AI generates summary + polished bullets → `@react-pdf/renderer` `renderToBuffer()` → upload to `resumes/{user_id}/resume.pdf` with `upsert: true` → update `resume_pdf_url` **and `resume_pdf_key`**.
   - It depends on the `serverExternalPackages` entry already in `next.config.ts`.
   - `library-docs.md` still specifies GPT-4o for Feature 08 prose generation — use `@/lib/ai` instead. Temperature 0.7 for generation (vs 0.3 for extraction).

## Open questions

- **Completion percentage is computed in two places** — `app/profile/page.tsx` (banner) and `actions/profile.ts` (`is_complete`), against two separate nine-item lists. They agree today; adding a required field to one silently diverges them. Consolidating into a shared helper was flagged but deliberately not done — it's a scope call.
- **Feature 13's Stagehand config still names an OpenAI model** for browser automation. Left alone deliberately: Stagehand's provider support is its own question, to be decided when Feature 13 is built.
- `scripts/setup-db.sql` may still duplicate the migration — worth deleting if so.

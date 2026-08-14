# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 08 Resume PDF Generation from Profile
**Next:** 09 Find Jobs Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- 2026-06-06 — Homepage implemented as static Server Components with mock visual assets from `public/`, matching the delivered landing page design before auth logic is wired.
- 2026-06-06 — `lucide-react` is approved in standards but not installed yet, so Feature 01 avoided adding dependencies and used provided brand/product images.
- 2026-06-07 — Feature 02 uses the current InsForge MCP/docs pattern from `@insforge/sdk` and `@insforge/sdk/ssr`. Next.js 16 request interception is implemented with `proxy.ts` instead of legacy `middleware.ts`.
- 2026-06-07 — After OAuth login, users redirect to `/dashboard` so they can complete setup before using the dashboard.
- 2026-06-22 — OAuth callback now exchanges the InsForge PKCE code through a Next Route Handler and writes SDK auth cookies before redirecting to `/dashboard`.
- 2026-06-22 — Auth recovery removed premature PostHog setup/events from Feature 02 and normalized the OAuth route response/error contract.
- 2026-06-22 — Auth review cleanup added explicit return types to the auth helpers, auth components, proxy, and protected placeholder pages.
- 2026-06-22 — Feature 03 initializes PostHog through Next.js `instrumentation-client.ts`, centralizes browser identity helpers in `lib/posthog-client.ts`, and uses request-scoped server captures in `lib/posthog-server.ts` so each server event flushes before returning.
- 2026-06-22 — PostHog tracking is limited to the approved event whitelist: `job_search_started`, `job_found`, `profile_completed`, and `company_researched`.
- 2026-06-22 — Profile page logout calls the InsForge client `auth.signOut()`, posts to `/api/auth/logout` to clear SSR auth cookies, then clears the OAuth verifier, resets PostHog identity, and routes to `/login`.
- 2026-08-12 — Feature 04 rebuilt on a new InsForge backend after the original database was lost. New project `8xcfj34w` (us-east) replaces `4brsdh32` (ap-southeast). Schema recreated from `migrations/20260812175451_create-schema.sql`; the old `20260624131107` migration was deleted.
- 2026-08-12 — `profiles` rows are now created by an `on_auth_user_created` trigger on `auth.users` instead of only by `saveProfile`. All three other tables' `user_id` columns reference `profiles(id)`, so a user without a profile row could not own jobs — signup now guarantees the row exists. `profiles.email` is populated by this trigger and is never written by app code.
- 2026-08-12 — RLS policies scoped `TO authenticated` using `(SELECT auth.uid())` subquery form, paired with explicit `GRANT`s. `anon` has all privileges revoked on all four tables — every route is behind auth.
- 2026-06-24 — Feature 05 Profile Page full UI built with mock data. SVG donut ring completion banner, drag-and-drop resume upload section, full ProfileForm with Personal Info, Professional Info (skills autocomplete from hardcoded list), Work Experience (1 default card, add up to 3), Education, and Job Preferences sections. No save logic — that is Feature 06.
- 2026-08-13 — Feature 06 saves through the `saveProfile` Server Action in `actions/profile.ts`, which upserts the whole form as one row and calls `revalidatePath('/profile')`. `profile_completed` fires only on the transition into completeness — the action reads the existing `is_complete` first so re-saving an already-complete profile does not re-fire the event.
- 2026-08-13 — Resume upload is a Route Handler (`app/api/resume/upload/route.ts`), not the Server Action, because Server Actions are a poor fit for multipart file bodies. It persists `resume_pdf_url` and `resume_pdf_key` immediately on upload, independent of Save Profile, so a resume is never lost by navigating away without saving.
- 2026-08-13 — The `resumes` bucket is private, so a stored URL is not fetchable. `resume_pdf_key` (migration `20260813104026`) holds the storage object key, and all reads go through `app/api/resume/download/route.ts`, which re-authenticates server-side and streams the PDF with `Cache-Control: private, no-store`.
- 2026-08-13 — Completion percentage is computed twice against the same nine required fields: server-side in `app/profile/page.tsx` for the banner, and inside `saveProfile` for the `is_complete` flag. The two lists must stay in sync — if a required field is added, update both.
- 2026-08-13 — **Gemini Flash replaces GPT-4o as the project's model.** Features 08, 10, and 13 were specified against GPT-4o and now use this client. Feature 13's Stagehand browser-automation model is a separate decision, deferred to that feature.
- 2026-08-13 — **The AI layer is provider-neutral: `lib/gemini.ts` became `lib/ai/`** (`index.ts` orchestrator + `types.ts` contract + `gemini.ts` / `groq.ts` adapters). Routes import `@/lib/ai` only. Driven by a real outage: a single provider meant a spent free-tier quota took the whole feature down. `AI_PROVIDER` picks the primary (default `groq`, whose ~1000/day dwarfs Gemini's ~20/minute); quota, availability, and network failures fall through to the other provider. `bad_response` deliberately does *not* fail over — malformed JSON is a prompt/schema problem, so retrying elsewhere spends a second quota for the same answer.
- 2026-08-13 — Groq uses **strict** `json_schema` mode (guaranteed adherence, better than Gemini's best-effort), which is supported only on `openai/gpt-oss-20b` / `120b`. Strict mode demands `additionalProperties: false` and a `required` list naming every property; that adaptation lives in `lib/ai/groq.ts` so shared schemas stay provider-neutral.
- 2026-08-13 — Feature 07 extraction reads the PDF back from storage by `resume_pdf_key` rather than from the request — the file left the browser at upload time. pdf-parse produces text, and the model receives *text*, not the PDF. Sending a scanned PDF straight to the model yields invented fields; a text-length floor of 200 chars catches those before any AI call.
- 2026-08-13 — Extraction fills only resume-derived fields. Job preferences (salary, remote, tone, titles sought) are intentions, not history, and are never overwritten. Work experience is replaced wholesale rather than merged — merging duplicates roles. A dirty form triggers a confirm before overwrite.
- 2026-08-13 — `pdf-parse` and `pdfjs-dist` are listed in `serverExternalPackages` in `next.config.ts`. They must stay there: bundling breaks pdfjs's runtime worker resolution, and the failure appears only when the route is called, never at build time. Feature 08 also handles PDFs and depends on this.
- 2026-08-13 — Extraction distinguishes *our* failures from *the user's*: a worker/environment error returns 500 with "problem on our side", while a genuinely unreadable PDF returns 422 with "try a different file". Reporting infrastructure faults as bad files sends users re-uploading good resumes.
- 2026-08-13 — **Feature 08 writes to a second storage slot, not the uploaded resume's.** The build plan specified `resumes/{user_id}/resume.pdf` with `upsert: true` — the path the uploaded resume already occupies. That would destroy the user's own file and, worse, repoint `resume_pdf_key`, so Feature 07's extraction would afterwards read our AI-written prose back as if it were their resume. Generated PDFs live at `{user_id}/generated-resume.pdf` behind `generated_pdf_url` / `generated_pdf_key` (migration `20260813152602`). `resume_pdf_key` keeps meaning "the file the user gave us".
- 2026-08-13 — The InsForge SDK's `storage.upload(path, file)` takes **two arguments and has no `upsert` option**, contrary to the build plan and `library-docs.md`. Writing an existing key overwrites it silently — verified against the live bucket by uploading the same key three times and reading it back. That is what makes regenerating a resume after a profile edit work.
- 2026-08-13 — Generation reads the **database**, never the form, so `ProfileForm` fingerprints the resume-relevant fields and disables Generate while they differ from the last save. Preferences are excluded from the fingerprint — they never reach the resume, so editing one must not block generation. Without this the PDF silently omits unsaved edits.
- 2026-08-13 — Feature 08 gates on a **minimal subset (full name + one role with responsibilities), not `is_complete`**. `is_complete` also demands salary expectation and cover letter tone, neither of which appears on a resume. Below the minimal floor the model has nothing to ground prose in and starts inventing, so it returns 422 rather than calling the AI.
- 2026-08-13 — **The model writes only prose.** Names, dates, employers, skills, and education are copied verbatim into the PDF; only the summary and role bullets come from `@/lib/ai`. A model that rephrases a job title or nudges a date produces a resume contradicting the user's own record. Roles are matched back by array `index`, not company name — two stints at one employer are common.
- 2026-08-13 — One-page fit is enforced by **bounding the model's output** (summary ≤400 chars, ≤3 bullets per role, ≤3 roles), not by truncating the rendered page. Cutting a bullet mid-sentence looks like a rendering bug; a genuinely dense profile flows to a second page instead of losing content.
- 2026-08-13 — `lib/resume-pdf.tsx` exports `buildResumeDocument()`, not the component. This keeps every piece of JSX out of the route (`app/` holds no UI logic) and types correctly — `createElement()` infers from props and loses the `DocumentProps` shape `renderToBuffer` requires, while a JSX literal inside the route's try/catch trips `react-hooks/error-boundaries`.
- 2026-08-13 — The PDF palette is **literal hex in `lib/resume-pdf.tsx`**, the one sanctioned exception to the no-hardcoded-colour rule. @react-pdf/renderer resolves styles in a PDF layout engine with no CSS custom properties, so `var(--color-text-primary)` resolves to nothing. Values are copied from `ui-tokens.md` and must be updated alongside it.
- 2026-08-13 — Gemini tuning is empirical, not guessed: `thinking_level: "minimal"` plus `maxItems` on arrays plus a `required` list. At `"low"` with no bounds, 1 run in 5 truncated and results populated ~half the fields. Thinking tokens are drawn from `max_output_tokens` and vary run to run, so budgets are generous (4000) and `status: "incomplete"` is checked explicitly.

---

## Notes

- 2026-06-06 — `npm run build` passes for the completed homepage.
- 2026-06-07 — `npm run build` passes for InsForge OAuth auth, callback handling, refresh route, protected routes, and placeholder protected pages.
- 2026-06-22 — `npm run build` passes after moving OAuth completion to server-owned cookie exchange.
- 2026-06-22 — `npm run lint` and `npm run build` pass after auth review fixes.
- 2026-06-22 — `npm run lint` and `npm run build` pass after explicit return type cleanup.
- 2026-06-22 — `npm run lint` and `npm run build` pass for Feature 03 PostHog Initialization.
- 2026-06-22 — `npm run lint` and `npm run build` pass after adding profile page logout with SSR auth cookie clearing.
- 2026-08-12 — `npm run lint` and `npm run build` pass after the Feature 04 schema rebuild. Signup trigger verified end to end: inserting an `auth.users` row auto-creates the matching `profiles` row, and deleting the user cascades it away.
- 2026-08-13 — `npm run lint` and `npm run build` pass for Feature 06. Backend verified live: migration `20260813104026_add-resume-pdf-key` is applied (both `resume_pdf_url` and `resume_pdf_key` present on `profiles`), and the `resumes` bucket exists with `public: false`.
- 2026-08-13 — ✅ **Feature 07 confirmed working by the developer in the browser** on a real resume — the full click-to-populate path (Extract button → route → pdf-parse → Groq → form fields), which no automated check covered.
- 2026-08-13 — Feature 07's Gemini adapter (then `lib/gemini.ts`, now `lib/ai/gemini.ts`) verified against the live Gemini API with a generated test resume: extraction returns every field correctly — name, phone, location, LinkedIn, title, `experienceLevel` "Senior", 8 years, 9 skills, both roles with dates, `currentlyWorking` inferred from "Present", and degree mapped to the form's exact `Master's` enum value.
- 2026-08-13 — ⚠️ That first verification ran under `tsx` (plain Node), **not** inside Next, and so did not exercise the route. It missed a bug that made the feature completely non-functional: pdfjs's worker does not resolve under Turbopack, so every extraction threw and was reported to the user as a bad PDF. Fixed with `serverExternalPackages` and then re-verified *inside the running Next dev server* (640 chars parsed from a real PDF). **Lesson: `npm run build` passing proves a module imports, not that it runs. Verify server code by calling it in the actual runtime.**
- 2026-08-13 — Groq verified end to end **inside the Next dev server** (not just under `tsx`): pdf-parse → `lib/ai` → Groq returned a complete, correct extraction with `AI_PROVIDER` unset, confirming the groq-by-default path. Fallback verified in both directions — with `AI_PROVIDER=gemini` and Gemini either rate-limited or holding an invalid key, the request still succeeded via Groq. Strict-schema adaptation handled nested objects, arrays, and enums correctly on the first attempt.
- 2026-08-13 — `npm run lint` and `npm run build` pass for Feature 08. Migration `20260813152602_add-generated-resume-columns` applied live and verified (`generated_pdf_url` and `generated_pdf_key` both present on `profiles`).
- 2026-08-13 — ✅ Feature 08 verified **inside the running Next dev server**, applying Feature 07's lesson rather than trusting the build. A temporary unauthenticated probe route called `renderToBuffer` under Turbopack and returned a valid `%PDF-` buffer, then was deleted. **`@react-pdf/renderer` needs no `serverExternalPackages` entry** — unlike pdf-parse, it resolves cleanly under Turbopack. The real route was then confirmed to load and reject unauthenticated requests with 401.
- 2026-08-13 — The rendered PDF was inspected visually, not just byte-checked: header, accent title, section rules, right-aligned date ranges (`2021-03` → "Mar 2021 — Present"), bullets, skills, and education all lay out correctly on one page. Note `backgroundColor` and `flex` **do** work, despite `library-docs.md` listing a narrower set of supported properties.
- 2026-08-13 — The prose schema was verified against live Groq: nested objects, the integer `index` field, and bounded arrays all pass strict `json_schema` mode. A first run leaked **first person** into the summary ("I lead platform teams") despite a third-person rule in the prompt; the rule was rewritten as an explicit no-pronoun instruction with an example, and three consecutive runs then came back clean. Resume prose is generated at temperature 0.7, so single-run checks prove little — repeat them.
- 2026-08-13 — ⚠️ The Gemini free tier rate-limits aggressively: the cap is ~20 requests per **minute** (`generate_content_free_tier_requests`), and it trips constantly during development. Correction to an earlier note here: this was first recorded as a *daily* exhaustion, which was wrong — the 429 body reads `limit: 20 ... Please retry in Ns`. The adapter now parses that retry hint into the user-facing message instead of guessing. In practice the window can outlast the hint, which is exactly why the Groq fallback was added. Usage is visible at https://ai.dev/rate-limit.

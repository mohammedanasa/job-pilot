# Memory — Feature 08 (Resume PDF Generation from Profile)

Last updated: 2026-08-14

## What was built

**Feature 08 — Resume PDF Generation from Profile**, via `/architect feature 8` then full implementation:

- `migrations/20260813152602_add-generated-resume-columns.sql` — adds `generated_pdf_url` / `generated_pdf_key` to `profiles`. Applied live via `npx @insforge/cli db migrations up`.
- `lib/resume-pdf.tsx` — pure document module. Internal `ResumeDocument` component + exported `buildResumeDocument()` builder (returns the typed element, not the component, so `app/api/resume/generate/route.ts` stays a plain `.ts` file with no JSX). Palette is literal hex copied from `ui-tokens.md` — CSS vars don't resolve in the PDF engine.
- `app/api/resume/generate/route.ts` — auth guard → read profile (`select("*")`, bodyless POST) → minimal-fields gate (full name + ≥1 role with responsibilities, 422 otherwise) → `generateJson` at temperature 0.7 for prose → `renderToBuffer` → upload to `{userId}/generated-resume.pdf` (separate slot from the uploaded resume) → write `generated_pdf_url`/`generated_pdf_key` → return `{ success, url }`.
- `app/api/resume/download/route.ts` — now takes `?type=generated` to select `generated_pdf_key` instead of `resume_pdf_key`; default behavior unchanged.
- `types/index.ts` — `ProfileData` gains the two new columns; new `GeneratedResumeProse` type (`summary`, `roles: [{ index, bullets[] }]`, matched by array index not company name).
- `components/profile/ResumeSection.tsx` — wired the previously-dead "Generate Resume from Profile" button: loading state, error row, "View generated resume" link on success, disabled + explanatory label when the form is dirty.
- `components/profile/ProfileForm.tsx` — added a `resumeFingerprint` (JSON of all resume-relevant fields, excluding job preferences) compared against a `savedFingerprint` baseline to derive `isDirty`, reset on successful save.
- `package.json` — added `@react-pdf/renderer@4.6.0` (React 19 compatible).
- `context/progress-tracker.md`, `context/ui-registry.md`, `context/library-docs.md` all updated with decisions and corrections (see below).

## Decisions made

- **Two storage slots, not one.** The build plan said to `upsert` onto the same path the uploaded resume occupies (`{user_id}/resume.pdf`). Rejected — it would destroy the user's original file and repoint `resume_pdf_key`, making Feature 07's extraction read our own AI prose back as if it were the user's resume. Generated PDFs live at a separate path/columns entirely.
- **Route reads the DB, not the request body** (bodyless POST, like `/extract`). A dirty form disables the Generate button rather than the route accepting arbitrary unsaved form state.
- **Gate is minimal (name + 1 role), not `is_complete`.** `is_complete` demands fields (salary expectation, cover letter tone) that never appear on a resume and would block generation for no good reason.
- **Bound the model's output, don't truncate the render.** Summary ≤400 chars, ≤3 bullets/role, ≤3 roles — enforced in the JSON schema so the model produces complete bounded prose rather than the layout engine cutting a bullet mid-sentence.
- **Model writes prose only.** Names, dates, employers, skills, education are copied verbatim from the profile; only `summary` and per-role `bullets` come from AI. Roles matched back by array `index`, not company name (duplicate employers are common).
- **`lib/resume-pdf.tsx`, not `components/`.** Keeps `@react-pdf/renderer` out of any path a client component could import, and keeps the API route free of JSX per `architecture.md`'s "app/ owns no UI logic" rule.
- **Return a URL, not raw bytes** — `{ success, url }`, mirroring the existing upload/extract routes, with the browser showing a link rather than auto-downloading.

## Problems solved

- **The InsForge SDK's `storage.upload()` takes exactly two arguments — no options object, no `upsert` flag** — contrary to what `library-docs.md` and the build plan said. Verified directly: uploaded the same object key three times via the CLI and read it back — writes silently overwrite. This is what makes resume regeneration after a profile edit actually work. `library-docs.md` corrected.
- **`react-hooks/error-boundaries` lint error** on JSX inside a route's try/catch (`renderToBuffer(<ResumeDocument .../>)`). Fixed by moving all JSX into `lib/resume-pdf.tsx` behind a `buildResumeDocument()` builder that returns a properly-typed `ReactElement<DocumentProps>` — `createElement()` alone doesn't produce that type, since it infers from the component's props, not its return type.
- **First-person leakage in AI-generated summaries** ("I lead platform teams...") despite a third-person instruction buried in a rule list. Fixed by pulling it out into an explicit no-pronoun instruction with a positive/negative example; verified clean across three consecutive live Groq runs at temperature 0.7.
- **`__pdfprobe` route returned 404** — Next treats `_`-prefixed folders under `app/` as private/excluded from routing. Renamed to `pdfprobe` (no leading underscore) to actually reach the route handler during verification.

## Current state

- Feature 08 complete. `npm run lint` and `npm run build` both pass from a clean `.next`.
- **Verified live, not just built:**
  - `renderToBuffer` runs successfully **inside the Next dev server under Turbopack** (via a temporary probe route, since deleted) — confirmed `@react-pdf/renderer` needs **no** `serverExternalPackages` entry, unlike pdf-parse.
  - The rendered PDF was visually inspected (converted to PNG) — layout, date formatting, bullets, and one-page fit all correct.
  - The prose JSON schema (nested objects, integer `index`, bounded arrays) verified against live Groq with strict `json_schema` mode.
  - `/api/resume/generate` confirmed to load in the real route table and correctly reject unauthenticated calls with 401.
- **Not verified:** the full authenticated browser path (click Generate → real profile → AI → upload → DB → link appears) has not been exercised end to end in a real session — this is the same class of gap that hid Feature 07's Turbopack bug, so it's the first thing to check next.
- Migration `20260813152602` is applied and confirmed live (`generated_pdf_url`/`generated_pdf_key` present on `profiles`).
- **Features 06, 07, and 08 are all still UNCOMMITTED.** Last commit remains `8c106a7` (Feature 04 schema). Developer was asked whether to commit and had not yet answered when this session ended.

## Next session starts with

1. `/remember restore`
2. **Answer/resolve: commit Features 06, 07, 08.** Three features deep in the working tree — this is the top risk carried over from last session too.
3. **Do the one unverified check**: log in for real, fill/save a profile with at least one role, click "Generate Resume from Profile" in the browser, confirm the link appears and the downloaded PDF is correct. Given the Feature 07 precedent (build passed, feature was completely broken at runtime), don't mark Feature 08 fully trustworthy until this happens.
4. Then Feature 09 — Find Jobs Page, full UI, mock data only (Phase 3 start). No logic yet per the build plan.

## Open questions

- Same two carried from before, still unresolved:
  - Completion percentage computed in two places (`app/profile/page.tsx` banner vs. `actions/profile.ts` `is_complete`) against separate nine-item lists — consolidating deliberately deferred as a scope call.
  - `scripts/setup-db.sql` may still duplicate the migration — worth checking/deleting if so.
- New: no PostHog event was added for resume generation (`resume_generated` isn't on the approved whitelist in `code-standards.md`). Left out deliberately — adding to the whitelist is a product call, not an implementation default.

# Memory — Feature 10 (Adzuna Job Discovery)

Last updated: 2026-08-14

## What was built

**Feature 10 — Adzuna Job Discovery**, planned via `/architect` then implemented, wiring the Find Jobs page to real search/scoring/persistence:

- `lib/utils.ts` — new file (mandated by `code-standards.md` since Feature 01 but never created). Exports `MATCH_THRESHOLD = 70` and `formatRelativeDate()`.
- `lib/adzuna.ts` — `AdzunaJob` type, `detectCountry()` (keyword map: uk/london→gb, australia/sydney→au, canada/toronto→ca, else us), `searchJobs()`.
- `agent/types.ts` — `ScoredJob`, `DiscoverJobsResult`.
- `agent/matcher.ts` — `scoreJobs()`: one batched `generateJson` call scores up to 10 jobs at once, results mapped back by array `index` (same pattern as Feature 08's resume bullets).
- `agent/adzuna.ts` — `discoverJobs()` orchestration: creates `agent_runs` row → calls Adzuna → dedupes against user's existing `jobs.source_url` → calls `scoreJobs()` → inserts all scored jobs (not just strong matches) → updates `agent_runs` to completed/failed. Never throws; logs failures to `agent_logs`.
- `app/api/agent/find/route.ts` — rewritten: added a minimal-profile gate (skills + title-or-role required, 422 if unmet) before any AI call, calls `discoverJobs`, fires `job_found` once per saved job, returns `{ found, saved, strongMatches }`.
- `app/find-jobs/page.tsx` — now queries the real `jobs` table for the current user (newest-first) instead of `MOCK_JOBS`.
- `components/find-jobs/JobsTable.tsx` — retyped from `MockJob` to real `JobRow` (`types/index.ts`); added an empty state (centered icon + text) for zero-jobs users, per `ui-rules.md`'s empty-state rule.
- `components/find-jobs/SearchControls.tsx` — now `"use client"`: controlled inputs, submit handler, loading spinner, real success banner ("Found N jobs — M strong matches") and a new error banner (`bg-error`/`text-error-foreground` — the only error token available, no `-lightest` variant exists unlike success/info).
- `types/index.ts` — added `JobRow` type matching the `jobs` table schema.
- `lib/mock-jobs.ts` — deleted, nothing imports it anymore.
- Docs updated: `progress-tracker.md` (Feature 10 marked done, decision log, verification notes, the mid-session bug fix), `ui-registry.md` (Feature 09 entry trimmed to what's still true, new Feature 10 entry), `code-standards.md` (env var table — `OPENAI_API_KEY` row replaced with `GEMINI_API_KEY`/`GROQ_API_KEY`/`AI_PROVIDER`, which was already stale from the Feature 08-era provider switch).

## Decisions made

Resolved via `/architect` before building, all reasoned from downstream Feature 11/12 needs rather than the build plan's literal wording:

- **All scored jobs are saved, not just strong (≥70) matches.** Feature 11's Low Match filter needs weak matches to exist in the DB. Banner copy changed from the build plan's implied "saved M strong matches" to "Found N jobs — M strong matches."
- **Scoring is one batched AI call per search, not one call per job.** Verified live against Groq at realistic 10-job scale (see Problems Solved). Keeps it to 1 request against a 30 RPM free tier instead of 10.
- **The jobs table is wired to real DB data in this feature**, not deferred to Feature 11 as the build plan scoped it — otherwise a successful search would be invisible in the UI, same shape as the Feature 07 failure.
- **Duplicates skipped by `source_url`** against the user's existing rows, checked before scoring (saves AI quota on repeat searches). No new migration/column.
- **Profile gate: skills + (current title or ≥1 work experience)**, not `is_complete` — mirrors Feature 08's precedent; `is_complete` also demands salary expectation and cover letter tone, irrelevant to matching.
- **`responsibilities`, `requirements`, `nice_to_have`, `benefits`, `about_company` are left null on inserted rows.** Adzuna's ~500-char snippet doesn't support them; inventing them via AI would render as fact on the Job Details page. **Feature 12 must render empty states for these five fields — this is a real handoff, not a nice-to-have.**

## Problems solved

**Mid-session bug, found by the developer's own browser testing, fixed via `/recover` (diagnosed as Failure Mode 1 — isolated, specific, first attempt):**

`agent/matcher.ts`'s scoring prompt had no input or output bound. Real Adzuna descriptions (up to several hundred words) times up to 10 jobs, plus a full `work_experience` JSON dump, either tripped Groq's request-size limit outright (`HTTP 400`, silently fell over to Gemini and took 44s) or exhausted the fixed 4000-token reply budget mid-batch (`response truncated`, surfaced to the user as "The AI response was cut short").

My original verification during the build only tested a 2-job toy example — proved the schema *shape* worked, not that it survives *real data volume*. Those are different claims and I conflated them.

**Fix:** capped each job description at 600 chars before prompting (`MAX_DESCRIPTION_LENGTH`), reduced `work_experience` in the prompt to a short "title at company" list instead of the full JSON blob, tightened `matchReason` to 1-2 sentences/≤200 chars (was "one paragraph"/≤400), capped skill arrays at 8 items (was 15), raised `maxOutputTokens` 4000→6000. Re-verified live against Groq with 10 real, full-length, untruncated Adzuna descriptions — `finish_reason: "stop"`, all 10 scores returned correctly indexed.

**Lesson for future AI-call features in this project: verify at realistic data volume, not a toy example.** A 2-item test proves the schema parses; it does not prove the prompt fits the model's actual limits under real input sizes. Re-check this same class of risk before Feature 13's company-research synthesis, which also fans multiple sources into one call.

## Current state

- Feature 10 code complete, including the post-testing bug fix. `npm run lint` and `npm run build` both pass.
- Verified live outside the browser (no OAuth automation available — same limitation Feature 09 had): Adzuna search confirmed against the real API; Groq scoring confirmed against the real API at both toy scale and, after the bug, at realistic 10-job scale; route auth/validation (400/401) confirmed against the running dev server.
- **The developer then tested in the real browser and hit the scoring-prompt bug** (see Problems Solved) — this is the first real end-to-end browser signal this feature has had. The fix has been re-verified against the live Groq API but **not yet re-confirmed by the developer in the browser** — that loop isn't closed yet.
- **Feature 10 is entirely uncommitted**, by explicit developer choice — held pending browser sign-off, per this session's decision to wait rather than commit speculatively. Note Feature 09 (which prior memory had flagged as uncommitted for three sessions running) was committed at some point outside this conversation as `6b994f1` — the multi-session uncommitted-backlog problem resolved itself and does not need to be re-flagged.

## Next session starts with

1. `/remember restore`
2. **Get the developer's confirmation that the re-run search actually works now** — banner shows real counts, table fills with real scored jobs, no more truncation/400 errors. This is the loop left open at session end.
3. Once confirmed: commit Feature 10 (`lib/utils.ts`, `lib/adzuna.ts`, `agent/`, the modified route/page/components, `types/index.ts`, doc updates, `lib/mock-jobs.ts` deletion).
4. Then Feature 11 — Filter + Sort + Pagination, wiring `JobsFilterBar` and `Pagination` (currently still inert/static) to the same `jobs` query already in `app/find-jobs/page.tsx`.

## Open questions

- Carried forward, still unresolved:
  - Completion percentage computed in two places (`app/profile/page.tsx` banner vs. `actions/profile.ts` `is_complete`) against separate nine-item lists — consolidating deliberately deferred as a scope call.
  - `scripts/setup-db.sql` may still duplicate the migration — worth checking/deleting if so.
- New from this session:
  - Salary formatting (`$160k - $200k`) is US-currency-shaped regardless of detected country — a `gb`/`au`/`ca` search will show a `$` sign on a job actually priced in £/A$/C$. Known, not fixed — flagged as a limitation during planning, not addressed in code.
  - Country detection in `lib/adzuna.ts` is a small hardcoded keyword list, not exhaustive — fine for now, would need revisiting if international search becomes a real use case.
  - Feature 13 (company research) fans three sources into one AI call similarly to what broke here — worth deliberately checking its prompt size against real data before considering it "verified," not just a toy schema check.

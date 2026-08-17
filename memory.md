# Memory — Feature 17 (Analytics Charts — Real Data, final build-plan feature)

Last updated: 2026-08-15

## What was built

**Feature 17 — Analytics Charts**, built via `/architect` after investigating and discarding the build plan's specified data source:

- `lib/analytics-charts.ts` — new. Three pure functions: `buildJobsFoundOverTime`, `buildCompanyResearchActivity`, `buildMatchScoreDistribution`. No DB access, matching the `dashboard-stats.ts`/`recent-activity.ts` `lib/` boundary.
- `app/dashboard/page.tsx` — Feature 15's existing `jobs` query extended with `company_researched_at`; three chart-builder calls added; both `MOCK_*` imports removed.
- `components/dashboard/AnalyticsCharts.tsx` — `ChartCard` now takes `hasData`/`emptyMessage`; all three chart components take real `DayCount`/`ScoreRangeCount` types from `lib/analytics-charts.ts` instead of `Mock*` types from the now-deleted mock file. Added `allowDecimals={false}` to all Y axes (integer counts).
- `lib/mock-dashboard.ts` — deleted. Was already emptied of stats/activity mocks by Features 15/16; this was its last consumer.
- `context/library-docs.md` — PostHog section corrected: removed a `matchScore` capture-property example that was never actually implemented in `app/api/agent/find/route.ts`, added a note documenting that PostHog is write-only in this codebase (no query API, no MCP auth, no personal API key).
- `context/progress-tracker.md`, `context/ui-registry.md` — Feature 17 entries added; build plan marked fully complete (all 17 features, all 5 phases).

## Decisions made

- **PostHog was ruled out entirely, not partially.** Four independent findings, all negative: `posthog-node` 5.38.2 has no query/insights/HogQL method in its public API (verified against the installed `.d.ts`); the PostHog MCP server needs OAuth that isn't granted; `.env.local` has only the write token and ingestion host, no personal API key or project ID; and even with full access, `job_found`'s actual captured properties (`{ userId, source }`) never included `matchScore` in the first place, so the Match Score chart had no PostHog data behind it regardless of API access. This was investigated and confirmed with the developer before `/architect` was invoked, not discovered mid-build.
- **All three charts wired to the InsForge `jobs` table instead of PostHog.** Feature 15's existing dashboard query already had `match_score` and `found_at`; only `company_researched_at` (Feature 16's column) needed adding. No new query, no new round trip, no new dependency, no new credentials.
- **Day buckets are UTC**, not the viewer's local timezone — a Server Component can't read browser timezone, and `lib/utils.ts`'s `formatRelativeDate()` already set the timezone-naive precedent in this codebase. Accepted as consistent with existing behavior, not a new gap introduced by this feature.
- **Both day-bucketed charts always emit their full window with zero-fill** (30 days for Jobs Found Over Time, 7 for Company Research Activity) rather than only days with data — a zero-activity day is a real bar, not a gap.
- **Match Score Distribution bucket boundaries are exclusive except the top range's upper bound**, so a score of exactly 60 lands only in "60-70%" and 100 is captured by "90-100%" rather than falling outside every bucket.
- **`hasData` is a separate prop from `data`, computed by the caller from the raw `jobs` array**, not derived by checking if every bucket in `data` is zero. This distinguishes "brand new account, zero jobs ever" (true empty state) from "5 real jobs, all outside the 30-day window" (a legitimate all-zero chart that isn't actually empty).
- **New chart empty state matches `RecentActivity.tsx`'s existing empty-state text style exactly** (`text-sm font-medium text-text-muted`, centered in the same `h-64` slot) — establishes one dashboard-wide empty-state look rather than a per-component variant.

## Problems solved

No implementation bugs this session — `lib/analytics-charts.ts` passed its `tsx` verification run on the first attempt (window lengths, zero-fill, boundary bucketing, out-of-window exclusion all correct immediately). The real problem solved was investigative: confirming PostHog genuinely has no query path available in this codebase before writing any code against it, rather than discovering that mid-build the way Features 10/13 discovered their gaps.

## Current state

- **The entire build plan is complete.** All 17 features across all 5 phases are code-complete. `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass cleanly.
- `/dashboard` still builds as `ƒ` (dynamic) and still 307-redirects unauthenticated requests.
- **First genuine live browser verification of any dashboard feature happened this session, by accident.** A separate dev server (from an earlier, unrelated session) was found already running with a real authenticated user actively on `/dashboard`/`/find-jobs/…` while this feature was being built. Its logs showed transient `MOCK_COMPANY_RESEARCH_ACTIVITY is not defined` errors at the exact moment `lib/mock-dashboard.ts` was deleted mid-edit (expected Turbopack HMR lag), then clean recompiles afterward — meaning that real user's real dashboard load, with their actual DB data, rendered successfully against this feature's finished code. This is the first time any feature in the whole dashboard phase has had genuine logged-in browser confirmation rather than a synthetic-data screenshot.
- No Playwright/screenshot MCP tool was available this session (unlike Features 09–14, which used one), so pixel-level visual comparison wasn't repeated for Feature 17. Verification instead used: (1) pure-function tests under `tsx`, (2) a temporary `dev-preview-charts` route inspected via `curl`/HTML grep for correct titles and empty-state copy, (3) the live authenticated render described above. The temporary route was deleted; nothing was left in the final build.
- Nothing has been committed. Features 13 through 17 are all still uncommitted working-tree changes, held pending developer sign-off — same practice as every session before this one.

## Next session starts with

1. `/remember restore`
2. **There is no next planned feature — the build plan is finished.** The developer needs to decide what comes next: a real end-to-end browser QA pass (now genuinely possible per the live verification above, unlike every earlier feature), a commit/PR strategy for the 5 uncommitted features (13–17), or deployment. This is a developer decision point, not a default next build-plan line item — don't assume which one without asking.
3. If real PostHog querying is ever wanted for a future feature (a "Feature 18" beyond the original plan), the three blockers documented in `library-docs.md`'s PostHog section need closing first: authorize the PostHog MCP server, or mint a personal API key (`phx_…`, `query:read` scope) plus find the numeric project ID, and decide whether to also start capturing `matchScore` on `job_found` events (currently not sent).

## Open questions

- Carried forward, still unresolved:
  - Completion percentage computed in two places (`app/profile/page.tsx` banner vs. `actions/profile.ts` `is_complete`) against separate nine-item lists — consolidation still deliberately deferred.
  - `scripts/setup-db.sql` may still duplicate the migration — never checked.
  - Salary formatting is US-currency-shaped regardless of detected country (Feature 10) — known, not fixed.
  - `lib/html-text.ts`'s HTML stripping is hand-rolled regex, not a real parser (Feature 13) — works on tested sites, not guaranteed elsewhere.
  - The ATS blocklist (Feature 13, 12 hosts) is not exhaustive.
- New from this session:
  - **The dashboard has never been seen by the developer's own eyes with real data, only inferred from logs.** The live browser session this session observed belonged to whatever session/window was already open — its outcome (a clean render) was confirmed via server logs, not by the developer or this session actually looking at the rendered page. A deliberate one-time click-through by the developer, now that all 5 dashboard features are wired to real data, would be the highest-value remaining verification step for this whole phase.
  - **No Playwright/browser screenshot tool was available this session** — unclear if that's a permanent environment change or a one-off gap. Worth checking at the start of the next session if visual screenshot verification is needed again.
  - `job_found` PostHog events still don't carry `matchScore`, `jobTitle`, or any other property beyond `{ userId, source }` — this was documented as a correction to stale docs, not fixed, since nothing currently reads it back out. If PostHog querying is ever added later, this capture call will need revisiting too.

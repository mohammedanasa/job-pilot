<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into JobPilot. Key changes made in this run:

- **`lib/posthog-client.ts`** — Fixed `api_host` to use the `/ingest` reverse proxy (not the direct PostHog host), added `ui_host: "https://eu.posthog.com"` and the required `defaults: "2026-01-30"` option.
- **`lib/posthog-server.ts`** — Added `server_auth_completed` to the typed `PostHogEventName` union so the new OAuth server event passes TypeScript checks.
- **`components/auth/LoginForm.tsx`** — Added `posthog.capture("oauth_initiated", { provider })` when the user clicks a Google or GitHub sign-in button.
- **`components/auth/AuthCallback.tsx`** — Added `posthog.capture("user_signed_in", { method: "oauth" })` after a successful OAuth exchange (alongside the existing `identifyPostHogUser` call), and `posthog.capture("auth_failed", { reason, stage })` on all failure paths.
- **`components/profile/ProfileLogoutButton.tsx`** — Added `posthog.capture("user_signed_out")` immediately before the existing `resetPostHogUser()` call.
- **`app/api/auth/oauth/route.ts`** — Added server-side `capturePostHogEvent({ event: "server_auth_completed", … })` after the OAuth code exchange succeeds, capturing the user ID and email.
- **`app/api/agent/research/route.ts`** — Activated the previously commented-out `capturePostHogEvent({ event: "company_researched", … })` call and added the missing import.

| Event | Description | File |
|-------|-------------|------|
| `oauth_initiated` | User clicked a social login button (Google or GitHub) to start the OAuth flow. | `components/auth/LoginForm.tsx` |
| `user_signed_in` | User completed OAuth and successfully signed into JobPilot. | `components/auth/AuthCallback.tsx` |
| `auth_failed` | OAuth callback encountered an error and the sign-in could not be completed. | `components/auth/AuthCallback.tsx` |
| `user_signed_out` | User clicked the log-out button and signed out of their session. | `components/profile/ProfileLogoutButton.tsx` |
| `server_auth_completed` | Server exchanged OAuth code and issued auth cookies, completing the sign-in on the server side. | `app/api/auth/oauth/route.ts` |
| `job_search_started` | User submitted a job-search request with a job title and location. | `app/api/agent/find/route.ts` |
| `company_researched` | User triggered company research on a specific job, generating a research dossier. | `app/api/agent/research/route.ts` |

## Next steps

We've built a dashboard and five insights to keep an eye on user behaviour and key conversion metrics:

- [Analytics basics (wizard) dashboard](https://eu.posthog.com/project/195407/dashboard/766320)
- [Sign-in conversion funnel](https://eu.posthog.com/project/195407/insights/CkG4MaMQ) — oauth_initiated → user_signed_in conversion rate
- [Daily sign-ins](https://eu.posthog.com/project/195407/insights/coWZ4fQt) — unique users signing in per day
- [Job searches over time](https://eu.posthog.com/project/195407/insights/v36FiYTA) — total job search requests submitted
- [Auth failures](https://eu.posthog.com/project/195407/insights/r90hS6Z7) — failed sign-in attempts over time
- [Company research requests](https://eu.posthog.com/project/195407/insights/0eS0Wdhl) — how often users research companies on listings

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the current `identifyPostHogUser` call is only in the OAuth callback. If users return with an existing session cookie, their server-side identity should still be correlated (e.g., pass the user ID from `getCurrentUser()` to a client-side identify call in a layout or dashboard page).

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
</wizard-report>

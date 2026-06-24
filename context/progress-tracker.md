# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 03 PostHog Initialization
**Next:** 04 Database Schema

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [ ] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

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

---

## Notes

- 2026-06-06 — `npm run build` passes for the completed homepage.
- 2026-06-07 — `npm run build` passes for InsForge OAuth auth, callback handling, refresh route, protected routes, and placeholder protected pages.
- 2026-06-22 — `npm run build` passes after moving OAuth completion to server-owned cookie exchange.
- 2026-06-22 — `npm run lint` and `npm run build` pass after auth review fixes.
- 2026-06-22 — `npm run lint` and `npm run build` pass after explicit return type cleanup.
- 2026-06-22 — `npm run lint` and `npm run build` pass for Feature 03 PostHog Initialization.
- 2026-06-22 — `npm run lint` and `npm run build` pass after adding profile page logout with SSR auth cookie clearing.

# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 06 Profile Save Logic
**Next:** 07 AI Profile Extraction from Resume

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
- 2026-08-12 — Feature 04 rebuilt on a new InsForge backend after the original database was lost. New project `8xcfj34w` (us-east) replaces `4brsdh32` (ap-southeast). Schema recreated from `migrations/20260812175451_create-schema.sql`; the old `20260624131107` migration was deleted.
- 2026-08-12 — `profiles` rows are now created by an `on_auth_user_created` trigger on `auth.users` instead of only by `saveProfile`. All three other tables' `user_id` columns reference `profiles(id)`, so a user without a profile row could not own jobs — signup now guarantees the row exists. `profiles.email` is populated by this trigger and is never written by app code.
- 2026-08-12 — RLS policies scoped `TO authenticated` using `(SELECT auth.uid())` subquery form, paired with explicit `GRANT`s. `anon` has all privileges revoked on all four tables — every route is behind auth.
- 2026-06-24 — Feature 05 Profile Page full UI built with mock data. SVG donut ring completion banner, drag-and-drop resume upload section, full ProfileForm with Personal Info, Professional Info (skills autocomplete from hardcoded list), Work Experience (1 default card, add up to 3), Education, and Job Preferences sections. No save logic — that is Feature 06.
- 2026-08-13 — Feature 06 saves through the `saveProfile` Server Action in `actions/profile.ts`, which upserts the whole form as one row and calls `revalidatePath('/profile')`. `profile_completed` fires only on the transition into completeness — the action reads the existing `is_complete` first so re-saving an already-complete profile does not re-fire the event.
- 2026-08-13 — Resume upload is a Route Handler (`app/api/resume/upload/route.ts`), not the Server Action, because Server Actions are a poor fit for multipart file bodies. It persists `resume_pdf_url` and `resume_pdf_key` immediately on upload, independent of Save Profile, so a resume is never lost by navigating away without saving.
- 2026-08-13 — The `resumes` bucket is private, so a stored URL is not fetchable. `resume_pdf_key` (migration `20260813104026`) holds the storage object key, and all reads go through `app/api/resume/download/route.ts`, which re-authenticates server-side and streams the PDF with `Cache-Control: private, no-store`.
- 2026-08-13 — Completion percentage is computed twice against the same nine required fields: server-side in `app/profile/page.tsx` for the banner, and inside `saveProfile` for the `is_complete` flag. The two lists must stay in sync — if a required field is added, update both.

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

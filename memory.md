# Memory — Feature 02 Auth Complete

Last updated: 2026-06-22 17:24 IST

## What was built

Feature 02 Auth is complete.

Auth infrastructure and pages are in place:
- `lib/insforge-client.ts`
- `lib/insforge-server.ts`
- `app/api/auth/refresh/route.ts`
- `app/api/auth/oauth/route.ts`
- `app/(auth)/login/page.tsx`
- `app/(auth)/callback/page.tsx`
- `components/auth/LoginForm.tsx`
- `components/auth/AuthCallback.tsx`
- `proxy.ts`

Minimal protected placeholder pages exist so auth routing can be verified:
- `app/dashboard/page.tsx`
- `app/profile/page.tsx`
- `app/find-jobs/page.tsx`

Tracking/design docs were updated:
- `context/progress-tracker.md`
- `context/ui-registry.md`

## Decisions made

- Use `@insforge/sdk` and `@insforge/sdk/ssr`, not stale `@insforge/ssr` snippets in older context docs.
- Use Next.js 16 `proxy.ts` for request interception instead of legacy `middleware.ts`.
- Post-login destination is `/dashboard`.
- OAuth callback route is `/callback`.
- OAuth initiation uses `skipBrowserRedirect: true`, stores the PKCE verifier in `sessionStorage`, then redirects manually.
- OAuth completion is server-owned: `/api/auth/oauth` exchanges the code and writes InsForge auth cookies before the client routes to `/dashboard`.
- PostHog was removed from Feature 02 scope. Feature 03 should add PostHog deliberately from `context/build-plan.md`.

## Problems solved

- Original browser-only OAuth completion left users appearing logged out because SSR/proxy could not see server-readable auth cookies.
- Fixed by exchanging the InsForge PKCE code through a Next Route Handler and using `setAuthCookies`.
- Prior review issues were fixed:
  - removed premature PostHog setup/events/packages/rewrite config from Feature 02
  - normalized `/api/auth/oauth` responses to `{ success, data, error }`
  - added controlled route error handling and generic user-safe API errors
  - added explicit return types to auth helpers, auth components, proxy, and protected placeholder pages
  - fixed the homepage JSX escaping lint issue
- UI patterns were imprinted for `Login Form`, `Auth Callback`, and `Protected Placeholder Card`.

## Current state

- `context/progress-tracker.md` marks `02 Auth` complete and `03 PostHog Initialization` next.
- `context/ui-registry.md` has current entries for Auth UI and protected placeholder cards.
- `npm run lint` passes.
- `npm run build` passes.
- No PostHog runtime references remain in `app`, `components`, `lib`, `next.config.ts`, or `package.json`.
- Worktree still contains broader project changes and untracked files from this feature series; do not assume every modified file belongs only to the latest small cleanup.

## Next session starts with

Start Feature 03 PostHog Initialization from `context/build-plan.md`.

Before implementing:
1. Read the required repo context files in `AGENTS.md`.
2. Check current PostHog docs/tooling if available.
3. Add PostHog intentionally using the project event whitelist in `context/code-standards.md`.
4. Re-run `npm run lint` and `npm run build`.

## Open questions

- None for Feature 02 Auth.
- Feature 03 needs a clean PostHog implementation because the previous premature setup was removed.

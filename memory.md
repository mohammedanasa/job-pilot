# Memory — Feature 04 Database Schema Complete

Last updated: 2026-06-24

## What was built

Feature 04 Database Schema is complete.

Migration and schema files created:
- `migrations/20260624131107_create-schema.sql` — applied migration (tracked by InsForge)
- `scripts/setup-db.sql` — standalone reference copy (can be deleted)

Tables live on the InsForge backend:
- `profiles` — with `updated_at` auto-trigger, FK → `auth.users CASCADE`
- `agent_runs` — FK → `profiles CASCADE`
- `jobs` — FK → `profiles CASCADE`, `run_id → agent_runs SET NULL`, CHECK on `source IN ('search','url')`
- `agent_logs` — FK → `agent_runs CASCADE` + `profiles CASCADE`, CHECK on `level IN ('info','success','warning','error')`

Storage:
- `resumes` bucket created (private, Public: No)

Tracking docs updated:
- `context/progress-tracker.md` — Feature 04 marked complete, next is 05

InsForge CLI setup done this session:
- Logged in via `npx @insforge/cli login --user-api-key`
- Linked to project `9206977a-a6a4-48b2-a3a9-acba3294229b` (Job Pilot, 4brsdh32.ap-southeast)
- InsForge CLI skills installed globally (`insforge`, `insforge-cli`, `insforge-debug`, `insforge-integrations`)
- Project config written to `.insforge/project.json`

## Decisions made

- All four tables use `ON DELETE CASCADE` from profiles — orphaned rows have no meaning without a user.
- `profiles.updated_at` is trigger-maintained — application code never needs to set it explicitly.
- `profiles` RLS uses `id = auth.uid()` (the PK is the auth user ID); all other tables use `user_id = auth.uid()`.
- All RLS policies include `WITH CHECK` so writes cannot create rows the user should not own.
- InsForge MCP plugin was not installed — used the InsForge CLI (`npx @insforge/cli`) instead for all infrastructure tasks. Use CLI going forward, not the MCP.
- Migration is the authoritative record; `scripts/setup-db.sql` is a reference copy only.

## Problems solved

- InsForge MCP tools (`run-raw-sql`, `create-bucket`) were not installed as a plugin. Resolved by running `npx @insforge/cli login` + `link`, which installed the CLI skills. All schema work done via `npx @insforge/cli db migrations` and `npx @insforge/cli storage create-bucket`.

## Current state

- All four tables live on InsForge with RLS enabled and verified.
- `resumes` storage bucket exists and is private.
- `npm run lint` and `npm run build` — not run this session (no application code changed, infrastructure only).
- `context/progress-tracker.md` marks Feature 04 complete and Feature 05 next.

## Next session starts with

Start Feature 05 — Profile Page Full UI from `context/build-plan.md`.

Before implementing:
1. Run `/remember restore` to load this context.
2. Read the required context files listed in `AGENTS.md` (including `ui-tokens.md`, `ui-rules.md`, `ui-registry.md`).
3. Run `/architect feature 05` before writing any code.
4. Build full UI with mock data first — no save logic yet (that is Feature 06).

## Open questions

- `scripts/setup-db.sql` is a duplicate of the migration. Can be deleted once the team is comfortable relying on the `migrations/` folder alone.
- `.insforge/project.json` should not be committed — confirm it is in `.gitignore`.

# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Navbar

File: components/layout/Navbar.tsx
Last updated: 2026-06-06

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`                                                          |
| Border           | `border-b border-border`                                              |
| Border radius    | `none`                                                                |
| Text — primary   | `text-text-dark text-sm font-medium leading-5`                        |
| Text — secondary | `none`                                                                |
| Spacing          | `h-16 px-6 gap-8`                                                     |
| Hover state      | `hover:text-accent`                                                   |
| Shadow           | `none`                                                                |
| Accent usage     | `hover:text-accent`, primary CTA uses `bg-overlay-dark text-accent-foreground` |

**Pattern notes:**
Header is full-width with a centered `max-w-[1268px]` inner row. Primary navigation uses color-only hover/active treatment and the CTA uses the dark overlay button pattern from the landing design.

### Footer

File: components/layout/Footer.tsx
Last updated: 2026-06-06

| Property         | Class                                          |
| ---------------- | ---------------------------------------------- |
| Background       | `bg-surface`                                   |
| Border           | `border-t border-border`                       |
| Border radius    | `none`                                         |
| Text — primary   | `text-text-dark text-sm font-medium leading-5` |
| Text — secondary | `none`                                         |
| Spacing          | `px-6 py-14 gap-8`                             |
| Hover state      | `hover:text-accent`                            |
| Shadow           | `none`                                         |
| Accent usage     | `hover:text-accent`                            |

**Pattern notes:**
Footer matches navbar brand/link styling and uses the same centered `max-w-[1268px]` content width.

### Homepage Hero

File: components/homepage/Hero.tsx
Last updated: 2026-06-06

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `landing-soft-bg`, `bg-surface-muted`                                 |
| Border           | `border-b border-border`                                              |
| Border radius    | `none`                                                                |
| Text — primary   | `text-text-slate font-bold leading-[1.05]`                             |
| Text — secondary | `text-text-secondary text-sm font-medium leading-6`                   |
| Spacing          | `px-6 pt-18 pb-12 md:pb-16`                                           |
| Hover state      | `hover:bg-overlay`, `hover:bg-surface-secondary`                      |
| Shadow           | `none`                                                                |
| Accent usage     | CTA uses `bg-overlay-dark text-accent-foreground`                     |

**Pattern notes:**
Hero and bottom CTA share the token-driven `landing-soft-bg` utility. Primary and secondary CTAs should reuse the same dark button and bordered white button classes.

### Homepage Feature Rows

File: components/homepage/FeatureSection.tsx
Last updated: 2026-06-06

| Property         | Class                                                   |
| ---------------- | ------------------------------------------------------- |
| Background       | `landing-grid-bg`, `bg-surface-muted`                   |
| Border           | `border-b border-border`, `border-l-2 border-l-accent`  |
| Border radius    | `none`                                                  |
| Text — primary   | `text-text-dark text-base font-semibold leading-6`      |
| Text — secondary | `text-text-secondary text-sm font-medium leading-6`     |
| Spacing          | `px-8 py-7 md:px-14`                                    |
| Hover state      | `none`                                                  |
| Shadow           | `none`                                                  |
| Accent usage     | Active row uses `border-l-accent`                       |

**Pattern notes:**
Feature sections alternate copy and product imagery across a two-column bordered layout. Active explanatory rows use a thin accent left border; inactive rows keep the same spacing without extra color.

### Homepage Testimonial

File: components/homepage/Testimonial.tsx
Last updated: 2026-06-06

| Property         | Class                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Background       | `landing-grid-bg`                                                   |
| Border           | `border-b border-border`                                            |
| Border radius    | `rounded-sm` for avatar                                             |
| Text — primary   | `text-text-slate-medium font-semibold`, `text-text-primary`         |
| Text — secondary | `text-text-muted text-xs font-normal leading-4`                     |
| Spacing          | `px-6 py-28`                                                        |
| Hover state      | `none`                                                              |
| Shadow           | `none`                                                              |
| Accent usage     | Label uses `text-accent`                                            |

**Pattern notes:**
Testimonials use centered editorial copy on the subtle grid background, with accent uppercase label text and compact author metadata.

### Login Form

File: components/auth/LoginForm.tsx
Last updated: 2026-06-22

| Property         | Class                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                                    |
| Border           | `border border-border`                                                                         |
| Border radius    | `rounded-xl`, `rounded-md` for buttons                                                          |
| Text — primary   | `text-text-primary text-2xl font-semibold leading-8`, `text-text-primary text-sm font-medium`   |
| Text — secondary | `text-text-secondary text-sm font-medium leading-6`                                             |
| Spacing          | `max-w-[420px] p-6`, buttons use `h-11 px-4 gap-3`                                              |
| Hover state      | `hover:bg-surface-secondary`, `hover:bg-overlay`, `disabled:cursor-not-allowed`                 |
| Shadow           | `shadow-sm`                                                                                     |
| Accent usage     | GitHub OAuth uses `bg-overlay-dark text-accent-foreground`; errors use `border-error text-error`; provider marks use `border-border text-text-primary` or `bg-surface text-overlay-dark` |

**Pattern notes:**
Auth forms use a compact centered card with provider buttons stacked vertically. OAuth buttons keep provider mark, label, pending, disabled, and human-readable error states in the same stable dimensions. Secondary provider buttons use bordered white treatment; primary provider buttons use the dark overlay CTA treatment. OAuth initiation stores the PKCE verifier before leaving the app so the callback route can complete a server-owned cookie exchange.

### Auth Callback

File: components/auth/AuthCallback.tsx
Last updated: 2026-06-22

| Property         | Class                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                                  |
| Border           | `border border-border`                                                                       |
| Border radius    | `rounded-xl`, `rounded-md` for action                                                         |
| Text — primary   | `text-text-primary text-2xl font-semibold leading-8`                                          |
| Text — secondary | `text-text-secondary text-sm font-medium leading-6`                                           |
| Spacing          | `max-w-[420px] p-6`, action uses `mt-6 h-10 px-4`                                             |
| Hover state      | `hover:bg-overlay`                                                                            |
| Shadow           | `shadow-sm`                                                                                   |
| Accent usage     | Recovery action uses `bg-overlay-dark text-accent-foreground`                                 |

**Pattern notes:**
Callback UI stays minimal and centered while it posts the OAuth code and PKCE verifier to the server route. Successful completion opens the dashboard only after server-readable auth cookies are written. Callback state mirrors the login card dimensions so OAuth transitions do not visually jump between pages. Recovery actions use the same dark overlay CTA treatment as login primary actions.

### Protected Placeholder Card

File: app/dashboard/page.tsx, app/profile/page.tsx, app/find-jobs/page.tsx
Last updated: 2026-06-22

| Property         | Class                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Background       | `bg-background` page, `bg-surface` card                                                     |
| Border           | `border border-border`                                                                      |
| Border radius    | `rounded-xl`                                                                                |
| Text — primary   | `text-text-primary text-base font-semibold leading-6`                                       |
| Text — secondary | `text-text-secondary text-sm font-medium leading-6`, `text-text-muted text-xs font-normal` |
| Spacing          | `px-6 py-8` page content, `p-6` card, `mt-2` vertical text spacing                         |
| Hover state      | `none`                                                                                      |
| Shadow           | `shadow-sm`                                                                                 |
| Accent usage     | `none`                                                                                      |

**Pattern notes:**
Protected placeholder pages use a full page `bg-background` with the standard top navbar and a centered `max-w-[1268px]` content area. Each empty protected destination starts with one simple white card using the shared surface, border, radius, and shadow pattern; labels are small uppercase muted text, headings are compact section text, and body copy uses the standard secondary text treatment.

### Feature 03 PostHog Initialization

File: instrumentation-client.ts, lib/posthog-client.ts, lib/posthog-server.ts
Last updated: 2026-06-22

No new UI components or visual classes were introduced.

**Pattern notes:**
PostHog initialization and event capture are non-visual infrastructure. Browser setup is centralized in `lib/posthog-client.ts` and loaded from Next.js `instrumentation-client.ts`; server-side event capture is centralized in `lib/posthog-server.ts`.

### Profile Logout Button

File: components/profile/ProfileLogoutButton.tsx
Last updated: 2026-06-22

| Property         | Class                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background       | `bg-surface` for the button and error message                                                                                                       |
| Border           | `border-t border-border` section divider, `border border-border` button, `border border-error` error message                                       |
| Border radius    | `rounded-md` for button and error message                                                                                                           |
| Text — primary   | `text-text-primary text-base font-semibold leading-6`, `text-text-primary text-sm font-medium leading-5`                                           |
| Text — secondary | `text-text-secondary text-sm font-medium leading-6`, `text-text-muted` disabled state, `text-error` error state                                    |
| Spacing          | `mt-6 pt-6`, `gap-4`, button uses `h-10 px-4`, error uses `mt-4 px-3 py-2`                                                                          |
| Hover state      | `hover:bg-surface-secondary`, `disabled:cursor-not-allowed disabled:text-text-muted`                                                                |
| Shadow           | `none`                                                                                                                                              |
| Accent usage     | `none`; destructive/session action stays neutral with a tokenized error state only when sign-out fails                                             |

**Pattern notes:**
Profile session controls live inside the existing profile placeholder card behind a top divider. The logout action uses the bordered secondary button pattern rather than the dark primary CTA so it does not compete with future profile save actions.

### CompletionBanner

File: components/profile/CompletionBanner.tsx
Last updated: 2026-06-24

| Property         | Class                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Background       | `bg-surface`                                                                               |
| Border           | `border border-border`                                                                     |
| Border radius    | `rounded-2xl`                                                                              |
| Text — primary   | `text-sm font-semibold leading-5 text-text-primary`                                        |
| Text — secondary | `text-sm font-medium leading-5 text-text-secondary`                                        |
| Spacing          | `p-6`, missing field tags use `px-3 py-0.5`                                                |
| Shadow           | `shadow-sm`                                                                                |
| Accent usage     | Ring stroke uses `var(--color-error)`; missing field tags use `border-border text-text-secondary` |

**Pattern notes:**
Donut ring is inline SVG — radius 36, circumference-based dashoffset for percentage fill, red error stroke, percentage as SVG text centered at 50/50. Missing field tags are pill-shaped with border and uppercase tracking.

### ResumeSection

File: components/profile/ResumeSection.tsx
Last updated: 2026-08-13

| Property         | Class                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| Background       | `bg-surface`, drag zone uses `bg-surface-secondary` / `bg-accent-muted` on drag   |
| Border           | `border border-border`, drop zone uses `border-2 border-dashed`                   |
| Border radius    | `rounded-2xl` card, `rounded-xl` drop zone, `rounded-md` buttons                  |
| Text — primary   | `text-sm font-medium leading-5 text-text-primary`                                  |
| Text — secondary | `text-xs font-normal leading-4 text-text-muted`                                    |
| Spacing          | `p-6` card, `px-6 py-10` drop zone                                                 |
| Shadow           | `shadow-sm`                                                                        |
| Accent usage     | Generate button uses `bg-accent text-accent-foreground`; drag active uses `border-accent bg-accent-muted` |

**Pattern notes:**
Drop zone switches border/bg on drag-over via `isDragging` state. File name replaces upload prompt text after selection. Select Resume uses secondary button; Generate Resume uses primary accent button aligned to the right.

Extract from Resume (added 2026-08-13) renders only when `uploadState === "success"` — it acts on the stored file, so it cannot appear before one exists. It is a secondary button (`border border-border bg-surface`) to keep Generate Resume the single accent action in the card. Disabled state is `disabled:opacity-60 disabled:cursor-not-allowed`; the inline spinner reuses the drop zone's SVG at `14px` with the label switching to "Reading resume…". Its error text sits directly under the row in `text-sm font-medium text-error`, matching the upload error row.

Generate Resume from Profile (wired 2026-08-13) keeps its accent styling as the card's single primary action, and now follows the same three-part row pattern as Extract: label on the left, button right, error text beneath in `text-sm font-medium text-error`. Its spinner is the same 14px SVG but strokes `--color-accent-light` / `--color-accent-foreground` rather than `--color-border` / `--color-accent`, because it spins on an accent-filled button where the secondary spinner's colours would be invisible. Two disabled sources share one style (`disabled:opacity-60 disabled:cursor-not-allowed`): in-flight generation, and an unsaved form — the latter also swaps the left-hand label to "Save your profile first…" and sets a `title` tooltip, so a disabled button always states its own reason. On success a "View generated resume" link renders below in `text-sm font-semibold text-accent hover:underline`, pointing at `/api/resume/download?type=generated` — never a storage URL, since the bucket is private. It sits apart from the uploaded resume's "View current resume" link so the two documents stay visibly distinct.

### TagInput

File: components/profile/TagInput.tsx
Last updated: 2026-06-24

| Property         | Class                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                              |
| Border           | `border border-border`, `focus-within:border-accent focus-within:ring-1 focus-within:ring-accent` |
| Border radius    | `rounded-md` container, `rounded-full` tags, `rounded-md` dropdown items                 |
| Text — primary   | `text-sm font-medium text-text-primary`                                                   |
| Text — secondary | `placeholder:text-text-muted`                                                             |
| Spacing          | `px-3 py-2` container, `px-3 py-0.5` tags, `px-3 py-2` dropdown items                   |
| Hover state      | `hover:bg-surface-secondary` dropdown items                                               |
| Accent usage     | Tags use `bg-accent-light text-accent`; focus ring uses `ring-accent border-accent`       |

**Pattern notes:**
Tags render as accent-light pills with × remove inside the input container. Autocomplete dropdown appears below as absolute-positioned list. `onBlur` uses 150ms delay to allow `onMouseDown` on dropdown items to fire before close. Add button triggers free-text add when input has value; Enter also triggers autocomplete first match or free-text fallback.

### WorkExperienceCard

File: components/profile/WorkExperienceCard.tsx
Last updated: 2026-06-24

| Property         | Class                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| Background       | `bg-surface-secondary`                                                        |
| Border           | `border border-border`                                                        |
| Border radius    | `rounded-xl`                                                                  |
| Text — primary   | `text-sm font-medium text-text-primary`                                       |
| Text — secondary | `text-xs font-medium uppercase tracking-wide text-text-secondary`             |
| Spacing          | `p-4 gap-4`                                                                   |
| Hover state      | Remove button `hover:text-error`                                               |
| Accent usage     | `checkbox accent-accent`, inputs use `focus:border-accent focus:ring-accent`  |

**Pattern notes:**
Card background is `surface-secondary` to visually distinguish role cards from the parent form surface. End Date field disables when `currentlyWorking` is checked. Remove button only renders when `canRemove` is true (i.e. more than one card exists).

### ProfileForm

File: components/profile/ProfileForm.tsx
Last updated: 2026-06-24

| Property         | Class                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                                       |
| Border           | `border border-border`, section dividers use `border-t border-border`                              |
| Border radius    | `rounded-2xl` card, `rounded-md` inputs/selects/buttons                                            |
| Text — primary   | `text-base font-semibold leading-6 text-text-primary` headings, `text-sm font-medium text-text-primary` body |
| Text — secondary | `text-xs font-medium uppercase tracking-wide text-text-secondary` labels                           |
| Spacing          | `p-6 gap-6` card, `gap-4` within sections, `grid grid-cols-2 gap-4` field pairs                   |
| Shadow           | `shadow-sm`                                                                                        |
| Accent usage     | Save Profile button uses `bg-accent text-accent-foreground`; section headings use no accent        |

**Pattern notes:**
Entire form is a single `"use client"` component with all state co-located. Sections separated by `border-t border-border` dividers within one card. Email field uses `bg-surface-secondary cursor-not-allowed` read-only treatment. Work Experience section manages a `WorkExperience[]` array — add (max 3) and remove (min 1) controlled by length checks. TagInput reused for both Skills and Industries with separate suggestion arrays.

### AppNavbar

File: components/layout/AppNavbar.tsx
Last updated: 2026-08-14

| Property         | Class                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| Background       | `bg-surface`                                                          |
| Border           | `border-b border-border`                                              |
| Border radius    | `none`                                                                |
| Text — primary   | `text-text-dark text-sm font-medium leading-5`, active uses `text-accent` |
| Spacing          | `h-16 px-6 gap-8`, nav items `gap-1.5 pb-4`                           |
| Hover state      | `hover:text-accent`                                                   |
| Shadow           | `none`                                                                |
| Accent usage     | Active item text is `text-accent` with a `bg-accent` underline bar    |

**Pattern notes:**
`"use client"` — the only reason is `usePathname()` to compute active-state. Replaces the marketing `Navbar` on every authenticated page (Dashboard, Profile, Find Jobs); the public `Navbar` component is untouched and still used on the homepage. Each nav item has a small leading `lucide-react` icon (Dashboard: `LayoutGrid`, Find Jobs: `Search`, Profile: `UserRound`) and the active item gets a `text-accent` color change plus a 2px `bg-accent` underline bar (`absolute inset-x-0 -bottom-px h-0.5`), which corrects `ui-rules.md`'s earlier "no underline" note — the delivered Find Jobs design shows one. No marketing CTA renders here, unlike the public Navbar's "Start for free" button.

### Feature 09 — Find Jobs Page (Full UI)

Files: app/find-jobs/page.tsx, components/find-jobs/JobsFilterBar.tsx, components/find-jobs/MatchScoreBar.tsx, components/find-jobs/SourceBadge.tsx, components/find-jobs/Pagination.tsx
Last updated: 2026-08-14 (superseded in part by Feature 10 — see below)

| Property         | Class                                                                              |
| ---------------- | ------------------------------------------------------------------------------------ |
| Background       | `bg-surface` cards, table rows `hover:bg-surface-secondary`                        |
| Border           | `border border-border` cards, `border-b border-border` table rows/filter bar divider |
| Border radius    | `rounded-2xl` cards, `rounded-md` inputs/selects/pagination buttons, `rounded-full` badges and score bar |
| Text — primary   | `text-sm font-medium leading-5 text-text-primary` body/table cells                  |
| Text — secondary | `text-xs font-medium uppercase tracking-wide text-text-secondary` labels/table headers |
| Spacing          | `p-6` search card, `p-4` filter bar/pagination, `px-4 py-4` table cells             |
| Shadow           | `shadow-sm`                                                                        |
| Accent usage     | Find Jobs button `bg-accent text-accent-foreground`; active pagination page `border-accent bg-accent-light text-accent`; Search source badge `bg-accent-light text-accent` |

**Pattern notes:**
`MatchScoreBar` and `SourceBadge` are standalone so the Job Details page (Phase 4) can reuse them directly. Match score color is threshold-based, not gradient: `bg-success` at 90%+, `bg-info` at 80-89%, `bg-warning` below 80% — corrected from two conflicting ranges previously in `ui-rules.md` and `ui-tokens.md` to match the delivered design pixel-for-pixel. Filter bar's "All Matches" / "Match Score" dropdowns are native `<select>` elements styled as compact auto-width pills (`appearance-none` + absolutely-positioned `ChevronDown`), not a custom Radix/shadcn menu — no such primitive is installed yet, and a native select is still inert pending Feature 11. The SOURCE column was added to the table even though the delivered screenshot doesn't show one, because `jobs.source` is a real, constrained DB column (`'search' | 'url'`) — omitting it now would just mean adding it back later.

### Feature 10 — Adzuna Job Discovery (wires Find Jobs to real data)

Files: app/api/agent/find/route.ts, agent/adzuna.ts, agent/matcher.ts, agent/types.ts, lib/adzuna.ts, lib/utils.ts, app/find-jobs/page.tsx, components/find-jobs/SearchControls.tsx, components/find-jobs/JobsTable.tsx
Last updated: 2026-08-14

No new visual patterns — reuses Feature 09's card/table/badge classes exactly. What changed is data and behavior:

- `lib/mock-jobs.ts` is deleted. `app/find-jobs/page.tsx` queries the real `jobs` table for the current user, newest-first. `JobsTable` now takes `JobRow[]` (`types/index.ts`) instead of `MockJob[]`.
- `JobsTable` gained an empty state (per `ui-rules.md`'s "every section that can be empty must have one" rule) — centered `Search` icon + muted text, shown when the user has zero saved jobs. Not designed against a screenshot; kept intentionally minimal per the same rule.
- `SearchControls` is now `"use client"` (controlled inputs, submit handler, loading spinner via `Loader2` with `animate-spin`, disabled state while searching). The static green banner is now conditional on a real result and its copy changed to "Found N jobs — M strong matches" (previously implied only strong matches were saved — see progress-tracker.md decision log). A new error banner reuses `bg-error`/`text-error-foreground` (solid, not `-lightest` — `--color-error` has no light variant, unlike success/info/warning) for request failures and the 422 profile-gate message.

**Pattern notes:**
This feature is data/logic-only by design once the two components above changed — no new component files were created for the find-jobs UI itself. See progress-tracker.md's 2026-08-14 Feature 10 entry for the underlying architecture (batched AI scoring, dedup, profile gate).

### Feature 11 — Filter + Sort + Pagination

Files: app/find-jobs/page.tsx, components/find-jobs/JobsFilterBar.tsx, components/find-jobs/Pagination.tsx, components/find-jobs/JobsTable.tsx, components/find-jobs/SearchControls.tsx, lib/job-filters.ts

Last updated: 2026-08-14

No new visual tokens — every class from Feature 09 is preserved exactly. What changed is that the controls now do something. Three additions worth matching elsewhere:

| Addition | Class |
| --- | --- |
| Clickable pagination page / Prev / Next | existing `pageButtonClass` + `hover:bg-surface-secondary` |
| Disabled Prev / Next at the bounds | existing `pageButtonClass` + `text-text-muted`, rendered as `<span>` not `<Link>` |
| Clear filters link (filtered empty state) | `text-sm font-semibold text-accent hover:underline` |

**Pattern notes:**
`JobsFilterBar` became `"use client"` — selects call `router.push`, the text input debounces 300 ms into `router.replace` so a burst of typing leaves one history entry rather than eight. It takes `match`/`sort`/`q` as **props** and deliberately does **not** call `useSearchParams()`: in Next 16 that requires a `Suspense` boundary or the production build fails while dev passes. Any control change resets `page` to 1.

`Pagination` stayed a Server Component and now renders `<Link>`s (prefetching, middle-click, no JS). It returns `null` at zero results — the table's empty state speaks for the section instead — and hides the page-number strip when there is only one page, so the "Showing X to Y of Z" line stands alone. The strip collapses to first / current±1 / last beyond 7 pages, preserving the `1 2 3 … 8` shape of the Feature 09 mock. The active page reuses `border-accent bg-accent-light text-accent` and carries `aria-current="page"`.

`JobsTable` now takes `isFiltered` and has **two** empty states, per `ui-rules.md`'s empty-state rule: `Search` icon + "No jobs yet…" when the user has nothing at all, and `SlidersHorizontal` + "No jobs match these filters." + a Clear filters link when a filter is active. Same centered `px-4 py-16` layout for both.

### Feature 12 — Job Details Page (Full UI)

Files: app/find-jobs/[id]/page.tsx, components/job-details/JobInfo.tsx, components/job-details/MatchScore.tsx, components/job-details/JobDescription.tsx, components/job-details/CompanyResearch.tsx, components/job-details/JobActions.tsx, components/find-jobs/JobsTable.tsx

Last updated: 2026-08-14

| Property         | Class                                                                              |
| ---------------- | ------------------------------------------------------------------------------------ |
| Background       | `bg-surface` cards                                                                  |
| Border           | `border border-border` cards, `border-t border-border` divider inside Company Research |
| Border radius    | `rounded-2xl` cards, `rounded-md` buttons/links, `rounded-full` badges, `rounded-xl`/`rounded-lg` icon tiles |
| Text — primary   | `text-sm font-medium leading-6 text-text-primary` body, `text-xl font-semibold leading-7 text-text-primary` job title |
| Text — secondary | `text-xs font-medium uppercase tracking-wide text-text-secondary` section labels    |
| Spacing          | `p-6` cards, `gap-4` info card row, `gap-6` page sections                          |
| Shadow           | `shadow-sm`                                                                         |
| Accent usage     | Gap skills pills `bg-accent-muted text-accent`; Apply Now button `bg-accent text-accent-foreground`; Research Company button `bg-accent text-accent-foreground` (disabled) |

**Pattern notes:**
All Server Components, no `"use client"` anywhere in this feature — the page fetches once and every child is presentational. `JobInfo.tsx` renders the header card (logo tile, title, company, match badge, View Job Post) plus a 4-card info row (`Salary Est.` / `Location` / `Job Type` / `Date Found`) using a small local `InfoCard` with a tinted icon tile per field (`bg-success-lightest`/`bg-info-lightest`/`bg-accent-muted`/`bg-surface-secondary`). The header match badge is a **status** badge — High/Low at `MATCH_THRESHOLD` (`bg-success-lightest`/`text-success-foreground` vs `bg-surface-secondary`/`text-text-secondary`) — deliberately different from `MatchScoreBar`'s 90/80/below gradient tiers, because the delivered design's 85% pill is green and only the threshold rule reproduces that.

`MatchScore.tsx` splits AI Match Reasoning and Required Skills vs Your Profile into two cards, each conditionally rendered (returns `null` from the whole component if there's nothing to show — an unscored job renders neither). Matched skills use `bg-success-lightest`/`text-success-foreground` with a literal `✓`; gap skills use `bg-accent-muted`/`text-accent` with a literal `×` — **not** red/orange, correcting `build-plan.md`'s wording to match both `ui-tokens.md`'s existing Skills Badges table and the delivered design pixel-for-pixel.

`JobDescription.tsx` renders only `about_role` — no Responsibilities/Requirements/Nice to Have/Benefits/About Company sections, since those five `jobs` columns are null on every Adzuna-sourced row and the delivered design shows a single description card.

`JobDescription.tsx` also takes `applyUrl` (Feature 12 `/review` fix, 2026-08-14): Adzuna's search API caps `description` at exactly 500 characters server-side, trailing it with its own `…` — confirmed live against multiple listings, not a truncation this codebase performs. There is no more text to recover client-side, so a description whose length is `>= 500` renders a `text-sm font-semibold text-accent hover:underline` link — "Read the full description on the original posting →" — to `external_apply_url`, the same Adzuna redirect already used by View Job Post and Apply Now.

`CompanyResearch.tsx` originally always rendered the "No research yet" empty state with the Research Company button `disabled`, since Feature 13 owned making it work — **superseded by Feature 13 below**, which wires the button up.

`JobActions.tsx` is the full-width Apply Now bar at the bottom of the page, outside any card, matching the design.

The Find Jobs table gained navigation: `JobsTable.tsx`'s company cell is now a `<Link href={\`/find-jobs/${job.id}\`}>` with `after:absolute after:inset-0` on a `relative` `<tr>`, stretching the click target to the full row without wrapping the `<tr>` itself in an anchor (invalid HTML). No new classes — reuses the existing hover/border row treatment.

### Feature 13 — Company Research Agent

Files: components/job-details/CompanyResearch.tsx, app/find-jobs/[id]/page.tsx

Last updated: 2026-08-15

| Property         | Class                                                                              |
| ---------------- | ------------------------------------------------------------------------------------ |
| Background       | `bg-surface` card, `bg-surface-secondary` tag pills, `bg-success-lightest` Your Edge highlight box |
| Border            | `border border-border` card, `border-t border-border` divider per section          |
| Border radius     | `rounded-2xl` card, `rounded-md` button, `rounded-full` icon badges/tag pills, `rounded-xl` notice banners |
| Text — primary    | `text-sm font-medium leading-6 text-text-primary` body copy                       |
| Text — secondary  | `text-sm font-semibold leading-5 text-text-primary` section headings, `text-xs font-medium uppercase tracking-wide text-text-secondary` Sources label |
| Spacing           | `p-6` header, `px-6 py-5` per section, `gap-2` icon+heading rows                   |
| Shadow            | `shadow-sm`                                                                         |
| Accent usage      | Section icon badges `bg-accent-muted text-accent`; Research/Re-run button `bg-accent text-accent-foreground`; grounding notice `bg-info-lightest text-info-foreground`; error banner `bg-error text-error-foreground` (same as `SearchControls.tsx`, no `-lightest` variant exists for error) |

**Pattern notes:**
`CompanyResearch.tsx` is now `"use client"` (was a plain Server Component through Feature 12) — it owns the fetch, loading spinner, and re-run state the same way `SearchControls.tsx` does for job search: `isResearching`/`error`/local `dossier` state, `Loader2` spin on the button icon, `router.refresh()` after a successful save so the server-rendered page picks up the persisted row on next navigation. The parent page now passes `jobId` and `job.company_research` as props instead of just `company`.

Button label is state-driven: `"Research Company"` when no dossier exists yet, `"Re-run Research"` once one does — it never disappears, so a thin dossier (ATS dead end, JS-rendered homepage) can always be retried.

Each of the 9 dossier fields is its own `Section` (shared local component: icon badge + heading + `border-t` divider), conditionally rendered only when non-empty — `techStack`/`culture`/`yourEdge`/`gapsToAddress`/`smartQuestions`/`interviewPrep`/`sources` all skip rendering on an empty array, `companyOverview`/`whyThisRole` always render since the AI layer requires them. Tag-shaped fields (`techStack`) use a local `TagList` (`bg-surface-secondary` pills, neutral — no accent, since these are descriptive facts, not a status). Bullet-shaped fields (`culture`, `gapsToAddress`, `smartQuestions`, `interviewPrep`) use a local `BulletList` (small `bg-text-muted` dot marker, not a Lucide icon — matches the plain-paragraph density the design calls for elsewhere on this page). `yourEdge` is the one bullet list wrapped in a `bg-success-lightest` box, per the build plan's "highlight — specific to this candidate" instruction — the only field that gets a tinted background instead of plain text.

**Grounding notice** (new pattern, not in `ui-tokens.md` before this feature): a `CompanyDossier.grounded === false` dossier renders an `Info`-icon `bg-info-lightest`/`text-info-foreground` banner above the sections — "Based on the job posting only — we couldn't reach {company}'s website." This is the info-blue token's first real usage outside `ui-tokens.md`'s reference table; reuses the exact banner shape `SearchControls.tsx` established for its success/error banners, just with the info token instead of success/error.

Sources render as a plain list of external links (`text-accent hover:underline`, `target="_blank" rel="noopener noreferrer"`), not pills — these are URLs meant to be read and opened, not tags.

### Feature 14 — Dashboard Page (Full UI)

Files: app/dashboard/page.tsx, components/dashboard/StatsBar.tsx, components/dashboard/RecentActivity.tsx, components/dashboard/AnalyticsCharts.tsx, components/dashboard/IncompleteProfileBanner.tsx, lib/mock-dashboard.ts

Last updated: 2026-08-15 (StatsBar's data source superseded by Feature 15 — see below; visual pattern unchanged)

| Property         | Class                                                                              |
| ---------------- | ------------------------------------------------------------------------------------ |
| Background       | `bg-surface` cards                                                                  |
| Border            | `border border-border`                                                             |
| Border radius     | `rounded-2xl` cards, `rounded-md` buttons, `rounded-full` activity dots            |
| Text — primary    | `text-base font-semibold leading-6 text-text-primary` card headings, `text-[30px] font-semibold leading-9 text-text-primary` stat numbers |
| Text — secondary  | `text-sm font-medium leading-5 text-text-secondary` card labels, `text-xs font-normal leading-4 text-text-muted` subtitles/timestamps |
| Spacing           | `p-6` cards, `gap-6` between all dashboard sections, `grid grid-cols-4` stats row, `grid grid-cols-2` chart/activity rows |
| Shadow            | `shadow-sm`                                                                         |
| Accent usage      | Trend badges `bg-success-lightest text-success-darker rounded-sm` (not pill-shaped, matches `ui-tokens.md`'s Trend Badges spec exactly); Complete Profile CTA `bg-accent text-accent-foreground` |

**Pattern notes:**
Built directly against `context/designs/dashboard.png`, matching pixel-for-pixel per verification screenshot (see progress-tracker.md 2026-08-15 note). `app/dashboard/page.tsx` stays a Server Component doing exactly one real query — `profiles.is_complete` for the incomplete-profile banner — everything else (`StatsBar`, `RecentActivity`, all 3 charts) renders from `lib/mock-dashboard.ts`, a disposable mock file matching the `lib/mock-jobs.ts` precedent from Feature 09, expected to be replaced by Features 15–17.

`StatsBar.tsx` is a plain 4-column grid, each card only rendering a trend badge when `stat.trend` is non-empty — the design shows a trend badge on the first two cards (Total Jobs Found, Avg. Match Rate) but not the last two (Companies Researched, Jobs This Week), which are lifetime/weekly totals rather than week-over-week deltas.

`RecentActivity.tsx` dots follow the existing 3-color Activity Dots table in `ui-tokens.md` (accent/info/success), no new tokens: company-research entries always use the info-blue pair, job-search entries alternate accent-purple and success-green per row to match the delivered design's specific per-row colors (which don't reduce to a clean type→color rule). A pure helper (`withJobSearchIndex`) precomputes each row's alternating index outside the render loop — an in-render `let` counter mutated inside `.map()` trips this project's React Compiler lint rule (`react-hooks/immutability`, "Cannot reassign variable after render completes").

`AnalyticsCharts.tsx` exports three separate named chart components (`CompanyResearchActivityChart`, `JobsFoundOverTimeChart`, `MatchScoreDistributionChart`) rather than one combined component — each wraps `recharts`' `ResponsiveContainer` inside a shared local `ChartCard` (title + `h-64` container). `"use client"` is required — `recharts` renders via browser APIs (ResizeObserver, SVG measurement). Colors are the literal hex values from `ui-tokens.md`'s Dashboard Chart Colors table (`#61A8FF` bars, `#7C5CFC` line + gradient fill, `#10B981` bars, `#E7EAF3` dashed grid, `#9CA3AF` axis labels) passed straight to `recharts` props (`fill`, `stroke`) — `recharts` doesn't read CSS custom properties for SVG fills, so this is the same sanctioned literal-hex exception `lib/resume-pdf.tsx` already established for `@react-pdf/renderer`, extended here for the same reason (an SVG-rendering library with no CSS variable support).

`IncompleteProfileBanner.tsx` is a new, smaller sibling to `components/profile/CompletionBanner.tsx` — not a reuse. The profile page's banner needs a percentage and a missing-fields list to draw its donut ring; the dashboard only checks the stored `profiles.is_complete` boolean and the delivered design shows no banner at all (the screenshot's account is apparently already complete), so a single-line message-plus-CTA card was built instead. Same card shell classes as everything else on the page — no new visual pattern beyond the existing card/button tokens.

**Known conflict, resolved in favor of the design:** `build-plan.md`'s Feature 14 spec lists a "Cover Letters Generated" 4th stat card and a "Resume Tailoring Activity" bar chart; the delivered `dashboard.png` shows neither, and `project-overview.md`'s Dashboard section already matches the image (Jobs This Week, no cover-letter chart). Cover Letter Generation is out of scope project-wide — see progress-tracker.md's 2026-08-15 decision note for the full resolution.

### Feature 15 — Stats Bar (Real Data)

Files: app/dashboard/page.tsx, components/dashboard/StatsBar.tsx, lib/dashboard-stats.ts, types/index.ts, lib/mock-dashboard.ts

Last updated: 2026-08-15

No new visual classes — `StatsBar.tsx`'s markup, spacing, and card styling are untouched from Feature 14. What changed is the data source and the prop type: `stats: MockStat[]` became `stats: DashboardStat[]` (new shared type in `types/index.ts`, next to `JobRow`), and `MockStat`/`MOCK_STATS` were deleted from `lib/mock-dashboard.ts` — `StatsBar` was never coupled to mock data itself, only its former caller was.

**Pattern notes:**
`app/dashboard/page.tsx` now runs one real `jobs` query (`select("match_score, company_research, found_at")`, scoped `.eq("user_id", …)`) alongside its existing `is_complete` lookup. The 4 numbers are computed by a new pure function, `computeDashboardStats()` in `lib/dashboard-stats.ts` — no DB access inside it, matching the `lib/` boundary in `architecture.md`. It takes a narrow `Pick<JobRow, "match_score" | "company_research" | "found_at">[]` rather than a full `JobRow[]`, matching the exact columns the page actually selects.

**Trend badges are empty (`trend: ""`) on all 4 real cards**, unlike Feature 14's mock `+12%`/`+3%`. There is no historical-snapshot data anywhere in the schema to compute a real week-over-week delta from — `StatsBar.tsx`'s existing conditional (`{stat.trend && (...)}`) already hides the badge when empty, so no component change was needed, only real data flowing through the same shape. `DashboardStat.trend` stays in the type for a possible future snapshot mechanism.

Avg. Match Rate treats `match_score IS NULL` as excluded from both the count and the average — same "unknown, not zero" semantics Feature 11 established for the Find Jobs match filters — and renders `"—"` / `"No scored jobs yet"` when nothing is scored yet, rather than a misleading `0%`.

### Feature 16 — Recent Activity (Real Data)

Files: app/dashboard/page.tsx, components/dashboard/RecentActivity.tsx, lib/recent-activity.ts, app/api/agent/research/route.ts, types/index.ts, migrations/20260815095002_add-company-researched-at.sql, lib/mock-dashboard.ts

Last updated: 2026-08-15

No new visual classes — `RecentActivity.tsx`'s markup, dot-color logic, and empty state are all unchanged from Feature 14/15. What changed is the data source: `activity: MockActivity[]` became `activity: ActivityEntry[]` (new type in `lib/recent-activity.ts`, identical shape), and `MockActivity`/`MOCK_ACTIVITY` were deleted from `lib/mock-dashboard.ts` — same pattern as Feature 15's `MockStat` removal.

**Pattern notes:**
`app/dashboard/page.tsx` runs two additional real queries alongside its Feature 15 stats query: `agent_runs` filtered to `status = "completed"`, and `jobs` filtered on `company_researched_at IS NOT NULL`, each ordered descending and capped at 10 before merging. A new pure function, `buildRecentActivity()` in `lib/recent-activity.ts`, merges both arrays by actual timestamp (true chronological order across sources, not grouped by type), formats each into the build plan's exact copy ("Found X jobs for [jobTitle]" / "Researched [company]") using the existing `formatRelativeDate()` from `lib/utils.ts`, and slices to 10 — no DB access inside it, matching the `lib/` boundary `lib/dashboard-stats.ts` established in Feature 15.

**Schema addition:** `jobs.company_researched_at` (new migration, applied live) — `found_at` is set once at job-discovery time and is never touched by the research route, so it cannot represent when research (a separate, later action) actually happened. `app/api/agent/research/route.ts`'s existing dossier-save `.update()` now also sets this timestamp in the same call, so a saved dossier and its timestamp can never drift apart.

`RecentActivity.tsx`'s dot-coloring, alternating job-search colors, and empty state (established in Feature 14, see above) required zero changes — the component was already decoupled from mock data, consuming only the generic `{ id, type, text, timestamp }` shape.

### Feature 17 — Analytics Charts (Real Data)

Files: app/dashboard/page.tsx, components/dashboard/AnalyticsCharts.tsx, lib/analytics-charts.ts, lib/mock-dashboard.ts (deleted), context/library-docs.md

Last updated: 2026-08-15

**Data source changed from the build plan's spec.** The build plan called for PostHog event queries; that's not buildable in this codebase — see progress-tracker.md's 2026-08-15 decision note for the full investigation (no query API on `posthog-node`, no MCP/personal API key, and `job_found`'s captured properties never included `matchScore` in the first place, so the Match Score chart had no PostHog data behind it regardless). All three charts are wired to the same `jobs` table query Feature 15 already runs, extended with `company_researched_at`, plus three new pure functions in `lib/analytics-charts.ts` (`buildJobsFoundOverTime`, `buildCompanyResearchActivity`, `buildMatchScoreDistribution`) — no DB access inside them, same `lib/` boundary as `dashboard-stats.ts`/`recent-activity.ts`.

**New visual pattern — chart empty state.** `AnalyticsCharts.tsx`'s shared `ChartCard` now takes `hasData: boolean` and an `emptyMessage`, rendering `text-sm font-medium text-text-muted` centered in the same `h-64` slot the chart occupies when `hasData` is false — matching `RecentActivity.tsx`'s existing empty-state text style exactly, so the dashboard has one empty-state look across every card, not per-component variants. Each chart component takes `data` and `hasData` as separate props (`hasData` isn't derived from `data.length` inside the component) because an all-zero 30-day window is a legitimate populated state — a brand-new account, with zero `jobs` rows at all, is the actual empty state.

**Pattern notes:**
`buildJobsFoundOverTime`/`buildCompanyResearchActivity` bucket by day in **UTC**, not the viewer's local timezone — a Server Component has no access to browser timezone, and this matches `formatRelativeDate()`'s existing UTC-naive precedent in `lib/utils.ts`. Both always emit a full window (30 and 7 UTC calendar days respectively) with explicit zero-fill for days with no rows, rather than only the days that have data — a day with zero jobs is a real zero, not a gap to omit. `buildMatchScoreDistribution` reuses the same 5 ranges from `lib/mock-dashboard.ts`'s old mock shape (50-60/60-70/70-80/80-90/90-100), with the upper bound of the last range inclusive (100 counts) and all others exclusive at the top, so a boundary score like exactly 60 lands in one bucket only.

`lib/mock-dashboard.ts` deleted — Feature 17 was its last consumer (Features 15/16 already emptied it of stats/activity mocks).

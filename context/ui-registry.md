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

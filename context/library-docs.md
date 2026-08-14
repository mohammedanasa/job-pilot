# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to JobPilot.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. Some tools have MCP servers that give the AI agent direct access to documentation, logs, and debugging tools. If an MCP server is available — use it before falling back to general knowledge.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

## InsForge

**Check first:** Check AGENTS.md for an installed InsForge skill. If an InsForge MCP server is configured — use it. The skill/MCP will have the latest API patterns.

### Client vs Server

Two separate instances — never mix them:

```typescript
// lib/insforge-client.ts — browser context only
import { createBrowserClient } from "@insforge/ssr";

export const insforge = createBrowserClient(
  process.env.NEXT_PUBLIC_INSFORGE_URL!,
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
);
```

```typescript
// lib/insforge-server.ts — server context only
import { createServerClient } from "@insforge/ssr";
import { cookies } from "next/headers";

export const createInsforgeServer = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_INSFORGE_URL!,
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
```

**Rules:**

- Browser client — Client Components, browser-side auth state, realtime subscriptions
- Server client — Server Components, API routes, Server Actions, agent functions
- Never use browser client in server context
- Never use server client in browser context

---

### Auth

```typescript
// Get current user in server context
const insforge = await createInsforgeServer();
const {
  data: { user },
  error,
} = await insforge.auth.getUser();
if (!user) redirect("/login");
```

---

### DB Queries

```typescript
// Read
const { data, error } = await insforge
  .from("jobs")
  .select("*")
  .eq("user_id", user.id)
  .order("found_at", { ascending: false });

// Insert
const { data, error } = await insforge
  .from("jobs")
  .insert({ user_id: user.id, title, company, match_score })
  .select()
  .single();

// Update
const { error } = await insforge
  .from("jobs")
  .update({ company_research: dossier })
  .eq("id", jobId)
  .eq("user_id", user.id); // always scope to user
```

**Rules:**

- Always scope queries to `user_id` — never query without user filter
- Always handle the `error` return — never assume success
- Use `.single()` when expecting exactly one row

---

### Filtering, Sorting, Pagination

`insforge.database.from()` returns a raw `@supabase/postgrest-js` builder, so the
whole PostgREST surface is available. Three things verified live against the
project during Feature 11:

```typescript
const { data, error, count } = await insforge.database
  .from("jobs")
  .select("*", { count: "exact" }) // count is a sibling of data, ignores .range()
  .eq("user_id", user.id)
  .or(`company.ilike."%${term}%",title.ilike."%${term}%"`)
  .order("match_score", { ascending: false, nullsFirst: false })
  .range(0, 19); // 0-based, INCLUSIVE
```

**⚠️ `@insforge/sdk/SDK-REFERENCE.md` documents two methods that do not exist.**
It lists `.offset(n)` and `.and(...)`; neither is in postgrest-js 1.21.4, and
calling either throws `TypeError: … is not a function`. Use `.range(from, to)`
for paging and chained filters for AND. Trust the `.d.ts` over that reference.

**⚠️ `DESC` sorts NULLs FIRST.** postgrest-js emits no nulls directive unless you
pass one, so Postgres' default applies and `.order(col, { ascending: false })`
leads with NULL rows. Pass `nullsFirst: false`. There is no `nullsLast` option.

**⚠️ `.or()` takes a raw filter string the SDK does not escape.** User input must
be sanitized. Wrap the value in double quotes — that makes PostgREST's reserved
`, . ( ) :` literal, so `Node.js` and `Smith, Inc` work. Unquoted, a term with a
comma fails with `PGRST100 failed to parse logic tree`. Still strip the LIKE
wildcards `%` and `_`, and escape `\` and `"`. See `sanitizeSearchTerm` in
`lib/job-filters.ts`.

`count: "exact"` is parsed from the `Content-Range` response header (verified:
`content-range: 0-19/20`). Run counted queries **server-side** — from a browser
they additionally need `Access-Control-Expose-Headers: Content-Range`.

---

### Storage

```typescript
// Upload file
const { data, error } = await insforge.storage
  .from("resumes")
  .upload(`${userId}/resume.pdf`, fileBuffer, {
    contentType: "application/pdf",
    upsert: true, // overwrites existing file
  });

// Get public URL
const { data } = insforge.storage
  .from("resumes")
  .getPublicUrl(`${userId}/resume.pdf`);

const url = data.publicUrl;
```

**Storage paths:**

- Base resume: `resumes/{user_id}/resume.pdf`

**Rules:**

- Always use `upsert: true` for base resume uploads — overwrites existing file
- Always save the public URL back to the DB after upload
- Never write files to disk — always upload buffer directly to storage

---

## Adzuna API

**Check first:** Check AGENTS.md for an installed Adzuna skill. If none exists — use this file and the official Adzuna API docs.

### Job Search

```typescript
// lib/adzuna.ts
export async function searchJobs(
  jobTitle: string,
  location: string,
  country: string = "us",
): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    what: jobTitle,
    category: "it-jobs", // always filter to IT jobs
    results_per_page: "10",
    "content-type": "application/json",
  });

  // Only add where if location is provided
  if (location) {
    params.set("where", location);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}
```

### Response Shape

Each Adzuna job result contains:

```typescript
type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string; // snippet only — not full description
  redirect_url: string; // Adzuna tracking URL → redirects to actual job
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: "0" | "1"; // "1" means salary is estimated
  contract_type?: string;
  created: string; // ISO date string
  category: { tag: string; label: string };
};
```

### Saving Jobs to DB

```typescript
// Map Adzuna result to jobs table
const jobRecord = {
  user_id: userId,
  run_id: runId,
  source: "search", // always 'search' for Adzuna jobs
  source_url: job.redirect_url,
  external_apply_url: job.redirect_url,
  title: job.title,
  company: job.company.display_name,
  location: job.location.display_name,
  salary: job.salary_min
    ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max! / 1000)}k`
    : null,
  job_type: job.contract_type || "fulltime",
  about_role: job.description, // Adzuna returns snippet — used as description
  match_score: scoredJob.matchScore,
  match_reason: scoredJob.matchReason,
  matched_skills: scoredJob.matchedSkills,
  missing_skills: scoredJob.missingSkills,
  found_at: new Date().toISOString(),
};
```

**Rules:**

- Always include `category=it-jobs` — never search Adzuna without this filter
- Never pass `where` if location is empty — omit the parameter entirely
- `source` is always `'search'` for Adzuna jobs — never any other value
- `salary_is_predicted: "1"` means Adzuna estimated the salary — this is normal
- Adzuna description is a snippet — GPT-4o scores from it, not a full description
- Default country to `'us'` — support `gb`, `au`, `ca` as alternatives

---

## Browserbase

**Check first:** Check AGENTS.md for an installed Browserbase skill. If a Browserbase MCP server is configured — use it. The skill/MCP will have the latest session management and API patterns.

### Session Creation — Company Research

```typescript
import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

// Single session for company research — sequential page visits
const session = await bb.sessions.create({
  projectId: process.env.BROWSERBASE_PROJECT_ID!,
  timeout: 120, // 2 minute session — visits 3-4 pages max
});
```

**Important — Browserbase runs independently from your Next.js server:**
Browserbase sessions run on Browserbase's cloud infrastructure, not inside your Next.js API route. The API route triggers the Browserbase session and returns a response while the session continues running independently on Browserbase's platform. Do not add `maxDuration` or any timeout configuration to Next.js API routes to accommodate Browserbase session length.

**Rules:**

- Always use single sessions — never parallel sessions (free plan limit)
- Session timeout is 120 seconds — sufficient for 3-4 page visits
- Always end sessions cleanly — call stagehand.close() when done
- Project ID always from `process.env.BROWSERBASE_PROJECT_ID` — never hardcode
- Browserbase client lives in `lib/browserbase.ts` — always import from there

---

## Stagehand

**Check first:** Check AGENTS.md for an installed Stagehand skill. If a Stagehand MCP server is configured — use it. The skill/MCP will have the latest act() and extract() patterns.

### Initialisation

```typescript
import { Stagehand } from "@browserbasehq/stagehand";

const stagehand = new Stagehand({
  env: "BROWSERBASE",
  apiKey: process.env.BROWSERBASE_API_KEY!,
  projectId: process.env.BROWSERBASE_PROJECT_ID!,
  browserbaseSessionID: session.id,
  model: { modelName: "openai/gpt-4o", apiKey: process.env.OPENAI_API_KEY! },
  disablePino: true,
});

await stagehand.init();
const page = stagehand.context.activePage()!;
```

### extract()

```typescript
import { z } from "zod";

const result = await stagehand.extract({
  instruction:
    "Extract the company overview, main product description, and any technology mentions from this page.",
  schema: z.object({
    companyOverview: z.string().optional(),
    mainProduct: z.string().optional(),
    techMentions: z.array(z.string()).optional(),
    navLinks: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .optional(),
  }),
});
```

### act()

```typescript
// Always wrap in try/catch
try {
  await stagehand.act({
    action: "Click the About link in the navigation",
  });
} catch (error) {
  await logAgentError(jobId, null, error);
}
```

## Company Research Section

Replace the existing Stagehand "Company Research Pattern" section in library-docs.md with this:

---

### Company Research Pattern

Three-step process: homepage extraction → sub-page extraction → GPT-4o synthesis.
Job description and user profile come from DB — never re-fetch what you already have.
Browser's only job is the company website.

```typescript
// Step 1 — Homepage extraction
const homepageData = await stagehand.extract({
  instruction:
    "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
  schema: z.object({
    oneLiner: z.string().describe("What the company does in one sentence"),
    productSummary: z
      .string()
      .describe("What they build/sell and who it's for"),
    signals: z
      .array(z.string())
      .describe("Funding, notable customers, scale, mission, recent news"),
    pageLinks: z
      .array(
        z.object({
          url: z.string(),
          kind: z.enum([
            "about",
            "careers",
            "blog",
            "engineering",
            "product",
            "team",
            "other",
          ]),
        }),
      )
      .describe("Internal links worth visiting"),
  }),
});

// If oneLiner and productSummary are empty — wrong site or parked domain
// Skip to synthesis with job description and profile only
if (!homepageData.oneLiner && !homepageData.productSummary) {
  await stagehand.close();
  // proceed to synthesis with empty companyResearch
}

// Step 2 — Sub-page extraction (max 3, prefer about/blog/engineering/product over careers)
const subPageData = await stagehand.extract({
  instruction:
    "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
  schema: z.object({
    keyPoints: z.array(z.string()),
    technologies: z
      .array(z.string())
      .describe("Specific languages, frameworks, tools, platforms"),
    valuesOrCulture: z
      .array(z.string())
      .describe("Stated values, working style, team norms"),
    notable: z
      .array(z.string())
      .describe("Customers, funding, scale, projects, awards"),
  }),
});

// Step 3 — GPT-4o synthesis (after browser closes)
// Feed three data sources: company research + job from DB + profile from DB
const systemPrompt = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

const userPrompt = `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Matched skills (already computed): ${job.matched_skills.join(", ")}
Missing skills (already computed): ${job.missing_skills.join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title}
Experience: ${profile.years_experience} years, level ${profile.experience_level}
Skills: ${profile.skills.join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  response_format: { type: "json_object" },
  temperature: 0.4,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
});
```

**Dossier fields:**

| Field           | Type     | Purpose                                             |
| --------------- | -------- | --------------------------------------------------- |
| companyOverview | string   | What the company does                               |
| techStack       | string[] | Technologies they use                               |
| culture         | string[] | Values and working style                            |
| whyThisRole     | string   | Why this role exists                                |
| yourEdge        | string[] | Specific links between THIS candidate and this role |
| gapsToAddress   | string[] | Missing skills reframed as strategy                 |
| smartQuestions  | string[] | Questions that show real research                   |
| interviewPrep   | string[] | Topics to prepare for this role                     |
| sources         | string[] | Pages the company info came from                    |

**Rules:**

- Always use `extract()` with a Zod schema — never parse raw HTML or use regex
- Always wrap every `act()` and `extract()` in try/catch
- Always call `await stagehand.close()` when done — ends the Browserbase session
- Model is always `gpt-4o` — never use other models
- Temperature is `0.4` for synthesis — grounded but flexible enough to make real connections
- Max 3 sub-pages — never exceed this on free plan
- Always close session in finally block — never leave sessions open even if research fails
- Job description and profile always come from DB — never re-fetch via browser
- If browser research returns empty — still run synthesis with job + profile only
- yourEdge, gapsToAddress, and smartQuestions are the most valuable fields — never skip them

## AI Providers (Gemini + Groq)

Replaced OpenAI GPT-4o as the project's AI layer (2026-08-13). All AI calls go through
`lib/ai` — **never import a provider module directly from a route**, and never call a
provider API from a route.

```
lib/ai/index.ts    ← the only thing routes import. Picks provider, handles fallback.
lib/ai/types.ts    ← the provider-neutral contract
lib/ai/gemini.ts   ← Google AI Studio adapter
lib/ai/groq.ts     ← Groq adapter
```

### Structured JSON Response

```typescript
import { generateJson } from "@/lib/ai";

const result = await generateJson<MyType>({
  prompt: "Your prompt here",
  schema: MY_JSON_SCHEMA, // JSON Schema object — constrains shape, not just format
  schemaName: "my_type", // required by Groq's strict mode, ignored by Gemini
  temperature: 0.3,
  maxOutputTokens: 4000,
});

if (!result.ok) {
  // kind: "rate_limit" | "quota_exhausted" | "unavailable" | "bad_response" | "request_failed"
  return NextResponse.json({ success: false, error: result.message }, { status: 502 });
}

result.data; // typed, already parsed
result.provider; // which provider actually answered
```

### Provider selection and fallback

`AI_PROVIDER` in the environment picks the preferred provider (`groq` or `gemini`),
defaulting to **groq** — its free tier allows ~1000 requests/day against Gemini's ~20
per *minute*, which makes it the sensible primary.

If the preferred provider returns a quota, availability, or network failure, the call
falls through to the other one. A `bad_response` does **not** fail over: malformed JSON
is a prompt or schema problem, and retrying elsewhere spends a second quota to get the
same answer. Providers without an API key are skipped, so adding a key is the only step
needed to bring one into rotation.

**Schemas must stay provider-neutral.** Groq's strict mode requires
`additionalProperties: false` and a `required` list naming every property; that
adaptation happens inside `lib/ai/groq.ts`, not at the call site.

### The Interactions API — things that will bite you

The endpoint is `POST /v1beta/interactions`. The legacy
`models/{model}:generateContent` endpoint still exists but is superseded.

- **Auth header is `x-goog-api-key`** — not `Authorization: Bearer`. Third-party
  guides get this wrong.
- **There is no `output_text` field over raw REST.** That is an SDK convenience.
  The text lives in `steps[]`.
- **`steps[0]` is usually the `thought` step, not the answer.** Find the step with
  `type: "model_output"`. Indexing `steps[0]` silently yields nothing.
- **Thinking tokens draw from `max_output_tokens`.** Measured on a real resume: an
  800-token cap was consumed by 767 thought tokens, leaving 18 for output and a
  truncated, unparseable object. Budget 4000+ even for small replies.
- **`status: "incomplete"` means the budget ran out mid-write.** Check it explicitly —
  otherwise it surfaces as a confusing "malformed JSON" error.
- **`thinking_level: "minimal"` for extraction-type work.** `"low"` truncated 1 run
  in 5 and populated roughly half the fields. `"none"` is rejected; `"minimal"` is
  the supported floor.
- **Bound arrays with `maxItems` and list core fields in `required`.** Without
  `maxItems` the model can pad until it exhausts the budget; without `required` it
  omits fields that are plainly present.

**Gemini model:** `gemini-3.5-flash` (`GEMINI_MODEL` in `lib/ai/gemini.ts`). Note
`gemini-2.0-flash` is shut down. Verify a model is live with `GET /v1beta/models`
before adopting it.

**Groq model:** `openai/gpt-oss-20b` (`GROQ_MODEL` in `lib/ai/groq.ts`). Strict
`json_schema` mode — which *guarantees* schema adherence rather than Gemini's
best-effort — is supported **only** on `openai/gpt-oss-20b` and `openai/gpt-oss-120b`.
Do not swap in a Llama or Qwen model without dropping to best-effort or json_object mode.

**Temperature settings:**

- `0.3` — matching, scoring, extraction, research synthesis — deterministic results
- `0.7` — resume generation — natural variation

**Free tier limits — the reason fallback exists:**

- **Gemini:** ~20 requests/*minute* on `generate_content_free_tier_requests`. Trips
  constantly during development. The 429 body carries a `Please retry in Ns` hint,
  which the adapter surfaces in the user-facing message rather than guessing.
- **Groq:** 30 RPM and ~1000 requests/day for `openai/gpt-oss-20b` — far more forgiving,
  hence the default primary.

Neither provider is retried in place: retrying into a spent quota burns what remains and
holds the user's spinner open. The fallback tries the *other* provider instead.

**Rules:**

- Routes import from `@/lib/ai` only — never from `lib/ai/gemini` or `lib/ai/groq`
- Model strings come from `GEMINI_MODEL` / `GROQ_MODEL` — never hardcode at a call site
- `GEMINI_API_KEY`, `GROQ_API_KEY`, and `AI_PROVIDER` are server-only — never `NEXT_PUBLIC_`
- Provider-specific tuning (Gemini's `thinking_level`, Groq's strict-schema adaptation)
  stays inside its adapter — it must never leak into `GenerateJsonRequest`
- Always handle the `ok: false` branch and surface `result.message` — a rate limit must
  never be reported to the user as a bad file
- Always validate parsed JSON before using — `generateJson` parses, it does not verify
  your shape
- Match threshold is always `MATCH_THRESHOLD` from `lib/utils.ts` — never hardcode 70
- Company research synthesis must always return a complete dossier — never return empty
  even if browser research failed

> Features 08, 10, and 13 were specified against GPT-4o. They use the unified
> AI layer via `@/lib/ai` instead of a provider adapter. Feature 13's Stagehand
> config still names an OpenAI model for browser automation — that is a separate
> decision, to be made when Feature 13 is built.
>
> Feature 08 is built and does this: `app/api/resume/generate/route.ts` calls
> `generateJson` at temperature 0.7 (generation) against extraction's 0.3
> (reading). Features 10 and 13 remain to be wired.

---

## PostHog

**Check first:** Check AGENTS.md for an installed PostHog skill. If a PostHog MCP server is configured — use it. The skill/MCP will have the latest client and server patterns.

### Client Setup (Browser)

```typescript
// lib/posthog-client.ts
import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false, // manual pageview tracking
    });
  }
}

// Capture event client-side
posthog.capture("job_found", {
  userId,
  source: "search",
  matchScore: score,
});
```

### Server Setup

```typescript
// lib/posthog-server.ts
import { PostHog } from "posthog-node";

export const createPostHogServer = () =>
  new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    flushAt: 1, // send immediately
    flushInterval: 0, // no batching — Next.js functions are short-lived
  });

// Always use and shutdown in the same function
const posthog = createPostHogServer();
posthog.capture({
  distinctId: userId,
  event: "company_researched",
  properties: { userId, jobId, company },
});
await posthog.shutdown(); // required — ensures event is sent
```

**Rules:**

- Always call `await posthog.shutdown()` in server-side functions — events are lost without it
- `flushAt: 1` and `flushInterval: 0` always set on server client
- Event names must match exactly the list in `code-standards.md`
- Always include `userId` as a property on every server-side event
- Call `posthog.identify(userId)` after login on client side
- Call `posthog.reset()` on logout on client side

---

## @react-pdf/renderer

**Check first:** Check AGENTS.md for an installed react-pdf skill. PDF generation APIs can differ from general training knowledge.

### Resume PDF Generation

```typescript
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  section: { marginBottom: 10 },
  heading: { fontSize: 14, fontWeight: 'bold' },
  text: { fontSize: 10 },
})

const ResumePDF = ({ profile }: { profile: Profile }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>{profile.fullName}</Text>
        <Text style={styles.text}>{profile.email}</Text>
      </View>
    </Page>
  </Document>
)

// Generate buffer
const buffer = await renderToBuffer(<ResumePDF profile={profile} />)

// Upload directly to InsForge Storage.
// NOTE: upload() takes exactly two arguments in the installed SDK — there is no
// options object and no upsert flag. It takes a File/Blob, not a raw Buffer.
// Writing an existing key overwrites it silently (verified against the live bucket).
await insforge.storage
  .from('resumes')
  .upload(
    `${userId}/generated-resume.pdf`,
    new File([new Uint8Array(buffer)], 'generated-resume.pdf', { type: 'application/pdf' }),
  )
```

**Verified against the installed version (4.6.0), correcting the notes below:**

- `backgroundColor`, `flex`, `paddingVertical`/`paddingHorizontal`, and `borderRadius`
  all render correctly. The "supported CSS properties" list below is narrower than
  what actually works — treat it as a safe subset, not an exhaustive one.
- No `serverExternalPackages` entry is required. Unlike `pdf-parse`, this package
  resolves cleanly under Turbopack — verified by calling `renderToBuffer` inside
  the running dev server.
- CSS custom properties (`var(--color-*)`) do **not** work: the PDF layout engine
  has no CSS variable system, so colours must be literal hex. `lib/resume-pdf.tsx`
  holds the palette copied from `ui-tokens.md` — the one sanctioned exception to
  the no-hardcoded-colour rule.
- Export a builder function that returns the element, not the component itself.
  `createElement()` infers the element type from props and loses the `DocumentProps`
  shape `renderToBuffer` requires; a JSX literal inside a route's try/catch trips
  the `react-hooks/error-boundaries` lint rule. See `lib/resume-pdf.tsx`.

**Supported CSS properties:**
Only use these — others are silently ignored:
`padding, margin, fontSize, color, fontFamily, flexDirection, alignItems, justifyContent, borderRadius, width, height, fontWeight, textAlign, lineHeight`

**Rules:**

- Server-side only — never import in client components
- Always use `renderToBuffer` — not `renderToStream` or `PDFDownloadLink`
- PDF generation only in `app/api/resume/` routes
- Generated buffer uploaded directly to InsForge Storage — never written to disk
- Always save public URL to DB after upload

---

## pdf-parse

**Check first:** Check AGENTS.md for an installed pdf-parse skill.

### Extract Text from a Stored Resume

**v2 is a class, not a function.** The `import pdf from "pdf-parse"` default-export
form is v1 and fails at build time with "Export default doesn't exist in target module".

**It must be excluded from the bundler.** pdf-parse wraps `pdfjs-dist`, which loads a
separate worker file at runtime. Bundling rewrites the paths pdfjs uses to find that
worker, and parsing fails at runtime — while `npm run build` still passes, because the
module imports fine and only breaks when actually called. `next.config.ts` must keep:

```typescript
serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
```

Without it every parse throws `Setting up fake worker failed: "Cannot find module
'.../pdf.worker.mjs'"`. Note `disableWorker` is *not* an option in this pdfjs version —
externalizing is the fix.

The PDF is read back from InsForge Storage by `resume_pdf_key`, not from the request:
by the time extraction runs, the file was uploaded in an earlier request and is no
longer in the browser.

```typescript
import { PDFParse } from "pdf-parse";

const { data: blob } = await insforge.storage.from("resumes").download(key);

const parser = new PDFParse({ data: new Uint8Array(await blob.arrayBuffer()) });
try {
  const parsed = await parser.getText();
  const text = (parsed.text ?? "").trim();
} finally {
  await parser.destroy(); // releases the document
}
```

**Rules:**

- Server-side only — never import in client components
- `new PDFParse({ data })` takes a `Uint8Array`; always `destroy()` in a `finally`
- `parsed.text` is raw unformatted text — the model handles structure extraction
- Always handle parse errors — some PDFs are image-based and return empty text
- If text is under ~200 characters — return "Could not extract text from this PDF.
  Please try a different file." Check this **before** calling the model: a scanned PDF
  sent to Gemini yields confidently invented fields, which is worse than a clean error
- **Never report an infrastructure failure as a bad file.** A throw from `getText()` can
  mean a broken PDF *or* a worker/environment failure. Blaming the user's file for our
  problem sends them re-uploading good resumes forever. Distinguish the two and return
  500 for our faults, 422 for theirs

import { generateJson } from "@/lib/ai";
import { deriveCompanyHomepage } from "@/lib/company-site";
import {
  MAX_PAGE_CHARS,
  fetchPageHtml,
  fetchPageText,
  selectSubPageLinks,
  stripHtml,
} from "@/lib/html-text";
import type { CompanyDossier, ResearchCompanyResult } from "@/agent/types";
import type { JobRow, ProfileData } from "@/types";

/**
 * One synthesis call over all fetched page text, not one call per page.
 * Per-page extraction only made sense when a browser tool needed a schema
 * per visit — with plain fetched text there's nothing to distill first, and
 * one request keeps this to a single failure mode against a 30 RPM tier.
 */

const DOSSIER_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    companyOverview: { type: "string", description: "What the company does, 1-3 sentences" },
    techStack: { type: "array", maxItems: 10, items: { type: "string" } },
    culture: { type: "array", maxItems: 6, items: { type: "string" } },
    whyThisRole: { type: "string", description: "1-2 sentences" },
    yourEdge: { type: "array", maxItems: 6, items: { type: "string" } },
    gapsToAddress: { type: "array", maxItems: 6, items: { type: "string" } },
    smartQuestions: { type: "array", maxItems: 6, items: { type: "string" } },
    interviewPrep: { type: "array", maxItems: 6, items: { type: "string" } },
  },
  required: [
    "companyOverview",
    "techStack",
    "culture",
    "whyThisRole",
    "yourEdge",
    "gapsToAddress",
    "smartQuestions",
    "interviewPrep",
  ],
};

type DossierResponse = Omit<CompanyDossier, "sources" | "grounded">;

function isValidDossierResponse(value: unknown): value is DossierResponse {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;

  const isStringArray = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((s) => typeof s === "string");

  return (
    typeof body.companyOverview === "string" &&
    isStringArray(body.techStack) &&
    isStringArray(body.culture) &&
    typeof body.whyThisRole === "string" &&
    isStringArray(body.yourEdge) &&
    isStringArray(body.gapsToAddress) &&
    isStringArray(body.smartQuestions) &&
    isStringArray(body.interviewPrep)
  );
}

function buildPrompt(
  job: JobRow,
  profile: ProfileData,
  pages: Array<{ url: string; text: string }>,
): string {
  const hasResearch = pages.length > 0;
  const research = hasResearch
    ? pages.map((p) => `--- ${p.url} ---\n${p.text}`).join("\n\n")
    : "(none — the company's website could not be reached)";

  const roleSummary = (profile.work_experience ?? [])
    .map((role) => `${role.jobTitle} at ${role.companyName}`)
    .join(", ");

  // A first verification run with no research context produced a fully
  // confident-sounding companyOverview for a company that does not exist —
  // "the-never-invent-facts" rule alone did not stop it. Absent research
  // gets an explicit, separate instruction rather than relying on the model
  // to notice the parenthetical is empty.
  const groundingRule = hasResearch
    ? "- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts not present in the research or posting."
    : "- No company website research is available. Do NOT state what the company does, its size, funding, culture, or values as fact — you have no source for any of that. companyOverview and any culture claims must explicitly hedge (\"Based on the job posting, this role appears to involve...\") and stick to what the job posting itself says. Never invent a product description, mission statement, or company stage.";

  return `You are a sharp career strategist preparing a candidate to apply for a specific role.
You are given (a) research collected from the company's own website (may be absent),
(b) the job posting, and (c) the candidate's profile. Produce a concise, concrete
briefing that gives this specific candidate an edge for this specific role.

Rules:
${groundingRule}
- Be specific to THIS candidate. Connect their actual skills and past work to this
  company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly
  and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind
  of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

COMPANY RESEARCH (from their website):
${research}

JOB POSTING:
Title: ${job.title ?? "Not specified"}
Company: ${job.company ?? "Not specified"}
Description: ${job.about_role ?? "Not specified"}
Matched skills: ${(job.matched_skills ?? []).join(", ") || "None recorded"}
Missing skills: ${(job.missing_skills ?? []).join(", ") || "None recorded"}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? "Not specified"}
Experience: ${profile.years_experience ?? "Unknown"} years, level ${profile.experience_level ?? "Unknown"}
Skills: ${(profile.skills ?? []).join(", ")}
Recent roles: ${roleSummary || "Not specified"}`;
}

/** Never throws — a research failure is reported as a normal result so the route can respond cleanly. */
export async function researchCompany(
  job: JobRow,
  profile: ProfileData,
): Promise<ResearchCompanyResult> {
  const pages: Array<{ url: string; text: string }> = [];

  try {
    const homepageUrl = await deriveCompanyHomepage(
      job.external_apply_url,
      job.company ?? "",
    );

    if (homepageUrl) {
      const homepage = await fetchPageHtml(homepageUrl);

      if (homepage) {
        const homepageText = stripHtml(homepage.html).slice(0, MAX_PAGE_CHARS);

        if (homepageText.length > 0) {
          pages.push({ url: homepageUrl, text: homepageText });

          const subPageUrls = selectSubPageLinks(homepage.html, homepageUrl);
          for (const url of subPageUrls) {
            const page = await fetchPageText(url);
            if (page) pages.push(page);
          }
        }
      }
    }
  } catch (error) {
    // Web research is best-effort — a fetch failure here still allows the
    // profile-and-posting-only path below to produce a dossier.
    console.error("[agent/research] web research failed:", error);
  }

  const grounded = pages.length > 0;

  const result = await generateJson<DossierResponse>({
    prompt: buildPrompt(job, profile, pages),
    schema: DOSSIER_SCHEMA,
    schemaName: "company_dossier",
    temperature: 0.4,
    // Groq's 8000 TPM limit covers prompt + reserved completion together —
    // verified live: 4 real fetched pages pushed a 6000 budget over the
    // limit outright (HTTP 413). 4000 leaves headroom for the largest
    // realistic prompt (homepage + 3 sub-pages at MAX_PAGE_CHARS each).
    maxOutputTokens: 4000,
  });

  if (!result.ok) {
    return { success: false, error: result.message };
  }

  if (!isValidDossierResponse(result.data)) {
    return { success: false, error: "The AI service returned malformed research data." };
  }

  const dossier: CompanyDossier = {
    ...result.data,
    sources: pages.map((p) => p.url),
    grounded,
  };

  return { success: true, dossier };
}

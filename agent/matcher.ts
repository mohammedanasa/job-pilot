import { generateJson } from "@/lib/ai";
import type { AdzunaJob } from "@/lib/adzuna";
import type { ScoredJob } from "@/agent/types";
import type { ProfileData } from "@/types";

/**
 * One call scores every job in the batch, results mapped back by array
 * `index` — the same pattern Feature 08 used for resume role bullets. A
 * 30 RPM free tier makes ten separate per-job calls both slow and fragile;
 * one call is a single failure mode instead of ten partial ones.
 */

/**
 * Adzuna descriptions run to several hundred words. Sent uncapped across up
 * to 10 jobs plus a work-history JSON dump, the prompt was large enough to
 * trip Groq's request-size limit outright (HTTP 400) or, when accepted,
 * leave too little of the model's own context for a 10-job reply — this is
 * enough for the model to judge a match without needing the full posting.
 */
const MAX_DESCRIPTION_LENGTH = 600;

const SCORING_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    scores: {
      type: "array",
      maxItems: 10,
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          matchScore: { type: "integer", description: "0-100" },
          matchReason: {
            type: "string",
            description: "1-2 sentences, at most 200 characters",
          },
          matchedSkills: { type: "array", maxItems: 8, items: { type: "string" } },
          missingSkills: { type: "array", maxItems: 8, items: { type: "string" } },
        },
        required: ["index", "matchScore", "matchReason", "matchedSkills", "missingSkills"],
      },
    },
  },
  required: ["scores"],
};

type ScoringResponse = {
  scores: Array<{
    index: number;
    matchScore: number;
    matchReason: string;
    matchedSkills: string[];
    missingSkills: string[];
  }>;
};

function isValidScoringResponse(value: unknown): value is ScoringResponse {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;

  return (
    Array.isArray(body.scores) &&
    body.scores.every((entry) => {
      if (typeof entry !== "object" || entry === null) return false;
      const item = entry as Record<string, unknown>;
      return (
        typeof item.index === "number" &&
        typeof item.matchScore === "number" &&
        typeof item.matchReason === "string" &&
        Array.isArray(item.matchedSkills) &&
        item.matchedSkills.every((s) => typeof s === "string") &&
        Array.isArray(item.missingSkills) &&
        item.missingSkills.every((s) => typeof s === "string")
      );
    })
  );
}

function truncateDescription(description: string): string {
  if (description.length <= MAX_DESCRIPTION_LENGTH) return description;
  return `${description.slice(0, MAX_DESCRIPTION_LENGTH)}…`;
}

function buildPrompt(jobs: AdzunaJob[], profile: ProfileData): string {
  const jobList = jobs
    .map(
      (job, index) =>
        `[${index}] Title: ${job.title}\nCompany: ${job.company.display_name}\nDescription: ${truncateDescription(job.description)}`,
    )
    .join("\n\n");

  // Only the fields scoring actually uses — the full work_experience shape
  // (responsibilities text, dates) added bulk without adding signal.
  const roleSummary = (profile.work_experience ?? [])
    .map((role) => `${role.jobTitle} at ${role.companyName}`)
    .join(", ");

  return `You are scoring job postings against a candidate's profile.

Rules:
- Score each job independently on how well it matches the candidate's skills and experience, 0-100.
- matchReason: 1-2 sentences on why — reference specific skills, not generic praise.
- matchedSkills: skills the candidate has that this job's description asks for. Max 8.
- missingSkills: skills this job's description asks for that the candidate does not list. Max 8.
- Every job in the list must appear exactly once in scores, keyed by its index.
- Keep every reply field concise — you are scoring up to 10 jobs in this one response.

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? "Not specified"}
Experience: ${profile.years_experience ?? "Unknown"} years, level ${profile.experience_level ?? "Unknown"}
Skills: ${(profile.skills ?? []).join(", ")}
Recent roles: ${roleSummary || "Not specified"}

JOBS TO SCORE:
${jobList}`;
}

/** Never throws — a scoring failure is reported as a normal AIResult so the caller can log and continue. */
export async function scoreJobs(
  jobs: AdzunaJob[],
  profile: ProfileData,
): Promise<{ ok: true; scores: Map<number, ScoredJob> } | { ok: false; message: string }> {
  const result = await generateJson<ScoringResponse>({
    prompt: buildPrompt(jobs, profile),
    schema: SCORING_SCHEMA,
    schemaName: "job_scores",
    temperature: 0.3,
    // Up to 10 jobs each writing a reason + two skill arrays; 4000 truncated
    // mid-batch in testing. Gemini's thinking phase also draws from this
    // same budget, so it stays generous rather than tightly fitted.
    maxOutputTokens: 6000,
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  if (!isValidScoringResponse(result.data)) {
    return { ok: false, message: "The AI service returned malformed scoring data." };
  }

  const scores = new Map<number, ScoredJob>(
    result.data.scores.map((entry) => [
      entry.index,
      {
        matchScore: Math.max(0, Math.min(100, Math.round(entry.matchScore))),
        matchReason: entry.matchReason,
        matchedSkills: entry.matchedSkills,
        missingSkills: entry.missingSkills,
      },
    ]),
  );

  return { ok: true, scores };
}

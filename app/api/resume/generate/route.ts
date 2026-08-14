import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createInsforgeServer } from "@/lib/insforge-server";
import { generateJson } from "@/lib/ai";
import { buildResumeDocument } from "@/lib/resume-pdf";
import type { GeneratedResumeProse, ProfileData, WorkExperience } from "@/types";

/** Roles the form allows, and therefore the most the model is asked to rewrite. */
const MAX_ROLES = 3;

/**
 * Bounds that keep the document to one page in practice.
 *
 * They are enforced in the schema rather than by truncating afterwards: a model
 * told to write three bullets writes three good ones, whereas cutting a fourth
 * bullet mid-sentence looks like a rendering bug.
 */
const MAX_BULLETS_PER_ROLE = 3;
const MAX_SUMMARY_CHARS = 400;

const PROSE_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      maxLength: MAX_SUMMARY_CHARS,
      description: `Professional summary, 2-3 sentences, at most ${MAX_SUMMARY_CHARS} characters.`,
    },
    roles: {
      type: "array",
      maxItems: MAX_ROLES,
      items: {
        type: "object",
        properties: {
          index: {
            type: "integer",
            description: "The zero-based index of the role exactly as given in the input.",
          },
          bullets: {
            type: "array",
            maxItems: MAX_BULLETS_PER_ROLE,
            items: {
              type: "string",
              maxLength: 180,
              description: "One achievement bullet, at most 180 characters.",
            },
          },
        },
      },
    },
  },
  /**
   * Feature 07 established that without an explicit `required` list the model
   * omits fields it was plainly asked for and returns a near-empty object.
   */
  required: ["summary", "roles"],
};

const PROMPT_HEADER = `You are writing the prose sections of a professional resume from structured profile data.

Return only two things: a professional summary, and rewritten bullet points for each role.

Rules:
- Ground every sentence in the profile data below. Never invent an employer, metric, technology, or achievement that is not present.
- Do not state numbers the data does not contain. If no metric is given, write the accomplishment without one.
- summary: 2-3 sentences, at most ${MAX_SUMMARY_CHARS} characters, opening with seniority and field.
- The summary must contain no pronouns at all. Never write "I", "my", "we", "he", "she", or "they". Write "Principal engineer who leads...", never "I lead...".
- bullets: rewrite each role's responsibilities into at most ${MAX_BULLETS_PER_ROLE} achievement-oriented bullets. Start each with a strong past-tense verb, except for a role still in progress, which uses present tense.
- Never begin a bullet with "Responsible for". Do not end bullets with a period.
- index: copy the role's index exactly as given. Return one entry per role provided, in the same order.

PROFILE DATA:
`;

/** Only what the prose sections can legitimately draw on. Preferences, contact
 *  details, and links are irrelevant to writing and are left out of the prompt. */
function buildPromptPayload(profile: ProfileData, roles: WorkExperience[]): string {
  return JSON.stringify(
    {
      currentTitle: profile.current_title,
      experienceLevel: profile.experience_level,
      yearsExperience: profile.years_experience,
      skills: profile.skills ?? [],
      industries: profile.industries ?? [],
      education: profile.education,
      roles: roles.map((role, index) => ({
        index,
        jobTitle: role.jobTitle,
        companyName: role.companyName,
        startDate: role.startDate,
        endDate: role.currentlyWorking ? "Present" : role.endDate,
        currentlyWorking: role.currentlyWorking,
        responsibilities: role.keyResponsibilities,
      })),
    },
    null,
    2,
  );
}

function isValidProse(value: unknown): value is GeneratedResumeProse {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  const prose = value as Record<string, unknown>;
  if (typeof prose.summary !== "string") return false;
  if (prose.summary.length > MAX_SUMMARY_CHARS) return false;
  if (!Array.isArray(prose.roles)) return false;
  if (prose.roles.length > MAX_ROLES) return false;

  return prose.roles.every((role) => {
    if (typeof role !== "object" || role === null || Array.isArray(role)) return false;
    const entry = role as Record<string, unknown>;
    if (typeof entry.index !== "number" || !Number.isInteger(entry.index)) return false;
    if (!Array.isArray(entry.bullets)) return false;
    if (entry.bullets.length > MAX_BULLETS_PER_ROLE) return false;

    return entry.bullets.every((bullet) => {
      return typeof bullet === "string" && bullet.length <= 180;
    });
  });
}

export async function POST(): Promise<NextResponse> {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();

    if (!authData.user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const userId = authData.user.id;

    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle<ProfileData>();

    if (profileError) {
      console.error("[api/resume/generate] profile query error:", profileError);
      return NextResponse.json(
        { success: false, error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Save your profile before generating a resume." },
        { status: 404 },
      );
    }

    // Deliberately not is_complete: that flag also demands salary expectation and
    // cover letter tone, neither of which appears on a resume. This is the real
    // floor — below it the model has nothing to ground prose in and starts inventing.
    const roles = profile.work_experience ?? [];
    const hasEligibleRole = roles.some((role) => role?.keyResponsibilities?.trim());

    if (!profile.full_name?.trim() || !hasEligibleRole) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Add your name and at least one role with responsibilities before generating a resume.",
        },
        { status: 422 },
      );
    }

    const boundedRoles = roles.slice(0, MAX_ROLES);

    const result = await generateJson<GeneratedResumeProse>({
      prompt: PROMPT_HEADER + buildPromptPayload(profile, boundedRoles),
      schema: PROSE_SCHEMA,
      schemaName: "resume_prose",
      // Higher than extraction's 0.3: this is writing, not reading. Below ~0.6 the
      // summaries come out near-identical between users.
      temperature: 0.7,
      // Generous because provider-internal reasoning draws from this same budget.
      maxOutputTokens: 4000,
    });

    if (!result.ok) {
      const status =
        result.kind === "rate_limit" || result.kind === "quota_exhausted" ? 429 : 502;
      return NextResponse.json({ success: false, error: result.message }, { status });
    }

    if (!isValidProse(result.data)) {
      console.error("[api/resume/generate] invalid prose payload:", result.data);
      return NextResponse.json(
        { success: false, error: "The AI service returned malformed data." },
        { status: 502 },
      );
    }

    const buffer = await renderToBuffer(
      buildResumeDocument({
        profile: { ...profile, work_experience: boundedRoles },
        prose: result.data,
      }),
    );

    // A separate slot from the uploaded resume. Overwriting {userId}/resume.pdf
    // would destroy the user's own file and leave Feature 07's extraction reading
    // our generated prose back as if it were their resume.
    //
    // No upsert flag: this SDK's upload(path, file) takes no options, and writing
    // an existing key overwrites it silently — verified against the live bucket,
    // which is what makes regenerating after a profile edit work at all.
    const path = `${userId}/generated-resume.pdf`;

    const { data: uploaded, error: storageError } = await insforge.storage
      .from("resumes")
      .upload(
        path,
        new File([new Uint8Array(buffer)], "generated-resume.pdf", { type: "application/pdf" }),
      );

    if (storageError) {
      console.error("[api/resume/generate] storage error:", storageError);
      return NextResponse.json(
        { success: false, error: "Could not save the generated resume. Please try again." },
        { status: 500 },
      );
    }

    const url = uploaded?.url ?? insforge.storage.from("resumes").getPublicUrl(path);
    const key = uploaded?.key ?? path;

    const { error: dbError } = await insforge.database
      .from("profiles")
      .update({ generated_pdf_url: url, generated_pdf_key: key })
      .eq("id", userId);

    if (dbError) {
      console.error("[api/resume/generate] db error:", dbError);
      return NextResponse.json(
        { success: false, error: "Resume generated but could not be saved. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, url, provider: result.provider });
  } catch (error) {
    console.error("[api/resume/generate]", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { createInsforgeServer } from "@/lib/insforge-server";
import { generateJson } from "@/lib/ai";
import type { ExtractedProfile } from "@/types";

/**
 * Below this, the PDF is almost certainly image-based (a scan or an exported
 * design file) and pdf-parse returned page furniture rather than a resume.
 * Sending that to the model produces confidently invented fields, which is far
 * worse than a clean error.
 */
const MIN_TEXT_LENGTH = 200;

/** Cap the prompt — free-tier limits are per-minute, and resumes are short. */
const MAX_TEXT_LENGTH = 20000;

/**
 * Enum-constrained where the form uses a <select>, so the model cannot return
 * "Mid-level" for a field whose only valid value is "Mid".
 */
const EXTRACTION_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    fullName: { type: "string" },
    phone: { type: "string" },
    location: { type: "string", description: "City, Country" },
    linkedinUrl: { type: "string" },
    portfolioUrl: { type: "string" },
    currentTitle: { type: "string", description: "Most recent job title" },
    experienceLevel: {
      anyOf: [{ type: "string", enum: ["Junior", "Mid", "Senior", "Lead"] }, { type: "null" }],
    },
    yearsExperience: { anyOf: [{ type: "integer" }, { type: "null" }] },
    // maxItems bounds the reply. Without it the model can pad arrays until it
    // exhausts max_output_tokens and returns truncated JSON.
    skills: { type: "array", maxItems: 30, items: { type: "string" } },
    industries: { type: "array", maxItems: 5, items: { type: "string" } },
    workExperiences: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          companyName: { type: "string" },
          jobTitle: { type: "string" },
          startDate: { type: "string", description: "YYYY-MM if known" },
          endDate: { type: "string", description: "YYYY-MM, or empty if current" },
          currentlyWorking: { type: "boolean" },
          keyResponsibilities: {
            type: "string",
            description: "One short paragraph, at most 300 characters",
          },
        },
      },
    },
    highestDegree: {
      anyOf: [
        { type: "string", enum: ["High School", "Associate", "Bachelor's", "Master's", "PhD"] },
        { type: "null" },
      ],
    },
    fieldOfStudy: { type: "string" },
    institutionName: { type: "string" },
    graduationYear: { type: "string" },
  },
  /**
   * Without this the model omits core fields it can plainly see, returning a
   * near-empty object. Listed fields are the ones every resume has; anything
   * genuinely absent still comes back as an empty string or array, which
   * applyExtracted() skips rather than writing over existing input.
   */
  required: ["fullName", "currentTitle", "yearsExperience", "skills", "workExperiences"],
};

const PROMPT_HEADER = `You are extracting structured profile data from a resume.

Rules:
- Only return what the resume actually states. Never invent or infer a value that is not supported by the text.
- Omit any field the resume does not cover. An omitted field is correct; a guessed one is not.
- yearsExperience: total professional years, as an integer. Estimate from employment dates only if they are present.
- experienceLevel: infer from seniority of titles and total years.
- workExperiences: most recent first, maximum 3.
- keyResponsibilities: one short paragraph per role, drawn from the resume's own bullet points.
- skills: concrete technologies, tools, and languages only. Not soft skills.

RESUME TEXT:
`;

function isValidExtractedProfile(value: unknown): value is ExtractedProfile {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const profile = value as Record<string, unknown>;
  const isOptionalString = (candidate: unknown) => candidate === undefined || typeof candidate === "string";
  const isOptionalNullString = (candidate: unknown) => candidate === undefined || candidate === null || typeof candidate === "string";
  const isOptionalNumber = (candidate: unknown) => candidate === undefined || candidate === null || (typeof candidate === "number" && Number.isFinite(candidate));
  const isOptionalStringArray = (candidate: unknown) =>
    candidate === undefined ||
    (Array.isArray(candidate) && candidate.every((item) => typeof item === "string"));
  const isValidWorkExperience = (candidate: unknown) => {
    if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) {
      return false;
    }
    const item = candidate as Record<string, unknown>;
    return (
      isOptionalString(item.companyName) &&
      isOptionalString(item.jobTitle) &&
      isOptionalString(item.startDate) &&
      isOptionalString(item.endDate) &&
      (item.currentlyWorking === undefined || typeof item.currentlyWorking === "boolean") &&
      isOptionalString(item.keyResponsibilities)
    );
  };

  return (
    isOptionalString(profile.fullName) &&
    isOptionalString(profile.phone) &&
    isOptionalString(profile.location) &&
    isOptionalString(profile.linkedinUrl) &&
    isOptionalString(profile.portfolioUrl) &&
    isOptionalString(profile.currentTitle) &&
    isOptionalNullString(profile.experienceLevel) &&
    isOptionalNumber(profile.yearsExperience) &&
    isOptionalStringArray(profile.skills) &&
    isOptionalStringArray(profile.industries) &&
    (profile.workExperiences === undefined ||
      (Array.isArray(profile.workExperiences) &&
        profile.workExperiences.every((workExperience) => isValidWorkExperience(workExperience)))) &&
    isOptionalNullString(profile.highestDegree) &&
    isOptionalString(profile.fieldOfStudy) &&
    isOptionalString(profile.institutionName) &&
    isOptionalString(profile.graduationYear)
  );
}

export async function POST(): Promise<NextResponse> {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();

    if (!authData.user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("resume_pdf_key")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[api/resume/extract] profile query error:", profileError);
      return NextResponse.json(
        { success: false, error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }

    const key = profile?.resume_pdf_key as string | null;

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Upload a resume first." },
        { status: 404 },
      );
    }

    // The file left the browser at upload time, so it is fetched back from the
    // private bucket by key rather than read from the request.
    const { data: blob, error: storageError } = await insforge.storage
      .from("resumes")
      .download(key);

    if (storageError || !blob) {
      console.error("[api/resume/extract] storage error:", storageError);
      return NextResponse.json(
        { success: false, error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }

    let text: string;

    // pdf-parse v2 is a class, not the v1 default-export function: construct,
    // getText(), then destroy() to release the document.
    let parser: PDFParse | null = null;

    try {
      parser = new PDFParse({ data: new Uint8Array(await blob.arrayBuffer()) });
      const parsed = await parser.getText();
      text = (parsed.text ?? "").trim();
    } catch (error) {
      console.error("[api/resume/extract] pdf parse error:", error);

      // A throw here is not evidence of a bad file. pdfjs fails this way when
      // its worker cannot be resolved, which is our problem, not the user's —
      // telling them to "try a different file" sends them off re-uploading
      // perfectly good resumes. Only explicitly malformed or unreadable PDFs get
      // the user's-file message; unknown parser failures are server errors.
      const message = String(error);
      const isEnvironmentFailure =
        message.includes("fake worker") ||
        message.includes("Cannot find module") ||
        message.includes("worker");
      const isExplicitPdfProblem =
        /invalid pdf|unexpected eof|end-of-file|xref|missing xref|bad xref|failed to parse|could not read pdf|pdf is corrupted|file is not a valid pdf/i.test(
          message,
        );

      if (isEnvironmentFailure) {
        return NextResponse.json(
          {
            success: false,
            error: "Could not read the PDF on the server. This is a problem on our side, not with your file.",
          },
          { status: 500 },
        );
      }

      if (isExplicitPdfProblem) {
        return NextResponse.json(
          {
            success: false,
            error: "Could not extract text from this PDF. Please try a different file.",
          },
          { status: 422 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Something went wrong. Please try again.",
        },
        { status: 500 },
      );
    } finally {
      // Guarded: destroy() runs against a parser that may have failed to load.
      if (parser) {
        await parser.destroy().catch(() => {});
      }
    }

    // Checked before calling the model — costs nothing and catches scanned PDFs.
    if (text.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not extract text from this PDF. Please try a different file.",
        },
        { status: 422 },
      );
    }

    const result = await generateJson<ExtractedProfile>({
      prompt: PROMPT_HEADER + text.slice(0, MAX_TEXT_LENGTH),
      schema: EXTRACTION_SCHEMA,
      schemaName: "extracted_profile",
      temperature: 0.3,
      // Generous because provider-internal reasoning draws from this same
      // budget — see lib/ai/gemini.ts.
      maxOutputTokens: 4000,
    });

    if (!result.ok) {
      // 429 for both quota kinds so the client can tell a quota pause apart
      // from a broken file; the message already distinguishes the two.
      const status =
        result.kind === "rate_limit" || result.kind === "quota_exhausted" ? 429 : 502;
      return NextResponse.json({ success: false, error: result.message }, { status });
    }

    if (!isValidExtractedProfile(result.data)) {
      console.error("[api/resume/extract] invalid profile payload:", result.data);
      return NextResponse.json(
        { success: false, error: "The AI service returned malformed data." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, data: result.data, provider: result.provider });
  } catch (error) {
    console.error("[api/resume/extract]", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

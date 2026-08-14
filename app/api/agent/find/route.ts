import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { capturePostHogEvent } from "@/lib/posthog-server";
import { discoverJobs } from "@/agent/adzuna";
import type { ProfileData } from "@/types";

type FindJobsRequest = {
  jobTitle: string;
  location: string;
};

function isFindJobsRequest(value: unknown): value is FindJobsRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    "jobTitle" in value &&
    "location" in value &&
    typeof (value as FindJobsRequest).jobTitle === "string" &&
    typeof (value as FindJobsRequest).location === "string"
  );
}

/**
 * Below this the model has nothing to ground matchedSkills/missingSkills in
 * and will invent them — mirrors Feature 08's minimal-subset gate rather than
 * requiring is_complete, which also demands fields matching doesn't use.
 */
function hasMinimalProfile(profile: ProfileData): boolean {
  const hasSkills = (profile.skills?.length ?? 0) > 0;
  const hasTitleOrRole =
    Boolean(profile.current_title?.trim()) || (profile.work_experience?.length ?? 0) > 0;

  return hasSkills && hasTitleOrRole;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();

    if (!isFindJobsRequest(body) || !body.jobTitle.trim()) {
      return NextResponse.json(
        { success: false, error: "Job title is required." },
        { status: 400 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();

    if (!authData.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("[agent/find] profile query error:", profileError);
      return NextResponse.json(
        { success: false, error: "Could not load your profile. Please try again." },
        { status: 500 },
      );
    }

    if (!hasMinimalProfile(profile as ProfileData)) {
      return NextResponse.json(
        {
          success: false,
          error: "Add your skills and current title before searching.",
        },
        { status: 422 },
      );
    }

    await capturePostHogEvent({
      distinctId: authData.user.id,
      event: "job_search_started",
      properties: {
        userId: authData.user.id,
        jobTitle: body.jobTitle,
        location: body.location,
      },
    });

    const result = await discoverJobs(
      body.jobTitle,
      body.location,
      profile as ProfileData,
      authData.user.id,
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }

    for (let i = 0; i < result.saved; i++) {
      await capturePostHogEvent({
        distinctId: authData.user.id,
        event: "job_found",
        properties: { userId: authData.user.id, source: "search" },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        found: result.found,
        saved: result.saved,
        strongMatches: result.strongMatches,
      },
    });
  } catch (error) {
    console.error("[agent/find]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

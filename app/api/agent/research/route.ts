import { NextRequest, NextResponse } from "next/server";
import { researchCompany } from "@/agent/research";
import { createInsforgeServer } from "@/lib/insforge-server";
import { capturePostHogEvent } from "@/lib/posthog-server";
import type { JobRow, ProfileData } from "@/types";

type ResearchRequest = { jobId: string };

function isResearchRequest(value: unknown): value is ResearchRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    "jobId" in value &&
    typeof (value as ResearchRequest).jobId === "string"
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();

    if (!isResearchRequest(body)) {
      return NextResponse.json(
        { success: false, error: "jobId is required." },
        { status: 400 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();

    if (!authData.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const userId = authData.user.id;

    const { data: job, error: jobError } = await insforge.database
      .from("jobs")
      .select("*")
      .eq("id", body.jobId)
      .eq("user_id", userId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ success: false, error: "Job not found." }, { status: 404 });
    }

    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found." },
        { status: 404 },
      );
    }

    const result = await researchCompany(job as JobRow, profile as ProfileData);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }

    const { error: updateError } = await insforge.database
      .from("jobs")
      .update({
        company_research: result.dossier,
        company_researched_at: new Date().toISOString(),
      })
      .eq("id", body.jobId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("[agent/research] failed to save dossier:", updateError);
      return NextResponse.json(
        { success: false, error: "Research completed but could not be saved. Please try again." },
        { status: 500 },
      );
    }

    await capturePostHogEvent({
      distinctId: userId,
      event: "company_researched",
      properties: {
        userId,
        jobId: body.jobId,
        company: (job as JobRow).company ?? "",
      },
    });

    return NextResponse.json({ success: true, data: { research: result.dossier } });
  } catch (error) {
    console.error("[agent/research]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

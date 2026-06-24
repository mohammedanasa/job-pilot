import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { capturePostHogEvent } from "@/lib/posthog-server";

type ResearchRequest = {
  jobId: string;
  company: string;
};

function isResearchRequest(value: unknown): value is ResearchRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    "jobId" in value &&
    "company" in value &&
    typeof (value as ResearchRequest).jobId === "string" &&
    typeof (value as ResearchRequest).company === "string"
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();

    if (!isResearchRequest(body)) {
      return NextResponse.json(
        { success: false, error: "jobId and company are required." },
        { status: 400 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data } = await insforge.auth.getCurrentUser();

    if (!data.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    // TODO: implement Browserbase + Stagehand company research and GPT-4o synthesis
    await capturePostHogEvent({
      distinctId: data.user.id,
      event: "company_researched",
      properties: {
        userId: data.user.id,
        jobId: body.jobId,
        company: body.company,
      },
    });

    return NextResponse.json({ success: true, data: { research: null } });
  } catch (error) {
    console.error("[agent/research]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

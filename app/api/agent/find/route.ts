import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { capturePostHogEvent } from "@/lib/posthog-server";

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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();

    if (!isFindJobsRequest(body)) {
      return NextResponse.json(
        { success: false, error: "jobTitle and location are required." },
        { status: 400 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data } = await insforge.auth.getCurrentUser();

    if (!data.user) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    await capturePostHogEvent({
      distinctId: data.user.id,
      event: "job_search_started",
      properties: {
        userId: data.user.id,
        jobTitle: body.jobTitle,
        location: body.location,
      },
    });

    // TODO: implement Adzuna job discovery and GPT-4o scoring
    // For each job found and saved, fire:
    // await capturePostHogEvent({
    //   distinctId: data.user.id,
    //   event: "job_found",
    //   properties: {
    //     userId: data.user.id,
    //     source: "search",
    //     matchScore: job.match_score,
    //   },
    // });

    return NextResponse.json({ success: true, data: { jobs: [] } });
  } catch (error) {
    console.error("[agent/find]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

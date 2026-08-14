import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";

/**
 * Two documents live in the private bucket: the resume the user uploaded and the
 * one Feature 08 generated for them. `?type=generated` selects the latter.
 * Anything else — including a missing or misspelled value — serves the upload,
 * which is what a bare link has always meant.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();

    if (!authData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const wantsGenerated = req.nextUrl.searchParams.get("type") === "generated";
    const column = wantsGenerated ? "generated_pdf_key" : "resume_pdf_key";

    const { data: profile } = await insforge.database
      .from("profiles")
      .select(column)
      .eq("id", authData.user.id)
      .maybeSingle();

    const key = (profile as Record<string, unknown> | null)?.[column] as string | null;

    if (!key) {
      return NextResponse.json(
        { error: wantsGenerated ? "No generated resume on file" : "No resume on file" },
        { status: 404 },
      );
    }

    const { data: blob, error } = await insforge.storage.from("resumes").download(key);

    if (error || !blob) {
      console.error("[api/resume/download] storage error:", error);
      return NextResponse.json({ error: "Failed to download resume" }, { status: 500 });
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const filename = wantsGenerated ? "generated-resume.pdf" : "resume.pdf";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[api/resume/download]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

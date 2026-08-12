import { NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function GET(): Promise<NextResponse> {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();

    if (!authData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await insforge.database
      .from("profiles")
      .select("resume_pdf_key")
      .eq("id", authData.user.id)
      .maybeSingle();

    const key = profile?.resume_pdf_key as string | null;

    if (!key) {
      return NextResponse.json({ error: "No resume on file" }, { status: 404 });
    }

    const { data: blob, error } = await insforge.storage.from("resumes").download(key);

    if (error || !blob) {
      console.error("[api/resume/download] storage error:", error);
      return NextResponse.json({ error: "Failed to download resume" }, { status: 500 });
    }

    const buffer = Buffer.from(await blob.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"resume.pdf\"",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[api/resume/download]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

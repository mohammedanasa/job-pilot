import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();

    if (!authData.user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are accepted" },
        { status: 400 },
      );
    }

    const userId = authData.user.id;
    const path = `${userId}/resume.pdf`;

    const { data, error } = await insforge.storage
      .from("resumes")
      .upload(path, file);

    if (error) {
      console.error("[api/resume/upload] storage error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to upload resume" },
        { status: 500 },
      );
    }

    const url = data?.url ?? insforge.storage.from("resumes").getPublicUrl(path);
    const key = data?.key ?? path;

    // Persist immediately — independent of Save Profile
    const { error: dbError } = await insforge.database
      .from("profiles")
      .upsert({ id: userId, resume_pdf_url: url, resume_pdf_key: key });

    if (dbError) {
      console.error("[api/resume/upload] db error:", dbError);
      return NextResponse.json(
        { success: false, error: "File uploaded but failed to save URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("[api/resume/upload]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

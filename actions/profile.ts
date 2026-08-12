"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";
import { capturePostHogEvent } from "@/lib/posthog-server";
import type { ProfileFormData } from "@/types";

function computeCompletion(data: ProfileFormData): {
  isComplete: boolean;
  percentage: number;
  missingFields: string[];
} {
  const checks: Array<{ label: string; filled: boolean }> = [
    { label: "Full Name", filled: data.fullName.trim().length > 0 },
    { label: "Phone", filled: data.phone.trim().length > 0 },
    { label: "Location", filled: data.location.trim().length > 0 },
    { label: "Job Title", filled: data.currentTitle.trim().length > 0 },
    { label: "Experience Level", filled: data.experienceLevel.trim().length > 0 },
    { label: "Years Experience", filled: parseInt(data.yearsExperience, 10) > 0 },
    { label: "Skills", filled: data.skills.length > 0 },
    { label: "Experience", filled: data.workExperiences.length > 0 },
    { label: "Education", filled: data.highestDegree.trim().length > 0 },
  ];

  const missing = checks.filter((c) => !c.filled).map((c) => c.label);
  const filled = checks.filter((c) => c.filled).length;
  const percentage = Math.round((filled / checks.length) * 100);

  return {
    isComplete: missing.length === 0,
    percentage,
    missingFields: missing,
  };
}

export async function saveProfile(
  data: ProfileFormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();

    if (!authData.user) {
      return { success: false, error: "Not authenticated" };
    }

    const user = authData.user;
    const { isComplete } = computeCompletion(data);

    const { data: existingProfile } = await insforge.database
      .from("profiles")
      .select("is_complete")
      .eq("id", user.id)
      .maybeSingle();

    const wasAlreadyComplete = existingProfile?.is_complete === true;

    const jobTitlesSeeking = data.jobTitlesSeeking
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const preferredLocations = data.preferredLocations
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const education = {
      degree: data.highestDegree,
      fieldOfStudy: data.fieldOfStudy,
      institution: data.institutionName,
      graduationYear: data.graduationYear,
    };

    const row: Record<string, unknown> = {
      id: user.id,
      full_name: data.fullName || null,
      phone: data.phone || null,
      location: data.location || null,
      current_title: data.currentTitle || null,
      experience_level: data.experienceLevel || null,
      years_experience: parseInt(data.yearsExperience, 10) || null,
      skills: data.skills,
      industries: data.industries,
      work_experience: data.workExperiences,
      education,
      job_titles_seeking: jobTitlesSeeking,
      remote_preference: data.remotePreference || null,
      preferred_locations: preferredLocations,
      salary_expectation: data.salaryExpectation || null,
      cover_letter_tone: data.coverLetterTone || null,
      linkedin_url: data.linkedinUrl || null,
      portfolio_url: data.portfolioUrl || null,
      work_authorization: data.workAuthorization || null,
      is_complete: isComplete,
    };

    if (data.resumePdfUrl) {
      row.resume_pdf_url = data.resumePdfUrl;
    }

    const { error } = await insforge.database.from("profiles").upsert(row);

    if (error) {
      console.error("[actions/profile] upsert error:", error);
      return { success: false, error: "Failed to save profile" };
    }

    if (isComplete && !wasAlreadyComplete) {
      await capturePostHogEvent({
        distinctId: user.id,
        event: "profile_completed",
        properties: { userId: user.id },
      });
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("[actions/profile]", error);
    return { success: false, error: "Failed to save profile" };
  }
}

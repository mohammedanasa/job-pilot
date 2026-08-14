import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { CompletionBanner } from "@/components/profile/CompletionBanner";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { ProfileData } from "@/types";
import type { ReactElement } from "react";

const REQUIRED_FIELD_CHECKS: Array<{
  label: string;
  check: (p: ProfileData) => boolean;
}> = [
  { label: "Full Name", check: (p) => !!p.full_name },
  { label: "Phone", check: (p) => !!p.phone },
  { label: "Location", check: (p) => !!p.location },
  { label: "Job Title", check: (p) => !!p.current_title },
  { label: "Experience Level", check: (p) => !!p.experience_level },
  { label: "Years Experience", check: (p) => (p.years_experience ?? 0) > 0 },
  { label: "Skills", check: (p) => (p.skills?.length ?? 0) > 0 },
  { label: "Experience", check: (p) => (p.work_experience?.length ?? 0) > 0 },
  { label: "Education", check: (p) => !!p.education?.degree },
];

function computeCompletion(profile: ProfileData | null): {
  percentage: number;
  missingFields: string[];
} {
  if (!profile) {
    return {
      percentage: 0,
      missingFields: REQUIRED_FIELD_CHECKS.map((c) => c.label),
    };
  }

  const missing = REQUIRED_FIELD_CHECKS.filter((c) => !c.check(profile)).map((c) => c.label);
  const filled = REQUIRED_FIELD_CHECKS.length - missing.length;
  const percentage = Math.round((filled / REQUIRED_FIELD_CHECKS.length) * 100);

  return { percentage, missingFields: missing };
}

export default async function ProfilePage(): Promise<ReactElement> {
  const insforge = await createInsforgeServer();
  const { data: authData } = await insforge.auth.getCurrentUser();

  if (!authData.user) {
    redirect("/login");
  }

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle();

  const { percentage, missingFields } = computeCompletion(profile as ProfileData | null);

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="mx-auto max-w-[1268px] px-6 py-8">
        <div className="flex flex-col gap-6">
          {percentage < 100 && (
            <CompletionBanner percentage={percentage} missingFields={missingFields} />
          )}
          <ProfileForm
            initialData={profile as ProfileData | null}
            userEmail={authData.user.email ?? ""}
          />
        </div>
      </main>
    </div>
  );
}

import type { ReactElement } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { CompanyResearch } from "@/components/job-details/CompanyResearch";
import { JobActions } from "@/components/job-details/JobActions";
import { JobDescription } from "@/components/job-details/JobDescription";
import { JobInfo } from "@/components/job-details/JobInfo";
import { MatchScore } from "@/components/job-details/MatchScore";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { JobRow } from "@/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailsPage({ params }: Props): Promise<ReactElement> {
  const { id } = await params;

  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: job, error } = await insforge.database
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", data.user.id)
    .single();

  if (error || !job) {
    notFound();
  }

  const jobRow = job as JobRow;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="mx-auto flex max-w-[1268px] flex-col gap-6 px-6 py-8">
        <Link
          href="/find-jobs"
          className="flex w-fit items-center gap-1 text-sm font-medium leading-5 text-text-secondary hover:text-accent"
        >
          <ChevronLeft size={16} />
          Back to Jobs
        </Link>

        <JobInfo job={jobRow} />
        <MatchScore job={jobRow} />
        <JobDescription aboutRole={jobRow.about_role} applyUrl={jobRow.external_apply_url} />
        <CompanyResearch company={jobRow.company ?? "this company"} />
        <JobActions applyUrl={jobRow.external_apply_url} company={jobRow.company} />
      </main>
    </div>
  );
}

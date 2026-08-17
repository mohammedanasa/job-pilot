import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import {
  CompanyResearchActivityChart,
  JobsFoundOverTimeChart,
  MatchScoreDistributionChart,
} from "@/components/dashboard/AnalyticsCharts";
import { IncompleteProfileBanner } from "@/components/dashboard/IncompleteProfileBanner";
import { computeDashboardStats, type DashboardStatsInput } from "@/lib/dashboard-stats";
import {
  buildCompanyResearchActivity,
  buildJobsFoundOverTime,
  buildMatchScoreDistribution,
} from "@/lib/analytics-charts";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  buildRecentActivity,
  type AgentRunRow,
  type ResearchedJobRow,
} from "@/lib/recent-activity";
import type { ReactElement } from "react";

const ACTIVITY_QUERY_LIMIT = 10;

type DashboardChartsInput = DashboardStatsInput & {
  company_researched_at: string | null;
};

export default async function DashboardPage(): Promise<ReactElement> {
  const insforge = await createInsforgeServer();
  const { data: authData } = await insforge.auth.getCurrentUser();

  if (!authData.user) {
    redirect("/login");
  }

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("is_complete")
    .eq("id", authData.user.id)
    .maybeSingle();

  const isProfileComplete = (profile as { is_complete: boolean } | null)?.is_complete === true;

  const { data: jobs, error: jobsError } = await insforge.database
    .from("jobs")
    .select("match_score, company_research, found_at, company_researched_at")
    .eq("user_id", authData.user.id);

  if (jobsError) {
    console.error("[dashboard/page]", jobsError);
  }

  const dashboardJobs = (jobs as DashboardChartsInput[] | null) ?? [];

  const stats = computeDashboardStats(dashboardJobs);
  const jobsOverTime = buildJobsFoundOverTime(dashboardJobs);
  const companyResearchActivity = buildCompanyResearchActivity(dashboardJobs);
  const matchScoreDistribution = buildMatchScoreDistribution(dashboardJobs);

  const { data: runs, error: runsError } = await insforge.database
    .from("agent_runs")
    .select("id, job_title_searched, jobs_found, completed_at")
    .eq("user_id", authData.user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(ACTIVITY_QUERY_LIMIT);

  if (runsError) {
    console.error("[dashboard/page]", runsError);
  }

  const { data: researchedJobs, error: researchedJobsError } = await insforge.database
    .from("jobs")
    .select("id, company, company_researched_at")
    .eq("user_id", authData.user.id)
    .not("company_researched_at", "is", null)
    .order("company_researched_at", { ascending: false })
    .limit(ACTIVITY_QUERY_LIMIT);

  if (researchedJobsError) {
    console.error("[dashboard/page]", researchedJobsError);
  }

  const activity = buildRecentActivity(
    (runs as AgentRunRow[] | null) ?? [],
    (researchedJobs as ResearchedJobRow[] | null) ?? [],
  );

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="mx-auto flex max-w-[1268px] flex-col gap-6 px-6 py-8">
        {!isProfileComplete && <IncompleteProfileBanner />}

        <StatsBar stats={stats} />

        <div className="grid grid-cols-2 gap-6">
          <RecentActivity activity={activity} />
          <CompanyResearchActivityChart
            data={companyResearchActivity}
            hasData={dashboardJobs.some((job) => job.company_researched_at !== null)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <JobsFoundOverTimeChart data={jobsOverTime} hasData={dashboardJobs.length > 0} />
          <MatchScoreDistributionChart
            data={matchScoreDistribution}
            hasData={dashboardJobs.some((job) => job.match_score !== null)}
          />
        </div>
      </main>
    </div>
  );
}

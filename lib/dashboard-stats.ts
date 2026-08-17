import type { DashboardStat, JobRow } from "@/types";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type DashboardStatsInput = Pick<JobRow, "match_score" | "company_research" | "found_at">;

export function computeDashboardStats(jobs: DashboardStatsInput[]): DashboardStat[] {
  const totalJobsFound = jobs.length;

  const scored = jobs.filter((job) => job.match_score !== null);
  const avgMatchRate = scored.length
    ? Math.round(scored.reduce((sum, job) => sum + (job.match_score ?? 0), 0) / scored.length)
    : null;

  const companiesResearched = jobs.filter((job) => job.company_research !== null).length;

  const weekAgo = Date.now() - WEEK_MS;
  const jobsThisWeek = jobs.filter((job) => new Date(job.found_at).getTime() >= weekAgo).length;

  return [
    {
      label: "Total Jobs Found",
      value: String(totalJobsFound),
      trend: "",
      subtitle: "Total saved",
    },
    {
      label: "Avg. Match Rate",
      value: avgMatchRate === null ? "—" : `${avgMatchRate}%`,
      trend: "",
      subtitle: avgMatchRate === null ? "No scored jobs yet" : "Across scored jobs",
    },
    {
      label: "Companies Researched",
      value: String(companiesResearched),
      trend: "",
      subtitle: "Total researched",
    },
    {
      label: "Jobs This Week",
      value: String(jobsThisWeek),
      trend: "",
      subtitle: "New this week",
    },
  ];
}

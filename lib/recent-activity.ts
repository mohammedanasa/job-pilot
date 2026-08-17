import { formatRelativeDate } from "@/lib/utils";

export type AgentRunRow = {
  id: string;
  job_title_searched: string | null;
  jobs_found: number | null;
  completed_at: string | null;
};

export type ResearchedJobRow = {
  id: string;
  company: string | null;
  company_researched_at: string | null;
};

export type ActivityType = "job_search" | "company_research";

export type ActivityEntry = {
  id: string;
  type: ActivityType;
  text: string;
  timestamp: string;
};

const MAX_ACTIVITY_ENTRIES = 10;

export function buildRecentActivity(
  runs: AgentRunRow[],
  researchedJobs: ResearchedJobRow[],
): ActivityEntry[] {
  const runEntries: Array<ActivityEntry & { sortAt: number }> = runs
    .filter((run) => run.completed_at !== null)
    .map((run) => ({
      id: `run-${run.id}`,
      type: "job_search",
      text: `Found ${run.jobs_found ?? 0} jobs for ${run.job_title_searched ?? "your search"}`,
      timestamp: formatRelativeDate(run.completed_at as string),
      sortAt: new Date(run.completed_at as string).getTime(),
    }));

  const researchEntries: Array<ActivityEntry & { sortAt: number }> = researchedJobs
    .filter((job) => job.company_researched_at !== null)
    .map((job) => ({
      id: `research-${job.id}`,
      type: "company_research",
      text: `Researched ${job.company ?? "a company"}`,
      timestamp: formatRelativeDate(job.company_researched_at as string),
      sortAt: new Date(job.company_researched_at as string).getTime(),
    }));

  return [...runEntries, ...researchEntries]
    .sort((a, b) => b.sortAt - a.sortAt)
    .slice(0, MAX_ACTIVITY_ENTRIES)
    .map(({ id, type, text, timestamp }) => ({ id, type, text, timestamp }));
}

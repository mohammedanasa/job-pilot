import type { JobRow } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const JOBS_OVER_TIME_WINDOW_DAYS = 30;
const RESEARCH_ACTIVITY_WINDOW_DAYS = 7;

const SCORE_RANGES = [
  { range: "50-60%", min: 50, max: 60 },
  { range: "60-70%", min: 60, max: 70 },
  { range: "70-80%", min: 70, max: 80 },
  { range: "80-90%", min: 80, max: 90 },
  { range: "90-100%", min: 90, max: 100 },
] as const;

export type DayCount = { day: string; count: number };
export type ScoreRangeCount = { range: string; count: number };

function dayKey(isoDate: string): string {
  return new Date(isoDate).toISOString().slice(0, 10); // UTC calendar day
}

function dayLabel(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}

/** Builds the last `windowDays` UTC calendar days, oldest first, ending today. */
function buildDayWindow(windowDays: number): string[] {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const todayStart = new Date(`${todayKey}T00:00:00Z`).getTime();

  return Array.from({ length: windowDays }, (_, i) => {
    const offset = windowDays - 1 - i;
    return new Date(todayStart - offset * DAY_MS).toISOString().slice(0, 10);
  });
}

function countByDay(timestamps: string[], windowDays: number): DayCount[] {
  const counts = new Map<string, number>();
  for (const iso of timestamps) {
    const key = dayKey(iso);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return buildDayWindow(windowDays).map((key) => ({
    day: dayLabel(key),
    count: counts.get(key) ?? 0,
  }));
}

export type JobsOverTimeInput = Pick<JobRow, "found_at">;

export function buildJobsFoundOverTime(jobs: JobsOverTimeInput[]): DayCount[] {
  return countByDay(
    jobs.map((job) => job.found_at),
    JOBS_OVER_TIME_WINDOW_DAYS,
  );
}

export type ResearchActivityInput = Pick<JobRow, "company_researched_at">;

export function buildCompanyResearchActivity(jobs: ResearchActivityInput[]): DayCount[] {
  const timestamps = jobs
    .map((job) => job.company_researched_at)
    .filter((ts): ts is string => ts !== null);

  return countByDay(timestamps, RESEARCH_ACTIVITY_WINDOW_DAYS);
}

export type MatchScoreInput = Pick<JobRow, "match_score">;

export function buildMatchScoreDistribution(jobs: MatchScoreInput[]): ScoreRangeCount[] {
  return SCORE_RANGES.map(({ range, min, max }) => ({
    range,
    count: jobs.filter(
      (job) =>
        job.match_score !== null &&
        job.match_score >= min &&
        (max === 100 ? job.match_score <= max : job.match_score < max),
    ).length,
  }));
}

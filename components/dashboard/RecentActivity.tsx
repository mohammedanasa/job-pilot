import type { ActivityEntry } from "@/lib/recent-activity";

type Props = {
  activity: ActivityEntry[];
};

const JOB_SEARCH_DOT_CLASSES = [
  { outer: "bg-accent-light", inner: "bg-accent" },
  { outer: "bg-success-light", inner: "bg-success-alt" },
];

const RESEARCH_DOT_CLASSES = { outer: "bg-info-light", inner: "bg-info" };

function getDotClasses(activity: ActivityEntry, jobSearchIndex: number): { outer: string; inner: string } {
  if (activity.type === "company_research") {
    return RESEARCH_DOT_CLASSES;
  }
  return JOB_SEARCH_DOT_CLASSES[jobSearchIndex % JOB_SEARCH_DOT_CLASSES.length];
}

function withJobSearchIndex(
  activity: ActivityEntry[],
): Array<{ entry: ActivityEntry; jobSearchIndex: number }> {
  let count = 0;
  return activity.map((entry) => {
    const jobSearchIndex = entry.type === "job_search" ? count : -1;
    if (entry.type === "job_search") {
      count += 1;
    }
    return { entry, jobSearchIndex };
  });
}

export function RecentActivity({ activity }: Props) {
  const indexedActivity = withJobSearchIndex(activity);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-base font-semibold leading-6 text-text-primary">Recent Activity</h2>

      {activity.length === 0 ? (
        <p className="mt-6 text-sm font-medium leading-5 text-text-muted">
          No activity yet. Start a search to see it here.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {indexedActivity.map(({ entry, jobSearchIndex }) => {
            const dot = getDotClasses(entry, jobSearchIndex);

            return (
              <li key={entry.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                <span
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-surface ${dot.outer}`}
                >
                  <span className={`h-2 w-2 rounded-full ${dot.inner}`} />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-5 text-text-primary">
                    {entry.text}
                  </span>
                  <span className="text-xs font-normal leading-4 text-text-muted">
                    {entry.timestamp}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

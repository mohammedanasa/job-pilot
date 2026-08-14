import { Building2, Search } from "lucide-react";
import { MatchScoreBar } from "@/components/find-jobs/MatchScoreBar";
import { SourceBadge } from "@/components/find-jobs/SourceBadge";
import { formatRelativeDate } from "@/lib/utils";
import type { JobRow } from "@/types";

type Props = {
  jobs: JobRow[];
};

export function JobsTable({ jobs }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
        <Search size={20} className="text-text-muted" />
        <p className="text-sm font-medium leading-5 text-text-muted">
          No jobs yet. Run a search above to find your first matches.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-border">
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Company
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Role
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Match Score
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Salary Est.
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Source
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            Date Found
          </th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.id} className="border-b border-border last:border-b-0 hover:bg-surface-secondary">
            <td className="px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-secondary text-text-secondary">
                  <Building2 size={16} />
                </span>
                <span className="text-sm font-medium leading-5 text-text-primary">
                  {job.company}
                </span>
              </div>
            </td>
            <td className="px-4 py-4 text-sm font-medium leading-5 text-text-primary">
              {job.title}
            </td>
            <td className="px-4 py-4">
              {job.match_score !== null ? (
                <MatchScoreBar score={job.match_score} />
              ) : (
                <span className="text-sm text-text-muted">—</span>
              )}
            </td>
            <td className="px-4 py-4 text-sm font-medium leading-5 text-text-primary">
              {job.salary ?? "—"}
            </td>
            <td className="px-4 py-4">
              <SourceBadge source={job.source} />
            </td>
            <td className="px-4 py-4 text-sm font-medium leading-5 text-text-secondary">
              {formatRelativeDate(job.found_at)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import type { ReactElement } from "react";
import { Sparkles } from "lucide-react";
import type { JobRow } from "@/types";

type Props = {
  job: JobRow;
};

export function MatchScore({ job }: Props): ReactElement | null {
  if (!job.match_reason && !job.matched_skills?.length && !job.missing_skills?.length) {
    return null;
  }

  return (
    <>
      {job.match_reason && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-lightest text-success">
              <Sparkles size={14} />
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              AI Match Reasoning
            </span>
          </div>
          <p className="text-sm font-medium leading-6 text-text-primary">{job.match_reason}</p>
        </div>
      )}

      {(job.matched_skills?.length || job.missing_skills?.length) && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Required Skills vs Your Profile
          </span>

          {job.matched_skills && job.matched_skills.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium leading-5 text-text-muted">You have</p>
              <div className="flex flex-wrap gap-2">
                {job.matched_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-success-lightest px-3 py-1 text-sm font-medium leading-5 text-success-foreground"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.missing_skills && job.missing_skills.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium leading-5 text-text-muted">Gap skills</p>
              <div className="flex flex-wrap gap-2">
                {job.missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-accent-muted px-3 py-1 text-sm font-medium leading-5 text-accent"
                  >
                    × {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

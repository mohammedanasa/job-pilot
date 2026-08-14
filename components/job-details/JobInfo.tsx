import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { Briefcase, Building2, Calendar, DollarSign, ExternalLink, MapPin } from "lucide-react";
import { MATCH_THRESHOLD, formatRelativeDate } from "@/lib/utils";
import type { JobRow } from "@/types";

type Props = {
  job: JobRow;
};

type MatchBadgeProps = {
  score: number;
};

function MatchBadge({ score }: MatchBadgeProps): ReactElement {
  const isStrong = score >= MATCH_THRESHOLD;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-4 ${
        isStrong ? "bg-success-lightest text-success-foreground" : "bg-surface-secondary text-text-secondary"
      }`}
    >
      {score}% Match Score
    </span>
  );
}

export function JobInfo({ job }: Props): ReactElement {
  return (
    <>
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-secondary text-text-secondary">
            <Building2 size={24} />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold leading-7 text-text-primary">{job.title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium leading-5 text-text-secondary">{job.company}</span>
              {job.match_score !== null && (
                <>
                  <span className="text-text-muted">•</span>
                  <MatchBadge score={job.match_score} />
                </>
              )}
            </div>
          </div>
        </div>

        {job.external_apply_url && (
          <Link
            href={job.external_apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 shrink-0 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium leading-5 text-text-primary hover:bg-surface-secondary"
          >
            <ExternalLink size={16} />
            View Job Post
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <InfoCard
          icon={<DollarSign size={16} />}
          iconClass="bg-success-lightest text-success"
          label="Salary Est."
          value={job.salary ?? "—"}
        />
        <InfoCard
          icon={<MapPin size={16} />}
          iconClass="bg-info-lightest text-info"
          label="Location"
          value={job.location ?? "—"}
        />
        <InfoCard
          icon={<Briefcase size={16} />}
          iconClass="bg-accent-muted text-accent"
          label="Job Type"
          value={job.job_type ?? "—"}
        />
        <InfoCard
          icon={<Calendar size={16} />}
          iconClass="bg-surface-secondary text-text-secondary"
          label="Date Found"
          value={formatRelativeDate(job.found_at)}
        />
      </div>
    </>
  );
}

type InfoCardProps = {
  icon: ReactNode;
  iconClass: string;
  label: string;
  value: string;
};

function InfoCard({ icon, iconClass, label, value }: InfoCardProps): ReactElement {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
        {icon}
      </span>
      <div className="flex flex-col gap-0.5 overflow-hidden">
        <span className="truncate text-sm font-semibold leading-5 text-text-primary">{value}</span>
        <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</span>
      </div>
    </div>
  );
}

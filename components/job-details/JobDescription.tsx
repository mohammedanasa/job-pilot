import type { ReactElement } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

type Props = {
  aboutRole: string | null;
  applyUrl: string | null;
};

// Adzuna's search API caps `description` at exactly 500 characters and
// trails it with an ellipsis — confirmed live against several listings.
// There is no more text to recover on our side; the full posting only
// exists at the original URL.
const ADZUNA_SNIPPET_LENGTH = 500;

function isLikelyTruncated(aboutRole: string): boolean {
  return aboutRole.length >= ADZUNA_SNIPPET_LENGTH;
}

export function JobDescription({ aboutRole, applyUrl }: Props): ReactElement {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-secondary text-text-secondary">
          <FileText size={14} />
        </span>
        <h2 className="text-base font-semibold leading-6 text-text-primary">Job Description</h2>
      </div>
      {aboutRole ? (
        <>
          <p className="whitespace-pre-line text-sm font-medium leading-6 text-text-primary">
            {aboutRole}
          </p>
          {isLikelyTruncated(aboutRole) && applyUrl && (
            <Link
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
            >
              Read the full description on the original posting →
            </Link>
          )}
        </>
      ) : (
        <p className="text-sm font-medium leading-6 text-text-muted">
          No description available for this job.
        </p>
      )}
    </div>
  );
}

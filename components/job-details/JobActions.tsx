import type { ReactElement } from "react";
import Link from "next/link";

type Props = {
  applyUrl: string | null;
  company: string | null;
};

export function JobActions({ applyUrl, company }: Props): ReactElement | null {
  if (!applyUrl) return null;

  return (
    <Link
      href={applyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-12 w-full items-center justify-center rounded-md bg-accent text-sm font-semibold leading-5 text-accent-foreground hover:bg-accent-dark"
    >
      Apply Now{company ? ` at ${company}` : ""}
    </Link>
  );
}

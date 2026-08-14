import Link from "next/link";
import { PAGE_SIZE, buildJobsHref, totalPages } from "@/lib/job-filters";
import type { JobFilters } from "@/types";
import type { ReactElement } from "react";

const pageButtonClass =
  "flex h-9 min-w-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium leading-5 text-text-primary";

/** Beyond this many pages the strip collapses to first / neighbours / last. */
const MAX_VISIBLE_PAGES = 7;

type Props = {
  filters: JobFilters;
  totalCount: number;
};

function pageWindow(current: number, total: number): Array<number | "gap"> {
  if (total <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const anchors = [1, current - 1, current, current + 1, total]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const window: Array<number | "gap"> = [];
  let previous = 0;

  for (const page of anchors) {
    if (page === previous) continue;
    if (previous > 0 && page - previous > 1) window.push("gap");
    window.push(page);
    previous = page;
  }

  return window;
}

export function Pagination({ filters, totalCount }: Props): ReactElement | null {
  if (totalCount === 0) return null;

  const total = totalPages(totalCount);
  const page = Math.min(filters.page, total);
  const firstShown = (page - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <div className="flex flex-col gap-3 border-t border-border p-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm font-medium leading-5 text-text-secondary">
        Showing <span className="font-semibold text-text-primary">{firstShown}</span> to{" "}
        <span className="font-semibold text-text-primary">{lastShown}</span> of{" "}
        <span className="font-semibold text-text-primary">{totalCount}</span> result
        {totalCount === 1 ? "" : "s"}
      </p>

      {total > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link
              href={buildJobsHref({ ...filters, page: page - 1 })}
              scroll={false}
              className={`${pageButtonClass} hover:bg-surface-secondary`}
            >
              Previous
            </Link>
          ) : (
            <span className={`${pageButtonClass} text-text-muted`}>Previous</span>
          )}

          {pageWindow(page, total).map((entry, index) =>
            entry === "gap" ? (
              <span
                key={`gap-${index}`}
                className="px-1 text-sm font-medium leading-5 text-text-muted"
              >
                ...
              </span>
            ) : entry === page ? (
              <span
                key={entry}
                aria-current="page"
                className={`${pageButtonClass} border-accent bg-accent-light text-accent`}
              >
                {entry}
              </span>
            ) : (
              <Link
                key={entry}
                href={buildJobsHref({ ...filters, page: entry })}
                scroll={false}
                className={`${pageButtonClass} hover:bg-surface-secondary`}
              >
                {entry}
              </Link>
            ),
          )}

          {page < total ? (
            <Link
              href={buildJobsHref({ ...filters, page: page + 1 })}
              scroll={false}
              className={`${pageButtonClass} hover:bg-surface-secondary`}
            >
              Next
            </Link>
          ) : (
            <span className={`${pageButtonClass} text-text-muted`}>Next</span>
          )}
        </div>
      )}
    </div>
  );
}

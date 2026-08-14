"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { buildJobsHref } from "@/lib/job-filters";
import type { MatchFilter, SortOption } from "@/types";

const selectClass =
  "appearance-none rounded-md border border-border bg-surface py-2 pl-3 pr-8 text-sm font-medium text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

/** Long enough to swallow a burst of typing, short enough not to feel laggy. */
const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  match: MatchFilter;
  sort: SortOption;
  q: string;
};

export function JobsFilterBar({ match, sort, q }: Props) {
  const router = useRouter();
  const [term, setTerm] = useState(q);

  // The last term we actually put in the URL. Guards both directions: it stops
  // the debounce from firing on mount or on the server's echo of its own value,
  // and lets an externally-changed `q` (back button, cleared filters) be told
  // apart from a stale render arriving mid-typing.
  const committedTerm = useRef(q);

  useEffect(() => {
    if (q === committedTerm.current) return;

    committedTerm.current = q;
    setTerm(q);
  }, [q]);

  useEffect(() => {
    if (term === committedTerm.current) return;

    const timer = setTimeout(() => {
      committedTerm.current = term;
      router.replace(buildJobsHref({ match, sort, q: term, page: 1 }), { scroll: false });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [term, match, sort, router]);

  // Any narrowing returns to page 1 — page 3 of a one-page result is an empty table.
  function applyFilters(next: Partial<{ match: MatchFilter; sort: SortOption }>): void {
    committedTerm.current = term;
    router.push(buildJobsHref({ match, sort, q: term, page: 1, ...next }), { scroll: false });
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Filter by company or role..."
          className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            className={selectClass}
            value={match}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all" || value === "high" || value === "low") {
                applyFilters({ match: value });
              }
            }}
          >
            <option value="all">All Matches</option>
            <option value="high">High Match</option>
            <option value="low">Low Match</option>
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
        </div>

        <div className="relative">
          <select
            className={selectClass}
            value={sort}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "score" || value === "newest" || value === "oldest") {
                applyFilters({ sort: value });
              }
            }}
          >
            <option value="score">Match Score</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
        </div>
      </div>
    </div>
  );
}

import type { JobFilters, MatchFilter, SortOption } from "@/types";

export const PAGE_SIZE = 20;

/** Long enough for any real company or role name; short enough to bound the filter string. */
const MAX_SEARCH_LENGTH = 100;

export const DEFAULT_JOB_FILTERS: JobFilters = {
  match: "all",
  sort: "score",
  q: "",
  page: 1,
};

function isMatchFilter(value: string): value is MatchFilter {
  return value === "all" || value === "high" || value === "low";
}

function isSortOption(value: string): value is SortOption {
  return value === "score" || value === "newest" || value === "oldest";
}

/** Next gives an array when a key repeats (`?page=1&page=2`); take the first. */
function firstValue(raw: string | string[] | undefined): string {
  if (Array.isArray(raw)) return raw[0] ?? "";
  return raw ?? "";
}

/**
 * Never throws and never returns an invalid view — anything unrecognised falls
 * back to its default. A hand-edited or stale URL degrades to the standard list
 * rather than erroring.
 */
export function parseJobFilters(
  raw: Record<string, string | string[] | undefined>,
): JobFilters {
  const match = firstValue(raw.match);
  const sort = firstValue(raw.sort);
  const page = Number.parseInt(firstValue(raw.page), 10);

  return {
    match: isMatchFilter(match) ? match : DEFAULT_JOB_FILTERS.match,
    sort: isSortOption(sort) ? sort : DEFAULT_JOB_FILTERS.sort,
    q: firstValue(raw.q).slice(0, MAX_SEARCH_LENGTH),
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_JOB_FILTERS.page,
  };
}

/** Defaults are omitted so the canonical unfiltered view stays a clean `/find-jobs`. */
export function buildJobsHref(filters: JobFilters): string {
  const params = new URLSearchParams();

  if (filters.match !== DEFAULT_JOB_FILTERS.match) params.set("match", filters.match);
  if (filters.sort !== DEFAULT_JOB_FILTERS.sort) params.set("sort", filters.sort);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.page > 1) params.set("page", String(filters.page));

  const query = params.toString();
  return query ? `/find-jobs?${query}` : "/find-jobs";
}

/**
 * `.or()` takes a raw PostgREST filter expression that the SDK does not escape,
 * so the search term is interpolated straight into query syntax. The value is
 * wrapped in double quotes at the call site, which makes PostgREST's reserved
 * `, . ( ) :` literal — quoting rather than stripping so `Node.js` still
 * matches. What is left to handle here: LIKE wildcards, which would otherwise
 * let a typed `%` widen the match, and the two characters that would break out
 * of the quotes.
 */
export function sanitizeSearchTerm(q: string): string {
  return q
    .trim()
    .slice(0, MAX_SEARCH_LENGTH)
    .replace(/[%_]/g, "")
    .replace(/[\\"]/g, "\\$&");
}

/**
 * Whether the view is narrowed, which decides which empty state the table shows.
 * Sort is deliberately excluded — reordering rows can never produce an empty
 * result, so it should not make an empty table blame a filter.
 */
export function isFiltered(filters: JobFilters): boolean {
  return filters.match !== DEFAULT_JOB_FILTERS.match || filters.q.trim() !== "" || filters.page > 1;
}

export function totalPages(totalCount: number): number {
  return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
}

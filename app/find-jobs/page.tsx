import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { JobsFilterBar } from "@/components/find-jobs/JobsFilterBar";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { Pagination } from "@/components/find-jobs/Pagination";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  PAGE_SIZE,
  buildJobsHref,
  isFiltered,
  parseJobFilters,
  sanitizeSearchTerm,
  totalPages,
} from "@/lib/job-filters";
import { MATCH_THRESHOLD } from "@/lib/utils";
import type { JobRow } from "@/types";
import type { ReactElement } from "react";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FindJobsPage({ searchParams }: Props): Promise<ReactElement> {
  const filters = parseJobFilters(await searchParams);

  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();

  if (!data.user) {
    redirect("/login");
  }

  let query = insforge.database
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("user_id", data.user.id);

  // NULL match_score satisfies neither comparison, so unscored jobs fall out of
  // both tabs by SQL semantics — they stay reachable under All Matches.
  if (filters.match === "high") {
    query = query.gte("match_score", MATCH_THRESHOLD);
  } else if (filters.match === "low") {
    query = query.lt("match_score", MATCH_THRESHOLD);
  }

  const term = sanitizeSearchTerm(filters.q);
  if (term) {
    query = query.or(`company.ilike."%${term}%",title.ilike."%${term}%"`);
  }

  if (filters.sort === "score") {
    query = query
      .order("match_score", { ascending: false, nullsFirst: false })
      .order("found_at", { ascending: false });
  } else {
    query = query.order("found_at", { ascending: filters.sort === "oldest" });
  }

  const from = (filters.page - 1) * PAGE_SIZE;
  const { data: jobs, error, count } = await query.range(from, from + PAGE_SIZE - 1);

  if (error) {
    console.error("[find-jobs/page]", error);
  }

  const rows = (jobs as JobRow[] | null) ?? [];
  const totalCount = count ?? rows.length;

  // A bookmarked page can outlive the rows that filled it.
  if (rows.length === 0 && totalCount > 0 && filters.page > 1) {
    redirect(buildJobsHref({ ...filters, page: totalPages(totalCount) }));
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="mx-auto flex max-w-[1268px] flex-col gap-6 px-6 py-8">
        <SearchControls />

        <section className="rounded-2xl border border-border bg-surface shadow-sm">
          <JobsFilterBar match={filters.match} sort={filters.sort} q={filters.q} />
          <div className="overflow-x-auto">
            <JobsTable jobs={rows} isFiltered={isFiltered(filters)} />
          </div>
          <Pagination filters={filters} totalCount={totalCount} />
        </section>
      </main>
    </div>
  );
}

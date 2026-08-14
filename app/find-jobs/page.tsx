import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { JobsFilterBar } from "@/components/find-jobs/JobsFilterBar";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { Pagination } from "@/components/find-jobs/Pagination";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { JobRow } from "@/types";
import type { ReactElement } from "react";

export default async function FindJobsPage(): Promise<ReactElement> {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: jobs, error } = await insforge.database
    .from("jobs")
    .select("*")
    .eq("user_id", data.user.id)
    .order("found_at", { ascending: false });

  if (error) {
    console.error("[find-jobs/page]", error);
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="mx-auto flex max-w-[1268px] flex-col gap-6 px-6 py-8">
        <SearchControls />

        <section className="rounded-2xl border border-border bg-surface shadow-sm">
          <JobsFilterBar />
          <div className="overflow-x-auto">
            <JobsTable jobs={(jobs as JobRow[] | null) ?? []} />
          </div>
          <Pagination />
        </section>
      </main>
    </div>
  );
}

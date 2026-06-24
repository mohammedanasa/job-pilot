import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { ReactElement } from "react";

export default async function DashboardPage(): Promise<ReactElement> {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();

  if (!data.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1268px] px-6 py-8">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-xs font-normal uppercase leading-4 text-text-muted">Dashboard</p>
          <h1 className="mt-2 text-base font-semibold leading-6 text-text-primary">
            Welcome to JobPilot
          </h1>
          <p className="mt-2 text-sm font-medium leading-6 text-text-secondary">
            No job activity yet. Complete your profile, then start a search to see your progress here.
          </p>
        </section>
      </main>
    </div>
  );
}

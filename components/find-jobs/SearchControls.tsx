import { Search, Sparkles } from "lucide-react";

export function SearchControls() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Job Title
          </label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Frontend Engineer"
              className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Location
          </label>
          <input
            type="text"
            placeholder="Remote, New York..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <button
          type="button"
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium leading-5 text-accent-foreground"
        >
          <Search size={16} />
          Find Jobs
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-success-lightest px-4 py-3">
        <Sparkles size={16} className="text-success" />
        <p className="text-sm font-medium leading-5 text-success-foreground">
          Found 8 jobs and saved 4 strong matches.
        </p>
      </div>
    </section>
  );
}

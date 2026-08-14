"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Sparkles, TriangleAlert } from "lucide-react";

type SearchResult = { found: number; saved: number; strongMatches: number };

export function SearchControls() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(): Promise<void> {
    if (!jobTitle.trim() || isSearching) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, location }),
      });

      const body: { success: boolean; data?: SearchResult; error?: string } =
        await response.json();

      if (!body.success || !body.data) {
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(body.data);

      // Fresh results should be visible. Staying on, say, High Match page 3
      // would report "Found 10 jobs" over a table that did not change.
      if (window.location.search) {
        router.replace("/find-jobs", { scroll: false });
      }
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

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
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
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
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Remote, New York..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSearching || !jobTitle.trim()}
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium leading-5 text-accent-foreground disabled:opacity-50"
        >
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {isSearching ? "Searching..." : "Find Jobs"}
        </button>
      </div>

      {result && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-success-lightest px-4 py-3">
          <Sparkles size={16} className="text-success" />
          <p className="text-sm font-medium leading-5 text-success-foreground">
            Found {result.found} job{result.found === 1 ? "" : "s"} — {result.strongMatches} strong match
            {result.strongMatches === 1 ? "" : "es"}.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-error px-4 py-3">
          <TriangleAlert size={16} className="text-error-foreground" />
          <p className="text-sm font-medium leading-5 text-error-foreground">{error}</p>
        </div>
      )}
    </section>
  );
}

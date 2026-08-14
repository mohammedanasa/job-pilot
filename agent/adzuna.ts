import { createInsforgeServer } from "@/lib/insforge-server";
import { detectCountry, searchJobs } from "@/lib/adzuna";
import { scoreJobs } from "@/agent/matcher";
import { MATCH_THRESHOLD } from "@/lib/utils";
import type { DiscoverJobsResult } from "@/agent/types";
import type { ProfileData } from "@/types";

async function logAgentError(
  runId: string,
  userId: string,
  message: string,
): Promise<void> {
  const insforge = await createInsforgeServer();
  const { error } = await insforge.database.from("agent_logs").insert([
    { run_id: runId, user_id: userId, message, level: "error" },
  ]);

  if (error) {
    console.error("[agent/adzuna] failed to write agent_logs:", error);
  }
}

export async function discoverJobs(
  jobTitle: string,
  location: string,
  profile: ProfileData,
  userId: string,
): Promise<DiscoverJobsResult> {
  const insforge = await createInsforgeServer();

  const { data: run, error: runError } = await insforge.database
    .from("agent_runs")
    .insert([
      {
        user_id: userId,
        status: "running",
        job_title_searched: jobTitle,
        location_searched: location,
      },
    ])
    .select()
    .single();

  if (runError || !run) {
    console.error("[agent/adzuna] failed to create agent_runs row:", runError);
    return { success: false, error: "Could not start the search. Please try again." };
  }

  const runId = run.id as string;

  try {
    const country = detectCountry(location);
    const adzunaJobs = await searchJobs(jobTitle, location, country);

    if (adzunaJobs.length === 0) {
      await insforge.database
        .from("agent_runs")
        .update({ status: "completed", jobs_found: 0, completed_at: new Date().toISOString() })
        .eq("id", runId);

      return { success: true, found: 0, saved: 0, strongMatches: 0 };
    }

    // Skip jobs already saved for this user — checked before scoring so a
    // repeat search doesn't spend AI quota re-scoring rows it will discard.
    const { data: existing } = await insforge.database
      .from("jobs")
      .select("source_url")
      .eq("user_id", userId);

    const existingUrls = new Set((existing ?? []).map((row) => row.source_url as string));
    const newJobs = adzunaJobs.filter((job) => !existingUrls.has(job.redirect_url));

    if (newJobs.length === 0) {
      await insforge.database
        .from("agent_runs")
        .update({
          status: "completed",
          jobs_found: adzunaJobs.length,
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);

      return { success: true, found: adzunaJobs.length, saved: 0, strongMatches: 0 };
    }

    const scoring = await scoreJobs(newJobs, profile);

    if (!scoring.ok) {
      await logAgentError(runId, userId, `Scoring failed: ${scoring.message}`);
      await insforge.database
        .from("agent_runs")
        .update({ status: "failed", completed_at: new Date().toISOString() })
        .eq("id", runId);

      return { success: false, error: scoring.message };
    }

    const rows = newJobs.map((job, index) => {
      const score = scoring.scores.get(index);

      return {
        run_id: runId,
        user_id: userId,
        source: "search" as const,
        source_url: job.redirect_url,
        external_apply_url: job.redirect_url,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary: job.salary_min
          ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round((job.salary_max ?? job.salary_min) / 1000)}k`
          : null,
        job_type: job.contract_type || "fulltime",
        about_role: job.description,
        match_score: score?.matchScore ?? null,
        match_reason: score?.matchReason ?? null,
        matched_skills: score?.matchedSkills ?? [],
        missing_skills: score?.missingSkills ?? [],
        found_at: new Date().toISOString(),
      };
    });

    const { error: insertError } = await insforge.database.from("jobs").insert(rows);

    if (insertError) {
      await logAgentError(runId, userId, `Insert failed: ${String(insertError)}`);
      await insforge.database
        .from("agent_runs")
        .update({ status: "failed", completed_at: new Date().toISOString() })
        .eq("id", runId);

      return { success: false, error: "Could not save the jobs found. Please try again." };
    }

    await insforge.database
      .from("agent_runs")
      .update({
        status: "completed",
        jobs_found: rows.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    const strongMatches = rows.filter(
      (row) => row.match_score !== null && row.match_score >= MATCH_THRESHOLD,
    ).length;

    return {
      success: true,
      found: adzunaJobs.length,
      saved: rows.length,
      strongMatches,
    };
  } catch (error) {
    console.error("[agent/adzuna]", error);
    await logAgentError(runId, userId, String(error));
    await insforge.database
      .from("agent_runs")
      .update({ status: "failed", completed_at: new Date().toISOString() })
      .eq("id", runId);

    return { success: false, error: "Something went wrong while searching for jobs." };
  }
}

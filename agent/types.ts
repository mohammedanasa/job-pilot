export type ScoredJob = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

export type DiscoverJobsResult =
  | { success: true; found: number; saved: number; strongMatches: number }
  | { success: false; error: string };

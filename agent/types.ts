export type ScoredJob = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

export type DiscoverJobsResult =
  | { success: true; found: number; saved: number; strongMatches: number }
  | { success: false; error: string };

/**
 * `grounded` is false when no company page contributed text — a "profile +
 * posting only" dossier reads just as confidently as a fully-grounded one,
 * so the UI needs this to render a notice rather than let the two look
 * identical.
 */
export type CompanyDossier = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
  grounded: boolean;
};

export type ResearchCompanyResult =
  | { success: true; dossier: CompanyDossier }
  | { success: false; error: string };

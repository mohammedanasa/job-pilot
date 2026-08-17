export type WorkExperience = {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  keyResponsibilities: string;
};

export type ProfileFormData = {
  fullName: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  industries: string[];
  workExperiences: WorkExperience[];
  highestDegree: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
  jobTitlesSeeking: string;
  remotePreference: string;
  salaryExpectation: string;
  preferredLocations: string;
  coverLetterTone: string;
  resumePdfUrl?: string;
};

export type ProfileData = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[] | null;
  industries: string[] | null;
  work_experience: WorkExperience[] | null;
  education: {
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: string;
  } | null;
  job_titles_seeking: string[] | null;
  remote_preference: string | null;
  preferred_locations: string[] | null;
  salary_expectation: string | null;
  cover_letter_tone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  resume_pdf_url: string | null;
  resume_pdf_key: string | null;
  generated_pdf_url: string | null;
  generated_pdf_key: string | null;
  is_complete: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * What a resume can actually tell us.
 *
 * Deliberately narrower than ProfileFormData: job preferences (salary
 * expectation, remote preference, cover letter tone, titles sought) are
 * intentions, not history, so they never appear on a resume and are never
 * touched by extraction.
 *
 * Every field is optional — a resume with no education section should leave
 * the education fields alone rather than blanking them.
 */
export type ExtractedProfile = {
  fullName?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  currentTitle?: string;
  experienceLevel?: string | null;
  yearsExperience?: number | null;
  skills?: string[];
  industries?: string[];
  workExperiences?: Array<{
    companyName?: string;
    jobTitle?: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
    keyResponsibilities?: string;
  }>;
  highestDegree?: string | null;
  fieldOfStudy?: string;
  institutionName?: string;
  graduationYear?: string;
};

/**
 * The only part of a generated resume a model is allowed to write.
 *
 * Everything else on the page — names, dates, employers, skills, education,
 * contact details — is copied verbatim from the profile. A model that rephrases
 * a job title or nudges a date produces a resume that quietly contradicts the
 * user's own record of their career.
 *
 * Roles are matched back to work_experience by `index` rather than by company
 * name: two stints at the same employer are common, and a model echoing a name
 * back with different punctuation would silently fail to match.
 */
export type GeneratedResumeProse = {
  summary: string;
  roles: Array<{
    index: number;
    bullets: string[];
  }>;
};

export type MatchFilter = "all" | "high" | "low";

export type SortOption = "score" | "newest" | "oldest";

/**
 * The Find Jobs list view, fully described by the URL.
 *
 * Every field has a default, so `/find-jobs` with no query string is a valid
 * view rather than a special case. `page` is 1-indexed here because that is
 * what the URL and the pagination UI show; the conversion to PostgREST's
 * 0-indexed inclusive `.range()` happens once, in the page query.
 */
export type JobFilters = {
  match: MatchFilter;
  sort: SortOption;
  q: string;
  page: number;
};

import type { CompanyDossier } from "@/agent/types";

export type JobRow = {
  id: string;
  run_id: string | null;
  user_id: string;
  source: "search" | "url";
  source_url: string | null;
  external_apply_url: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  about_role: string | null;
  responsibilities: string[] | null;
  requirements: string[] | null;
  nice_to_have: string[] | null;
  benefits: string[] | null;
  about_company: string | null;
  match_score: number | null;
  match_reason: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  company_research: CompanyDossier | null;
  company_researched_at: string | null;
  found_at: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  trend: string;
  subtitle: string;
};

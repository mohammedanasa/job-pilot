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

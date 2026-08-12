"use client";

import { useState } from "react";
import { TagInput } from "@/components/profile/TagInput";
import { WorkExperienceCard, type WorkExperience } from "@/components/profile/WorkExperienceCard";
import { ResumeSection } from "@/components/profile/ResumeSection";
import { saveProfile } from "@/actions/profile";
import { SKILL_SUGGESTIONS } from "@/lib/skills";
import type { ProfileData } from "@/types";

const INDUSTRY_SUGGESTIONS = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "SaaS",
  "E-commerce",
  "Gaming",
  "Cybersecurity",
  "AI / ML",
  "DevTools",
  "Media",
  "Logistics",
  "PropTech",
  "GovTech",
  "Climate Tech",
  "InsurTech",
];

function makeEmptyExperience(): WorkExperience {
  return {
    id: crypto.randomUUID(),
    companyName: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    keyResponsibilities: "",
  };
}

type Props = {
  initialData?: ProfileData | null;
  userEmail: string;
};

export function ProfileForm({ initialData, userEmail }: Props) {
  const edu = initialData?.education;
  const workExp = initialData?.work_experience;

  // Personal Info
  const [fullName, setFullName] = useState(initialData?.full_name ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialData?.linkedin_url ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialData?.portfolio_url ?? "");
  const [workAuthorization, setWorkAuthorization] = useState(
    initialData?.work_authorization ?? "Citizen",
  );

  // Professional Info
  const [currentTitle, setCurrentTitle] = useState(initialData?.current_title ?? "");
  const [experienceLevel, setExperienceLevel] = useState(
    initialData?.experience_level ?? "Junior",
  );
  const [yearsExperience, setYearsExperience] = useState(
    initialData?.years_experience?.toString() ?? "",
  );
  const [skills, setSkills] = useState<string[]>(initialData?.skills ?? []);
  const [industries, setIndustries] = useState<string[]>(initialData?.industries ?? []);

  // Work Experience
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>(
    workExp && workExp.length > 0 ? workExp : [makeEmptyExperience()],
  );

  // Education
  const [highestDegree, setHighestDegree] = useState(edu?.degree ?? "");
  const [fieldOfStudy, setFieldOfStudy] = useState(edu?.fieldOfStudy ?? "");
  const [institutionName, setInstitutionName] = useState(edu?.institution ?? "");
  const [graduationYear, setGraduationYear] = useState(edu?.graduationYear ?? "");

  // Job Preferences
  const [jobTitlesSeeking, setJobTitlesSeeking] = useState(
    initialData?.job_titles_seeking?.join(", ") ?? "",
  );
  const [remotePreference, setRemotePreference] = useState(
    initialData?.remote_preference ?? "Any",
  );
  const [salaryExpectation, setSalaryExpectation] = useState(
    initialData?.salary_expectation ?? "",
  );
  const [preferredLocations, setPreferredLocations] = useState(
    initialData?.preferred_locations?.join(", ") ?? "",
  );
  const [coverLetterTone, setCoverLetterTone] = useState(
    initialData?.cover_letter_tone ?? "formal",
  );

  // Resume URL — set immediately after upload in ResumeSection
  const [resumePdfUrl, setResumePdfUrl] = useState<string | null>(
    initialData?.resume_pdf_url ?? null,
  );

  // Submit state
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; error?: string } | null>(null);

  function addWorkExperience() {
    if (workExperiences.length < 3) {
      setWorkExperiences([...workExperiences, makeEmptyExperience()]);
    }
  }

  function updateWorkExperience(index: number, updated: WorkExperience) {
    setWorkExperiences(workExperiences.map((e, i) => (i === index ? updated : e)));
  }

  function removeWorkExperience(index: number) {
    if (workExperiences.length > 1) {
      setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaveResult(null);

    try {
      const result = await saveProfile({
        fullName,
        phone,
        location,
        linkedinUrl,
        portfolioUrl,
        workAuthorization,
        currentTitle,
        experienceLevel,
        yearsExperience,
        skills,
        industries,
        workExperiences,
        highestDegree,
        fieldOfStudy,
        institutionName,
        graduationYear,
        jobTitlesSeeking,
        remotePreference,
        salaryExpectation,
        preferredLocations,
        coverLetterTone,
        resumePdfUrl: resumePdfUrl ?? undefined,
      });

      setSaveResult(result);
    } catch {
      setSaveResult({ success: false, error: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent w-full";
  const selectClass =
    "rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent w-full";
  const labelClass = "text-xs font-medium uppercase tracking-wide text-text-secondary";
  const fieldClass = "flex flex-col gap-1";

  return (
    <div className="flex flex-col gap-6">
      <ResumeSection
        onUploadComplete={setResumePdfUrl}
        existingUrl={initialData?.resume_pdf_url}
      />

    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Profile Information card */}
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div>
          <h2 className="text-base font-semibold leading-6 text-text-primary">
            Profile Information
          </h2>
          <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
            This context is used to accurately represent you in agent interactions.
          </p>
        </div>

        {/* Personal Info */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold leading-5 text-text-primary">Personal Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldClass}>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={userEmail}
                readOnly
                className="rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm font-medium text-text-muted w-full cursor-not-allowed"
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={inputClass}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className={inputClass}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>LinkedIn URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className={inputClass}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Portfolio / GitHub</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/yourname"
                className={inputClass}
              />
            </div>
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Work Authorization</label>
            <select
              value={workAuthorization}
              onChange={(e) => setWorkAuthorization(e.target.value)}
              className={selectClass}
            >
              <option value="Citizen">Citizen</option>
              <option value="Permanent Resident">Permanent Resident</option>
              <option value="Visa Required">Visa Required</option>
            </select>
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Professional Info */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold leading-5 text-text-primary">Professional Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`${fieldClass} col-span-2`}>
              <label className={labelClass}>Current / Recent Job Title</label>
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="Frontend Engineer"
                className={inputClass}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className={selectClass}
              >
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="4"
                className={inputClass}
              />
            </div>
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Skills</label>
            <TagInput
              tags={skills}
              onChange={setSkills}
              suggestions={SKILL_SUGGESTIONS}
              placeholder="Add a skill..."
            />
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Industries (Optional)</label>
            <TagInput
              tags={industries}
              onChange={setIndustries}
              suggestions={INDUSTRY_SUGGESTIONS}
              placeholder="e.g. FinTech, Healthcare"
            />
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Work Experience */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold leading-5 text-text-primary">Work Experience</h3>
            {workExperiences.length < 3 && (
              <button
                type="button"
                onClick={addWorkExperience}
                className="text-sm font-medium text-accent hover:opacity-80"
              >
                + Add role
              </button>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {workExperiences.map((entry, index) => (
              <WorkExperienceCard
                key={entry.id}
                entry={entry}
                index={index}
                canRemove={workExperiences.length > 1}
                onChange={(updated) => updateWorkExperience(index, updated)}
                onRemove={() => removeWorkExperience(index)}
              />
            ))}
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Education */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold leading-5 text-text-primary">Education</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={fieldClass}>
              <label className={labelClass}>Highest Degree</label>
              <select
                value={highestDegree}
                onChange={(e) => setHighestDegree(e.target.value)}
                className={selectClass}
              >
                <option value="">Select degree</option>
                <option value="High School">High School</option>
                <option value="Associate">Associate</option>
                <option value="Bachelor&apos;s">Bachelor&apos;s</option>
                <option value="Master&apos;s">Master&apos;s</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Field of Study</label>
              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="Computer Science"
                className={inputClass}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Institution Name</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="E.g. State University"
                className={inputClass}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Graduation Year</label>
              <input
                type="text"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="YYYY"
                maxLength={4}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Job Preferences */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold leading-5 text-text-primary">Job Preferences</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`${fieldClass} col-span-2`}>
              <label className={labelClass}>Job Titles Seeking</label>
              <input
                type="text"
                value={jobTitlesSeeking}
                onChange={(e) => setJobTitlesSeeking(e.target.value)}
                placeholder="Frontend Engineer, React Developer"
                className={inputClass}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Remote Preference</label>
              <select
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value)}
                className={selectClass}
              >
                <option value="Any">Any</option>
                <option value="Remote">Remote</option>
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Salary Expectation (Optional)</label>
              <input
                type="text"
                value={salaryExpectation}
                onChange={(e) => setSalaryExpectation(e.target.value)}
                placeholder="E.g. $120k+"
                className={inputClass}
              />
            </div>
            <div className={`${fieldClass} col-span-2`}>
              <label className={labelClass}>Preferred Locations (Optional)</label>
              <input
                type="text"
                value={preferredLocations}
                onChange={(e) => setPreferredLocations(e.target.value)}
                placeholder="E.g. New York, London"
                className={inputClass}
              />
            </div>
            <div className={fieldClass}>
              <label className={labelClass}>Cover Letter Tone</label>
              <select
                value={coverLetterTone}
                onChange={(e) => setCoverLetterTone(e.target.value)}
                className={selectClass}
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      {/* Save feedback */}
      {saveResult && (
        <div
          className={[
            "rounded-md border px-4 py-3 text-sm font-medium",
            saveResult.success
              ? "border-success bg-success-lightest text-success-foreground"
              : "border-error bg-surface text-error",
          ].join(" ")}
        >
          {saveResult.success ? "Profile saved successfully." : (saveResult.error ?? "Failed to save profile.")}
        </div>
      )}

      {/* Save Profile */}
      <div className="pb-4">
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </form>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import type { ExtractedProfile } from "@/types";

type UploadState = "idle" | "uploading" | "success" | "error";

type Props = {
  onUploadComplete: (url: string | null) => void;
  onExtracted: (data: ExtractedProfile) => void;
  existingUrl?: string | null;
  existingGeneratedUrl?: string | null;
  /** True when the form holds resume-relevant edits that are not yet saved.
   *  Generation reads the database, so it would miss them. */
  isDirty: boolean;
};

export function ResumeSection({
  onUploadComplete,
  onExtracted,
  existingUrl,
  existingGeneratedUrl,
  isDirty,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(existingUrl ? "resume.pdf" : null);
  // We never link directly to the storage URL (private bucket — requires auth).
  // Always proxy through /api/resume/download which runs server-side with auth.
  const [resumeUrl, setResumeUrl] = useState<string | null>(existingUrl ? "/api/resume/download" : null);
  const [uploadState, setUploadState] = useState<UploadState>(existingUrl ? "success" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  // Same reasoning as the uploaded resume: the bucket is private, so the link
  // points at the download proxy rather than the storage URL.
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(
    existingGeneratedUrl ? "/api/resume/download?type=generated" : null,
  );

  async function handleGenerate() {
    setGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch("/api/resume/generate", { method: "POST" });
      const json = (await res.json()) as { success: boolean; url?: string; error?: string };

      if (!json.success) {
        setGenerateError(json.error ?? "Could not generate a resume. Please try again.");
        return;
      }

      setGeneratedUrl("/api/resume/download?type=generated");
    } catch {
      setGenerateError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleExtract() {
    setExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch("/api/resume/extract", { method: "POST" });
      const json = (await res.json()) as {
        success: boolean;
        data?: ExtractedProfile;
        error?: string;
      };

      if (!json.success || !json.data) {
        setExtractError(json.error ?? "Extraction failed. Please try again.");
        return;
      }

      onExtracted(json.data);
    } catch {
      setExtractError("Something went wrong. Please try again.");
    } finally {
      setExtracting(false);
    }
  }

  async function uploadFile(file: File) {
    setFileName(file.name);
    setUploadState("uploading");
    setErrorMessage(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/resume/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { success: boolean; url?: string; error?: string };

      if (!json.success || !json.url) {
        setUploadState("error");
        setErrorMessage(json.error ?? "Upload failed. Please try again.");
        onUploadComplete(null);
        return;
      }

      setResumeUrl("/api/resume/download");
      setUploadState("success");
      onUploadComplete(json.url);
    } catch {
      setUploadState("error");
      setErrorMessage("Something went wrong. Please try again.");
      onUploadComplete(null);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleRemove() {
    setFileName(null);
    setResumeUrl(null);
    setUploadState("idle");
    setErrorMessage(null);
    onUploadComplete(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div>
        <h2 className="text-base font-semibold leading-6 text-text-primary">Resume</h2>
        <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
          Upload an existing resume to auto-fill the profile, or generate a new tailored one from
          your details below.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
          isDragging ? "border-accent bg-accent-muted" : "border-border bg-surface-secondary",
        ].join(" ")}
      >
        {/* Upload / spinner icon */}
        {uploadState === "uploading" ? (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="animate-spin">
            <circle cx="16" cy="16" r="13" stroke="var(--color-border)" strokeWidth="2.5" />
            <path
              d="M16 3C16 3 29 3 29 16"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 12V5M9 5L6 8M9 5L12 8"
                stroke="var(--color-text-muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 14C3 14.5523 3.44772 15 4 15H14C14.5523 15 15 14.5523 15 14"
                stroke="var(--color-text-muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Label */}
        {uploadState === "uploading" ? (
          <p className="text-sm font-medium leading-5 text-text-secondary">Uploading…</p>
        ) : uploadState === "success" && resumeUrl ? (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold leading-5 text-text-primary hover:underline"
          >
            View current resume
          </a>
        ) : (
          <>
            <p className="text-sm font-medium leading-5 text-text-primary">
              Click to upload or drag and drop
            </p>
            <p className="text-xs font-normal leading-4 text-text-muted">
              PDF formatting only. Maximum file size 5MB.
            </p>
          </>
        )}

        {/* File name pill with ✕ remove */}
        {uploadState === "success" && fileName && (
          <div className="mt-1 flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5">
            <span className="text-sm font-medium text-text-primary">{fileName}</span>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove resume"
              className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-text-muted hover:text-error"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {uploadState !== "uploading" && uploadState !== "success" && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium leading-5 text-text-primary hover:bg-surface-secondary"
          >
            Select Resume
          </button>
        )}

        {uploadState === "success" && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-1 text-xs font-medium text-text-muted hover:text-text-secondary"
          >
            Replace
          </button>
        )}
      </div>

      {/* Extract from Resume — only once a resume is actually stored */}
      {uploadState === "success" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium leading-5 text-text-secondary">
              Let AI read your resume and fill in the fields below.
            </p>
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting}
              className="flex shrink-0 items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium leading-5 text-text-primary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {extracting && (
                <svg width="14" height="14" viewBox="0 0 32 32" fill="none" className="animate-spin">
                  <circle cx="16" cy="16" r="13" stroke="var(--color-border)" strokeWidth="3" />
                  <path
                    d="M16 3C16 3 29 3 29 16"
                    stroke="var(--color-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {extracting ? "Reading resume…" : "Extract from Resume"}
            </button>
          </div>

          {extractError && <span className="text-sm font-medium text-error">{extractError}</span>}
        </div>
      )}

      {/* Error row */}
      {uploadState === "error" && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-error">{errorMessage}</span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm font-medium text-text-secondary hover:text-error"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium leading-5 text-text-secondary">
            {isDirty
              ? "Save your profile first — the resume is built from your saved details."
              : "Need a fresh document based on the info fields below?"}
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || isDirty}
            title={isDirty ? "Save your profile to generate an up-to-date resume" : undefined}
            className="flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium leading-5 text-accent-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating && (
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" className="animate-spin">
                <circle cx="16" cy="16" r="13" stroke="var(--color-accent-light)" strokeWidth="3" />
                <path
                  d="M16 3C16 3 29 3 29 16"
                  stroke="var(--color-accent-foreground)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {generating ? "Generating…" : "Generate Resume from Profile"}
          </button>
        </div>

        {generateError && <span className="text-sm font-medium text-error">{generateError}</span>}

        {generatedUrl && !generating && (
          <a
            href={generatedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold leading-5 text-accent hover:underline"
          >
            View generated resume
          </a>
        )}
      </div>
    </div>
  );
}

-- Feature 16 needs a real timestamp for "Researched {company}" activity entries.
-- found_at is set once at job-discovery time and never updated by Feature 13's
-- research route, so it cannot represent when research actually happened —
-- research is a separate, later action. Null until a dossier is saved.
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_researched_at timestamptz;

-- The resumes bucket is private, so downloads cannot use a URL — they need the
-- storage object key passed to storage.download(). Both values are persisted:
-- resume_pdf_url for display/Feature 08, resume_pdf_key for actual retrieval.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_pdf_key text;

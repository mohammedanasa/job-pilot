-- Feature 08 generates a resume from profile data. It must not overwrite the
-- resume the user uploaded: resume_pdf_key is what Feature 07's extraction reads
-- back from storage, so pointing it at our own AI-written prose would make
-- re-extraction feed the model its own output.
--
-- The two documents therefore live in separate storage slots and separate
-- columns: {user_id}/resume.pdf (uploaded) and {user_id}/generated-resume.pdf
-- (generated). As with resume_pdf_*, the url is for display and the key is what
-- storage.download() actually needs, because the bucket is private.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS generated_pdf_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS generated_pdf_key text;

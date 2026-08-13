-- ─────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           text,
  email               text,
  phone               text,
  location            text,
  current_title       text,
  experience_level    text,
  years_experience    integer,
  skills              text[]        DEFAULT '{}',
  industries          text[]        DEFAULT '{}',
  work_experience     jsonb,
  education           jsonb,
  job_titles_seeking  text[]        DEFAULT '{}',
  remote_preference   text,
  preferred_locations text[]        DEFAULT '{}',
  salary_expectation  text,
  cover_letter_tone   text,
  linkedin_url        text,
  portfolio_url       text,
  work_authorization  text,
  resume_pdf_url      text,
  is_complete         boolean       NOT NULL DEFAULT false,
  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

-- Every downstream table's user_id references profiles(id), so a user without a
-- profiles row cannot own any data. Create the row at signup rather than relying
-- on the profile form being saved first.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────
-- agent_runs
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status              text         NOT NULL DEFAULT 'running',
  job_title_searched  text,
  location_searched   text,
  jobs_found          integer      DEFAULT 0,
  started_at          timestamptz  NOT NULL DEFAULT now(),
  completed_at        timestamptz,

  CONSTRAINT agent_runs_status_check CHECK (status IN ('running', 'completed', 'failed'))
);

-- ─────────────────────────────────────────
-- jobs
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jobs (
  id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id              uuid         REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  user_id             uuid         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source              text         NOT NULL,
  source_url          text,
  external_apply_url  text,
  title               text,
  company             text,
  location            text,
  salary              text,
  job_type            text,
  about_role          text,
  responsibilities    text[]       DEFAULT '{}',
  requirements        text[]       DEFAULT '{}',
  nice_to_have        text[]       DEFAULT '{}',
  benefits            text[]       DEFAULT '{}',
  about_company       text,
  match_score         integer,
  match_reason        text,
  matched_skills      text[]       DEFAULT '{}',
  missing_skills      text[]       DEFAULT '{}',
  company_research    jsonb,
  found_at            timestamptz  NOT NULL DEFAULT now(),

  CONSTRAINT jobs_source_check CHECK (source IN ('search', 'url'))
);

-- ─────────────────────────────────────────
-- agent_logs
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id      uuid         NOT NULL REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  user_id     uuid         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message     text         NOT NULL,
  level       text         NOT NULL DEFAULT 'info',
  job_id      uuid         REFERENCES public.jobs(id) ON DELETE SET NULL,
  created_at  timestamptz  NOT NULL DEFAULT now(),

  CONSTRAINT agent_logs_level_check CHECK (level IN ('info', 'success', 'warning', 'error'))
);

-- ─────────────────────────────────────────
-- Indexes — RLS policy columns and common query paths
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON public.agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id       ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_run_id        ON public.jobs(run_id);
CREATE INDEX IF NOT EXISTS idx_jobs_found_at      ON public.jobs(user_id, found_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_user_id ON public.agent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_run_id  ON public.agent_logs(run_id);

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs  ENABLE ROW LEVEL SECURITY;

-- profiles — id IS the auth user id
CREATE POLICY "profiles: own rows only" ON public.profiles
  FOR ALL TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "agent_runs: own rows only" ON public.agent_runs
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "jobs: own rows only" ON public.jobs
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_logs: own rows only" ON public.agent_logs
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────
-- Privileges — policies decide which rows, grants decide which operations
-- ─────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_logs TO authenticated;

-- No anon access — every table is user-scoped and all routes are behind auth.
REVOKE ALL ON public.profiles   FROM anon;
REVOKE ALL ON public.agent_runs FROM anon;
REVOKE ALL ON public.jobs       FROM anon;
REVOKE ALL ON public.agent_logs FROM anon;

-- ─────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
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

-- auto-update updated_at on every write to profiles
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────
-- agent_runs
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_runs (
  id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status              text         NOT NULL DEFAULT 'running',
  job_title_searched  text,
  location_searched   text,
  jobs_found          integer      DEFAULT 0,
  started_at          timestamptz  NOT NULL DEFAULT now(),
  completed_at        timestamptz
);

-- ─────────────────────────────────────────
-- jobs
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id              uuid         REFERENCES agent_runs(id) ON DELETE SET NULL,
  user_id             uuid         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS agent_logs (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id      uuid         NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  user_id     uuid         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message     text         NOT NULL,
  level       text         NOT NULL DEFAULT 'info',
  job_id      uuid         REFERENCES jobs(id) ON DELETE SET NULL,
  created_at  timestamptz  NOT NULL DEFAULT now(),

  CONSTRAINT agent_logs_level_check CHECK (level IN ('info', 'success', 'warning', 'error'))
);

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs  ENABLE ROW LEVEL SECURITY;

-- profiles — id IS the auth user id
CREATE POLICY "profiles: own rows only" ON profiles
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- agent_runs
CREATE POLICY "agent_runs: own rows only" ON agent_runs
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- jobs
CREATE POLICY "jobs: own rows only" ON jobs
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- agent_logs
CREATE POLICY "agent_logs: own rows only" ON agent_logs
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

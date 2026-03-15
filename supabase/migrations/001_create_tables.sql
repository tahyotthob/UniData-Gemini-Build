-- Migration: Create core tables for UniData platform
-- Tables: profiles, campaigns, responses

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'respondent' CHECK (role IN ('researcher', 'respondent', 'admin')),
  university TEXT,
  department TEXT,
  state TEXT,
  gender TEXT,
  age_range TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'respondent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Campaigns table (surveys created by researchers)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_states TEXT[] DEFAULT '{}',
  target_genders TEXT[] DEFAULT '{}',
  target_age_ranges TEXT[] DEFAULT '{}',
  reward INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Responses table (survey answers from respondents)
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  respondent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(survey_id, respondent_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_researcher ON campaigns(researcher_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_responses_survey ON responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_responses_respondent ON responses(respondent_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile, update only their own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Campaigns: anyone authenticated can read active campaigns, researchers manage their own
CREATE POLICY "Active campaigns are viewable by all authenticated"
  ON campaigns FOR SELECT
  TO authenticated
  USING (status = 'active' OR researcher_id = auth.uid());

CREATE POLICY "Researchers can insert campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (researcher_id = auth.uid());

CREATE POLICY "Researchers can update own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (researcher_id = auth.uid());

CREATE POLICY "Researchers can delete own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (researcher_id = auth.uid());

-- Responses: respondents can insert their own, researchers can read responses to their campaigns
CREATE POLICY "Respondents can insert responses"
  ON responses FOR INSERT
  TO authenticated
  WITH CHECK (respondent_id = auth.uid());

CREATE POLICY "Users can read relevant responses"
  ON responses FOR SELECT
  TO authenticated
  USING (
    respondent_id = auth.uid()
    OR survey_id IN (SELECT id FROM campaigns WHERE researcher_id = auth.uid())
  );

-- Admin policies (admins can read everything)
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can read all campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can read all responses"
  ON responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ============ preparer_profiles ============
CREATE TABLE public.preparer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  ptin TEXT,
  credentials TEXT[] NOT NULL DEFAULT '{}',
  qb_certifications TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  headshot_url TEXT,
  accepting_clients BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.preparer_profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.preparer_profiles TO authenticated;
GRANT ALL ON public.preparer_profiles TO service_role;

ALTER TABLE public.preparer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can view preparer profiles"
  ON public.preparer_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Preparers can insert their own profile"
  ON public.preparer_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'preparer')));

CREATE POLICY "Preparers can update their own profile"
  ON public.preparer_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete preparer profiles"
  ON public.preparer_profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_preparer_profiles_updated_at
  BEFORE UPDATE ON public.preparer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ engagement_letters ============
CREATE TABLE public.engagement_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preparer_id UUID REFERENCES public.preparer_profiles(id) ON DELETE SET NULL,
  tax_year INTEGER NOT NULL,
  version_hash TEXT NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  signature_name TEXT NOT NULL,
  ip_address TEXT,
  scope_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tax_year, version_hash)
);

GRANT SELECT, INSERT ON public.engagement_letters TO authenticated;
GRANT ALL ON public.engagement_letters TO service_role;

ALTER TABLE public.engagement_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own engagement letters"
  ON public.engagement_letters FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'preparer'));

CREATE POLICY "Users sign their own engagement letters"
  ON public.engagement_letters FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============ return_scenarios ============
CREATE TABLE public.return_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tax_year INTEGER NOT NULL,
  name TEXT NOT NULL,
  inputs_json JSONB NOT NULL DEFAULT '{}',
  computed_summary_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.return_scenarios TO authenticated;
GRANT ALL ON public.return_scenarios TO service_role;

ALTER TABLE public.return_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own scenarios"
  ON public.return_scenarios FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'preparer'));

CREATE POLICY "Users manage their own scenarios"
  ON public.return_scenarios FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_return_scenarios_updated_at
  BEFORE UPDATE ON public.return_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ return_snapshots ============
CREATE TABLE public.return_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tax_year INTEGER NOT NULL,
  summary_json JSONB NOT NULL,
  confidence NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX return_snapshots_user_year_created_idx
  ON public.return_snapshots (user_id, tax_year, created_at DESC);

GRANT SELECT ON public.return_snapshots TO authenticated;
GRANT ALL ON public.return_snapshots TO service_role;

ALTER TABLE public.return_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own snapshots"
  ON public.return_snapshots FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'preparer'));

-- Add 'preparer' to app_role enum if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'preparer' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'preparer';
  END IF;
END$$;

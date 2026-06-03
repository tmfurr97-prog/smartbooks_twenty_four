CREATE TYPE public.filing_status AS ENUM ('single', 'married', 'head_of_household');

CREATE TABLE public.tax_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  filing_status public.filing_status NOT NULL DEFAULT 'single',
  income NUMERIC(14,2) NOT NULL DEFAULT 0,
  expenses NUMERIC(14,2) NOT NULL DEFAULT 0,
  mileage NUMERIC(12,2) NOT NULL DEFAULT 0,
  home_office_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tax_profiles TO authenticated;
GRANT ALL ON public.tax_profiles TO service_role;

ALTER TABLE public.tax_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own taxx profile"
  ON public.tax_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and preparers can view all taxx profiles"
  ON public.tax_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'preparer'));

CREATE TRIGGER update_tax_profiles_updated_at
  BEFORE UPDATE ON public.tax_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
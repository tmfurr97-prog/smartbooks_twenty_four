
-- Drop overly-permissive policy
DROP POLICY IF EXISTS "Anyone signed in can view preparer profiles" ON public.preparer_profiles;

-- Restrict base-table SELECT to owner or admin (PTIN protected)
CREATE POLICY "Owner or admin can view full preparer profile"
ON public.preparer_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Public-safe view: excludes ptin
CREATE OR REPLACE VIEW public.preparer_profiles_public
WITH (security_invoker = on) AS
SELECT
  id,
  user_id,
  display_name,
  credentials,
  qb_certifications,
  bio,
  headshot_url,
  accepting_clients,
  created_at,
  updated_at
FROM public.preparer_profiles;

GRANT SELECT ON public.preparer_profiles_public TO authenticated;
GRANT SELECT ON public.preparer_profiles_public TO anon;


CREATE TABLE public.admin_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_user_id UUID NOT NULL,
  preparer_user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX admin_corrections_client_idx ON public.admin_corrections (client_user_id, created_at DESC);

GRANT SELECT, INSERT ON public.admin_corrections TO authenticated;
GRANT ALL ON public.admin_corrections TO service_role;

ALTER TABLE public.admin_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view their own correction history"
  ON public.admin_corrections FOR SELECT TO authenticated
  USING (
    auth.uid() = client_user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'preparer')
  );

CREATE POLICY "Only preparers and admins can write corrections"
  ON public.admin_corrections FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = preparer_user_id
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'preparer'))
  );

-- Allow preparers/admins to update any client's tax_profile (currently only owner can).
CREATE POLICY "Preparers and admins can update any tax_profile"
  ON public.tax_profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'preparer'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'preparer'));

CREATE POLICY "Preparers and admins can view any tax_profile"
  ON public.tax_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'preparer'));

CREATE POLICY "Preparers and admins can view any profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'preparer'));

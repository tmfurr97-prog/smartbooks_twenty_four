
-- 1. extracted_document_data
CREATE TABLE public.extracted_document_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  doc_type text NOT NULL,
  payer_name text,
  payer_tin text,
  recipient_name text,
  recipient_tin text,
  tax_year integer,
  amounts jsonb NOT NULL DEFAULT '{}'::jsonb,
  box_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_text text,
  confidence numeric(3,2) DEFAULT 0,
  applied_to_profile boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id)
);

GRANT SELECT ON public.extracted_document_data TO authenticated;
GRANT ALL ON public.extracted_document_data TO service_role;

ALTER TABLE public.extracted_document_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view extracted data"
  ON public.extracted_document_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Preparers can view all extracted data"
  ON public.extracted_document_data FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'preparer') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_extracted_document_data_updated_at
  BEFORE UPDATE ON public.extracted_document_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_extracted_document_data_user ON public.extracted_document_data(user_id);
CREATE INDEX idx_extracted_document_data_doc ON public.extracted_document_data(document_id);

-- 2. audit_defense_memos
CREATE TABLE public.audit_defense_memos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  return_year integer NOT NULL,
  title text NOT NULL,
  risk_score integer,
  content_md text NOT NULL,
  flagged_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit_defense_memos TO authenticated;
GRANT ALL ON public.audit_defense_memos TO service_role;

ALTER TABLE public.audit_defense_memos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view their memos"
  ON public.audit_defense_memos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Preparers can view all memos"
  ON public.audit_defense_memos FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'preparer') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_audit_defense_memos_updated_at
  BEFORE UPDATE ON public.audit_defense_memos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_audit_defense_memos_user ON public.audit_defense_memos(user_id);

-- 3. blog_posts.social_pack
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS social_pack jsonb;

-- 4. profiles.addon_audit_defense
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS addon_audit_defense boolean NOT NULL DEFAULT false;

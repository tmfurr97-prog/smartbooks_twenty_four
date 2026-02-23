-- Add file_hash column for duplicate detection
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_hash text;

-- Add suggested_name column for AI auto-naming
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS suggested_name text;

-- Add ai_category column for AI auto-sorting
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS ai_category text;

-- Create index for duplicate detection
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON public.documents (user_id, file_hash) WHERE file_hash IS NOT NULL;
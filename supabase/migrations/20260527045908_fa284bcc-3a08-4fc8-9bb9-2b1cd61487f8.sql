
-- 1. Lock down SECURITY DEFINER helper
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 2. Tighten messages SELECT policy to sender-only
DROP POLICY IF EXISTS "Clients can view their own messages" ON public.messages;
CREATE POLICY "Users can view messages they sent"
ON public.messages FOR SELECT TO authenticated
USING (auth.uid() = sender_id);

-- 3. Remove messages from realtime publication to prevent unauthorized channel subscriptions
ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;

-- 4. Add UPDATE policies for storage buckets
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own receipts"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'receipts' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'receipts' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Make chat-images bucket public so images can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'chat-images';

-- Update the storage policies for chat images to work with public bucket
DROP POLICY IF EXISTS "Users can view chat images in their groups" ON storage.objects;
CREATE POLICY "Chat images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-images');
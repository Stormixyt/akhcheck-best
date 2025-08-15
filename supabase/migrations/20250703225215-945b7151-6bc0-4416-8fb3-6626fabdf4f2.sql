-- Add profile photo support to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for avatars  
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-images', 'chat-images', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies for chat image uploads  
CREATE POLICY "Users can view chat images in their groups" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-images' AND EXISTS (
  SELECT 1 FROM group_members 
  WHERE group_id::text = (storage.foldername(name))[1] 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can upload chat images to their groups" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[2] AND EXISTS (
  SELECT 1 FROM group_members 
  WHERE group_id::text = (storage.foldername(name))[1] 
  AND user_id = auth.uid()
));

-- Add image_url column to group messages for image sharing
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS image_url TEXT;
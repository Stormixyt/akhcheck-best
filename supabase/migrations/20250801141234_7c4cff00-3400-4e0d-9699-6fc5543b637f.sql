-- Add v1.2 update tracking field to user preferences
ALTER TABLE public.user_preferences 
ADD COLUMN has_seen_v12_update BOOLEAN NOT NULL DEFAULT false;
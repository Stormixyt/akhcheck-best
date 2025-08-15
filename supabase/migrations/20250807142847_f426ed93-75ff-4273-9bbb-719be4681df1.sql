-- Add dark mode preference to user preferences
ALTER TABLE public.user_preferences 
ADD COLUMN dark_mode BOOLEAN NOT NULL DEFAULT false;
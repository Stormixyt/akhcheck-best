-- Update check constraints to match the values we're using in the code

-- Fix daily_check_ins status constraint
ALTER TABLE daily_check_ins DROP CONSTRAINT daily_check_ins_status_check;
ALTER TABLE daily_check_ins ADD CONSTRAINT daily_check_ins_status_check 
CHECK (status = ANY (ARRAY['disciplined'::text, 'gooned'::text]));

-- Fix group_messages type constraint to include new types
ALTER TABLE group_messages DROP CONSTRAINT group_messages_type_check;
ALTER TABLE group_messages ADD CONSTRAINT group_messages_type_check 
CHECK (type = ANY (ARRAY['text'::text, 'verse'::text, 'motivation'::text, 'status_update'::text, 'system'::text, 'image'::text]));
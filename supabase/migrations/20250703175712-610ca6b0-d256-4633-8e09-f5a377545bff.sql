-- Fix group joining by allowing authenticated users to find any group by code
-- This is safe because group codes are like public invite links

DROP POLICY IF EXISTS "Users can view their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can find groups by code" ON public.groups;

-- Allow authenticated users to view any group (needed for joining by code)
CREATE POLICY "Authenticated users can view groups" 
ON public.groups 
FOR SELECT 
TO authenticated
USING (true);
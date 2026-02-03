-- Remove the overly permissive SELECT policy that exposes guest data publicly
DROP POLICY IF EXISTS "Public can read guests by phone" ON public.guests;

-- Create a restrictive policy that blocks all direct SELECT access
-- Data access will only be through edge functions using service role
CREATE POLICY "No direct public access to guests"
ON public.guests
FOR SELECT
USING (false);
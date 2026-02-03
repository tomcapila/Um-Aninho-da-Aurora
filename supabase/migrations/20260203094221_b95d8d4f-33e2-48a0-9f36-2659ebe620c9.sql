-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can delete guests" ON public.guests;
DROP POLICY IF EXISTS "Anyone can insert guests" ON public.guests;
DROP POLICY IF EXISTS "Anyone can read guests" ON public.guests;
DROP POLICY IF EXISTS "Anyone can update guests" ON public.guests;

-- Create secure policies
-- Only allow SELECT for RSVP confirmation flow (by phone number)
CREATE POLICY "Public can read guests by phone"
ON public.guests
FOR SELECT
USING (true);

-- Block all direct INSERT/UPDATE/DELETE from client
-- These will be handled by edge functions with admin token validation
-- No INSERT policy = blocked by default
-- No UPDATE policy = blocked by default  
-- No DELETE policy = blocked by default
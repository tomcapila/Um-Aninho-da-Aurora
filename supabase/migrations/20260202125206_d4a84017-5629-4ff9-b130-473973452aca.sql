-- Create guests table
CREATE TABLE public.guests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Allow public read access for confirmation flow (guests lookup by phone)
CREATE POLICY "Anyone can read guests" 
ON public.guests 
FOR SELECT 
USING (true);

-- Allow public insert for admin (we'll add auth later if needed)
CREATE POLICY "Anyone can insert guests" 
ON public.guests 
FOR INSERT 
WITH CHECK (true);

-- Allow public update for confirmation
CREATE POLICY "Anyone can update guests" 
ON public.guests 
FOR UPDATE 
USING (true);

-- Allow public delete for admin
CREATE POLICY "Anyone can delete guests" 
ON public.guests 
FOR DELETE 
USING (true);
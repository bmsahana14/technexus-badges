-- Add credential_id column to badges table
ALTER TABLE public.badges 
ADD COLUMN IF NOT EXISTS credential_id VARCHAR(255) UNIQUE;

-- Update existing badges with a random credential_id if empty (optional but good practice)
UPDATE public.badges 
SET credential_id = 'TN-' || substr(id::text, 1, 8) || '-' || floor(random() * 10000)::text
WHERE credential_id IS NULL;

-- Make email NOT NULL on reservations
ALTER TABLE public.reservations ALTER COLUMN email SET NOT NULL;

-- Update status constraint: replace 'confirmed' with 'approved'
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE public.reservations ADD CONSTRAINT reservations_status_check CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update any existing 'confirmed' records to 'approved'
UPDATE public.reservations SET status = 'approved' WHERE status = 'confirmed';

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON public.reservations(email);

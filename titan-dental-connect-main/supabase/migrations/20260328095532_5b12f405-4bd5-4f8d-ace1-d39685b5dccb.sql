
-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public reservation form)
CREATE POLICY "Anyone can insert reservations" ON public.reservations FOR INSERT TO anon WITH CHECK (true);

-- Service role handles all other operations (via edge functions)
-- No SELECT/UPDATE/DELETE policies for anon - admin ops go through edge functions with service role

-- Create admin 2FA codes table
CREATE TABLE public.admin_2fa_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.admin_2fa_codes ENABLE ROW LEVEL SECURITY;
-- No RLS policies needed - only accessed by edge functions via service role

-- Create admin sessions table
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
-- No RLS policies needed - only accessed by edge functions via service role

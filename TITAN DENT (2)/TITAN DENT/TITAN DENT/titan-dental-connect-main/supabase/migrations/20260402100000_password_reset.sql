-- Password reset tokens table
CREATE TABLE public.admin_password_resets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_password_resets ENABLE ROW LEVEL SECURITY;

-- Admin config table (stores hashed password)
CREATE TABLE public.admin_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- Seed with hash of default password "Titan@2026!"
INSERT INTO public.admin_config (id, password_hash) VALUES (1, '6c1426757a97619f05a6657b46d6406dc045151a52b3d81321b56916300bbb12');

-- Enable Supabase Realtime on reservations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;

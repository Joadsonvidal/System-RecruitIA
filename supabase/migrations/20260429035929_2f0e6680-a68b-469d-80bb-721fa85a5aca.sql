-- Tables
CREATE TABLE public.time_clock_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL UNIQUE,
  office_address TEXT,
  office_latitude DOUBLE PRECISION,
  office_longitude DOUBLE PRECISION,
  allowed_radius_meters INTEGER NOT NULL DEFAULT 100,
  workday_start TIME NOT NULL DEFAULT '08:00',
  workday_end TIME NOT NULL DEFAULT '18:00',
  require_selfie BOOLEAN NOT NULL DEFAULT true,
  enforce_geofence BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE public.time_clock_entry_type AS ENUM ('entrada', 'saida');

CREATE TABLE public.time_clock_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_owner_id UUID NOT NULL,
  entry_type public.time_clock_entry_type NOT NULL,
  clocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  selfie_url TEXT,
  within_geofence BOOLEAN NOT NULL DEFAULT false,
  distance_meters INTEGER,
  device_info TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tce_user ON public.time_clock_entries(user_id, clocked_at DESC);
CREATE INDEX idx_tce_account ON public.time_clock_entries(account_owner_id, clocked_at DESC);

ALTER TABLE public.time_clock_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_clock_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their own settings" ON public.time_clock_settings
FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Authenticated can read settings" ON public.time_clock_settings
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users view own entries" ON public.time_clock_entries
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Account owner views all entries" ON public.time_clock_entries
FOR SELECT USING (auth.uid() = account_owner_id);

CREATE POLICY "Users insert own entries" ON public.time_clock_entries
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_tcs_updated BEFORE UPDATE ON public.time_clock_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_server_time()
RETURNS TIMESTAMPTZ LANGUAGE sql STABLE AS $$ SELECT now(); $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.time_clock_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_clock_settings;

CREATE POLICY "Users upload own selfies" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'time-clock-selfies' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users view own selfies" ON storage.objects
FOR SELECT USING (
  bucket_id = 'time-clock-selfies' AND auth.uid()::text = (storage.foldername(name))[1]
);
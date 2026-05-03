-- =============================================
-- CRIAR TABELAS QUE FALTAM NO BANCO REMOTO
-- =============================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users view own profile') THEN
    CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users insert own profile') THEN
    CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users update own profile') THEN
    CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. EMPLOYEES
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  department TEXT,
  hire_date DATE,
  status TEXT NOT NULL DEFAULT 'ativo',
  resume_url TEXT,
  resume_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='employees' AND policyname='Owners select employees') THEN
    CREATE POLICY "Owners select employees" ON public.employees FOR SELECT USING (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='employees' AND policyname='Owners insert employees') THEN
    CREATE POLICY "Owners insert employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='employees' AND policyname='Owners update employees') THEN
    CREATE POLICY "Owners update employees" ON public.employees FOR UPDATE USING (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='employees' AND policyname='Owners delete employees') THEN
    CREATE POLICY "Owners delete employees" ON public.employees FOR DELETE USING (auth.uid() = owner_id);
  END IF;
END $$;

-- 3. TIME CLOCK ENTRY TYPE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'time_clock_entry_type') THEN
    CREATE TYPE public.time_clock_entry_type AS ENUM ('entrada', 'saida', 'saida_almoco', 'retorno_almoco');
  END IF;
END $$;

-- 4. TIME CLOCK SETTINGS
CREATE TABLE IF NOT EXISTS public.time_clock_settings (
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
ALTER TABLE public.time_clock_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_clock_settings' AND policyname='Owners manage their own settings') THEN
    CREATE POLICY "Owners manage their own settings" ON public.time_clock_settings FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_clock_settings' AND policyname='Authenticated can read settings') THEN
    CREATE POLICY "Authenticated can read settings" ON public.time_clock_settings FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 5. TIME CLOCK ENTRIES
CREATE TABLE IF NOT EXISTS public.time_clock_entries (
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
CREATE INDEX IF NOT EXISTS idx_tce_user ON public.time_clock_entries(user_id, clocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_tce_account ON public.time_clock_entries(account_owner_id, clocked_at DESC);
ALTER TABLE public.time_clock_entries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_clock_entries' AND policyname='Users view own entries') THEN
    CREATE POLICY "Users view own entries" ON public.time_clock_entries FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_clock_entries' AND policyname='Account owner views all entries') THEN
    CREATE POLICY "Account owner views all entries" ON public.time_clock_entries FOR SELECT USING (auth.uid() = account_owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='time_clock_entries' AND policyname='Users insert own entries') THEN
    CREATE POLICY "Users insert own entries" ON public.time_clock_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6. USER ROLES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'user');
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 7. ADMIN AUDIT LOG
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  admin_email text,
  target_user_id uuid,
  target_email text,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- 8. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.get_server_time()
RETURNS TIMESTAMPTZ LANGUAGE sql STABLE SET search_path = public AS $$ SELECT now(); $$;

-- 9. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES ('time-clock-selfies', 'time-clock-selfies', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-resumes', 'employee-resumes', false)
ON CONFLICT (id) DO NOTHING;

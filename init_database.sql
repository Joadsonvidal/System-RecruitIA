
-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Tabela de membros da equipe
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'recrutador' CHECK (role IN ('admin', 'recrutador', 'visualizador')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members are viewable by everyone" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Team members can be inserted by anyone" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Team members can be updated by anyone" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "Team members can be deleted by anyone" ON public.team_members FOR DELETE USING (true);

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de vagas
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Remoto',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paused')),
  recruiter TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Jobs can be inserted by anyone" ON public.jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Jobs can be updated by anyone" ON public.jobs FOR UPDATE USING (true);
CREATE POLICY "Jobs can be deleted by anyone" ON public.jobs FOR DELETE USING (true);

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de candidatos
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  position TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'new',
  origin TEXT NOT NULL DEFAULT 'LinkedIn',
  recruiter TEXT NOT NULL DEFAULT '',
  notes TEXT,
  score INTEGER,
  last_interaction TEXT DEFAULT 'Agora',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates are viewable by everyone" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Candidates can be inserted by anyone" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Candidates can be updated by anyone" ON public.candidates FOR UPDATE USING (true);
CREATE POLICY "Candidates can be deleted by anyone" ON public.candidates FOR DELETE USING (true);

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de entrevistas
CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'presencial', 'telefone')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Interviews are viewable by everyone" ON public.interviews FOR SELECT USING (true);
CREATE POLICY "Interviews can be inserted by anyone" ON public.interviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Interviews can be updated by anyone" ON public.interviews FOR UPDATE USING (true);
CREATE POLICY "Interviews can be deleted by anyone" ON public.interviews FOR DELETE USING (true);

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais de membros
INSERT INTO public.team_members (name, email, role, status) VALUES
  ('Ana Silva', 'ana@empresa.com', 'admin', 'ativo'),
  ('Carlos Lima', 'carlos@empresa.com', 'recrutador', 'ativo'),
  ('Maria Santos', 'maria@empresa.com', 'visualizador', 'inativo');

-- Inserir vagas iniciais
INSERT INTO public.jobs (title, department, location, status, recruiter, created_at) VALUES
  ('Desenvolvedor Front-end', 'Tecnologia', 'Remoto', 'open', 'Maria', '2025-03-01'),
  ('Desenvolvedor Back-end', 'Tecnologia', 'São Paulo', 'open', 'João', '2025-03-05'),
  ('Designer UX/UI', 'Design', 'Remoto', 'open', 'Maria', '2025-03-08'),
  ('Product Manager', 'Produto', 'Rio de Janeiro', 'open', 'Maria', '2025-02-20'),
  ('DevOps', 'Tecnologia', 'Híbrido', 'open', 'João', '2025-03-10'),
  ('Analista de Dados', 'Dados', 'Remoto', 'closed', 'João', '2025-01-15');

-- Inserir candidatos iniciais
INSERT INTO public.candidates (name, phone, email, position, stage, origin, recruiter, notes, score, last_interaction) VALUES
  ('Ana Silva', '(11) 99123-4567', 'ana@email.com', 'Desenvolvedor Front-end', 'new', 'LinkedIn', 'Maria', 'Experiência com React e TypeScript', 85, 'Hoje, 14:30'),
  ('Carlos Oliveira', '(11) 98765-4321', 'carlos@email.com', 'Desenvolvedor Back-end', 'screening', 'WhatsApp', 'João', '5 anos de experiência com Node.js', 78, 'Ontem, 10:00'),
  ('Juliana Santos', '(21) 97654-3210', 'juliana@email.com', 'Designer UX/UI', 'interview', 'Indicação', 'Maria', 'Portfolio excelente', 92, 'Há 2 dias'),
  ('Pedro Costa', '(11) 96543-2109', 'pedro@email.com', 'Desenvolvedor Front-end', 'test', 'LinkedIn', 'João', 'Teste técnico enviado', 70, 'Hoje, 09:15'),
  ('Fernanda Lima', '(31) 95432-1098', 'fernanda@email.com', 'Product Manager', 'approved', 'WhatsApp', 'Maria', 'Aprovada! Aguardando proposta', 95, 'Há 3 dias'),
  ('Lucas Mendes', '(11) 94321-0987', 'lucas@email.com', 'Desenvolvedor Back-end', 'new', 'LinkedIn', 'João', 'Currículo recebido via WhatsApp', NULL, 'Hoje, 16:00'),
  ('Mariana Rocha', '(21) 93210-9876', 'mariana@email.com', 'Designer UX/UI', 'screening', 'Site', 'Maria', 'Agendando triagem', NULL, 'Ontem, 15:30'),
  ('Rafael Souza', '(11) 92109-8765', 'rafael@email.com', 'Desenvolvedor Front-end', 'rejected', 'LinkedIn', 'João', 'Não atende requisitos técnicos', NULL, 'Há 5 dias'),
  ('Camila Ferreira', '(31) 91098-7654', 'camila@email.com', 'Product Manager', 'interview', 'Indicação', 'Maria', 'Segunda entrevista marcada', NULL, 'Hoje, 11:00'),
  ('Bruno Alves', '(11) 90987-6543', 'bruno@email.com', 'DevOps', 'new', 'WhatsApp', 'João', 'Primeiro contato feito', NULL, 'Hoje, 08:45');

-- Inserir entrevistas iniciais
INSERT INTO public.interviews (candidate_name, job_title, date, time, type) VALUES
  ('Juliana Santos', 'Designer UX/UI', '2025-03-11', '10:00', 'video'),
  ('Camila Ferreira', 'Product Manager', '2025-03-11', '14:00', 'presencial'),
  ('Pedro Costa', 'Desenvolvedor Front-end', '2025-03-12', '09:30', 'video');

-- 1. PROFILES table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- update_updated_at function (shared)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.email);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Add user_id to existing tables + extra fields
ALTER TABLE public.candidates ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.candidates ADD COLUMN salary NUMERIC;
ALTER TABLE public.candidates ADD COLUMN hire_date DATE;
ALTER TABLE public.candidates ADD COLUMN termination_date DATE;

ALTER TABLE public.jobs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.jobs ADD COLUMN candidates_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.interviews ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.team_members ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Auto-set user_id trigger
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.user_id IS NULL THEN NEW.user_id = auth.uid(); END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER set_user_id_candidates BEFORE INSERT ON public.candidates
FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_jobs BEFORE INSERT ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_interviews BEFORE INSERT ON public.interviews
FOR EACH ROW EXECUTE FUNCTION public.set_user_id();
CREATE TRIGGER set_user_id_team BEFORE INSERT ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- 3. Enable RLS + policies (drop any existing first to be safe)
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies
           WHERE schemaname='public' AND tablename IN ('candidates','jobs','interviews','team_members')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- candidates
CREATE POLICY "own select" ON public.candidates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.candidates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.candidates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.candidates FOR DELETE USING (auth.uid() = user_id);

-- jobs
CREATE POLICY "own select" ON public.jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.jobs FOR DELETE USING (auth.uid() = user_id);

-- interviews
CREATE POLICY "own select" ON public.interviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.interviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.interviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.interviews FOR DELETE USING (auth.uid() = user_id);

-- team_members
CREATE POLICY "own select" ON public.team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.team_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.team_members FOR DELETE USING (auth.uid() = user_id);

-- 4. Realtime
ALTER TABLE public.candidates REPLICA IDENTITY FULL;
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER TABLE public.interviews REPLICA IDENTITY FULL;
ALTER TABLE public.team_members REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_user_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
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
ALTER TYPE public.time_clock_entry_type ADD VALUE IF NOT EXISTS 'saida_almoco';
ALTER TYPE public.time_clock_entry_type ADD VALUE IF NOT EXISTS 'retorno_almoco';
CREATE OR REPLACE FUNCTION public.get_server_time()
RETURNS timestamp with time zone
LANGUAGE sql
STABLE
SET search_path = public
AS $$ SELECT now(); $$;

ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS termination_reason TEXT;

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

DROP POLICY IF EXISTS "Owners select employees" ON public.employees;
DROP POLICY IF EXISTS "Owners insert employees" ON public.employees;
DROP POLICY IF EXISTS "Owners update employees" ON public.employees;
DROP POLICY IF EXISTS "Owners delete employees" ON public.employees;

CREATE POLICY "Owners select employees" ON public.employees FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners insert employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update employees" ON public.employees FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete employees" ON public.employees FOR DELETE USING (auth.uid() = owner_id);

DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-resumes', 'employee-resumes', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Owners read resumes" ON storage.objects;
DROP POLICY IF EXISTS "Owners upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Owners update resumes" ON storage.objects;
DROP POLICY IF EXISTS "Owners delete resumes" ON storage.objects;

CREATE POLICY "Owners read resumes" ON storage.objects FOR SELECT
USING (bucket_id = 'employee-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners upload resumes" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'employee-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners update resumes" ON storage.objects FOR UPDATE
USING (bucket_id = 'employee-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners delete resumes" ON storage.objects FOR DELETE
USING (bucket_id = 'employee-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'super_admin'));

-- 2. profiles status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ativo';

CREATE POLICY "Super admins view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins update all profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'super_admin'));

-- 3. Audit log
CREATE TABLE public.admin_audit_log (
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

CREATE POLICY "Super admins view audit log" ON public.admin_audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins insert audit log" ON public.admin_audit_log
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 4. Grant super_admin to existing user with that email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role FROM auth.users WHERE email = 'joadson.e.e.d@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

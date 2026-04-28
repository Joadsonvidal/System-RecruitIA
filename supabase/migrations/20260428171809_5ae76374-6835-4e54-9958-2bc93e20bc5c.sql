
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

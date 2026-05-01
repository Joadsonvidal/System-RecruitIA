
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

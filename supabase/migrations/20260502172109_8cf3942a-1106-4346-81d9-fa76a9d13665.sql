
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

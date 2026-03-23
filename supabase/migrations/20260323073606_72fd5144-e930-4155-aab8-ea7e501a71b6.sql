
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

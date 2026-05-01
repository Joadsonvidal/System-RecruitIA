export interface Candidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  position: string;
  stage: string;
  origin: string;
  recruiter: string;
  lastInteraction: string;
  notes: string;
  score?: number;
  salary?: number;
  hireDate?: string;
  terminationDate?: string;
  terminationReason?: string;
  createdAt?: string;
}

export const TERMINATION_REASONS = [
  "Desistência por valor",
  "Desistência por desânimo",
  "Conflito interno",
  "Recebeu outra proposta externa",
  "Proposta de Player",
  "Proposta de Conselheiro",
] as const;
export type TerminationReason = typeof TERMINATION_REASONS[number];

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: "open" | "closed" | "paused";
  candidates: number;
  createdAt: string;
  recruiter: string;
}

export interface Interview {
  id: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  type: "video" | "presencial" | "telefone";
}

export const PIPELINE_STAGES = [
  { id: "new", label: "Novo", color: "hsl(210, 80%, 52%)" },
  { id: "screening", label: "Triagem", color: "hsl(38, 92%, 50%)" },
  { id: "interview", label: "Entrevista", color: "hsl(270, 60%, 52%)" },
  { id: "test", label: "Teste", color: "hsl(200, 70%, 50%)" },
  { id: "approved", label: "Aprovado", color: "hsl(152, 60%, 36%)" },
  { id: "rejected", label: "Reprovado", color: "hsl(0, 72%, 51%)" },
  { id: "terminated", label: "Desligado", color: "hsl(0, 0%, 45%)" },
];

export const mockCandidates: Candidate[] = [
  { id: "1", name: "Ana Paula", phone: "(11) 99123-4567", email: "ana@email.com", position: "Desenvolvedor Front-end", stage: "new", origin: "LinkedIn", recruiter: "Ana Silva", lastInteraction: "Hoje, 14:30", notes: "Experiência com React e TypeScript", score: 85, createdAt: "2025-03-10" },
  { id: "2", name: "Carlos Oliveira", phone: "(11) 98765-4321", email: "carlos@email.com", position: "Desenvolvedor Back-end", stage: "screening", origin: "WhatsApp", recruiter: "Carlos Lima", lastInteraction: "Ontem, 10:00", notes: "5 anos de experiência com Node.js", score: 78, createdAt: "2025-03-08" },
  { id: "3", name: "Juliana Santos", phone: "(21) 97654-3210", email: "juliana@email.com", position: "Designer UX/UI", stage: "interview", origin: "Indicação", recruiter: "Ana Silva", lastInteraction: "Há 2 dias", notes: "Portfolio excelente", score: 92, createdAt: "2025-02-20" },
  { id: "4", name: "Pedro Costa", phone: "(11) 96543-2109", email: "pedro@email.com", position: "Desenvolvedor Front-end", stage: "test", origin: "LinkedIn", recruiter: "Carlos Lima", lastInteraction: "Hoje, 09:15", notes: "Teste técnico enviado", score: 70, createdAt: "2025-03-05" },
  { id: "5", name: "Fernanda Lima", phone: "(31) 95432-1098", email: "fernanda@email.com", position: "Product Manager", stage: "approved", origin: "WhatsApp", recruiter: "Ana Silva", lastInteraction: "Há 3 dias", notes: "Aprovada! Aguardando proposta", score: 95, createdAt: "2025-01-15", salary: 12000, hireDate: "2025-02-01" },
  { id: "6", name: "Lucas Mendes", phone: "(11) 94321-0987", email: "lucas@email.com", position: "Desenvolvedor Back-end", stage: "new", origin: "LinkedIn", recruiter: "Carlos Lima", lastInteraction: "Hoje, 16:00", notes: "Currículo recebido via WhatsApp", createdAt: "2025-03-12" },
  { id: "7", name: "Mariana Rocha", phone: "(21) 93210-9876", email: "mariana@email.com", position: "Designer UX/UI", stage: "screening", origin: "Site", recruiter: "Ana Silva", lastInteraction: "Ontem, 15:30", notes: "Agendando triagem", createdAt: "2025-02-28" },
  { id: "8", name: "Rafael Souza", phone: "(11) 92109-8765", email: "rafael@email.com", position: "Desenvolvedor Front-end", stage: "rejected", origin: "LinkedIn", recruiter: "Carlos Lima", lastInteraction: "Há 5 dias", notes: "Não atende requisitos técnicos", createdAt: "2025-01-20" },
  { id: "9", name: "Camila Ferreira", phone: "(31) 91098-7654", email: "camila@email.com", position: "Product Manager", stage: "interview", origin: "Indicação", recruiter: "Ana Silva", lastInteraction: "Hoje, 11:00", notes: "Segunda entrevista marcada", createdAt: "2025-03-01" },
  { id: "10", name: "Bruno Alves", phone: "(11) 90987-6543", email: "bruno@email.com", position: "DevOps", stage: "new", origin: "WhatsApp", recruiter: "Carlos Lima", lastInteraction: "Hoje, 08:45", notes: "Primeiro contato feito", createdAt: "2025-03-15" },
  { id: "11", name: "Tatiana Reis", phone: "(11) 91111-2222", email: "tatiana@email.com", position: "Desenvolvedor Front-end", stage: "terminated", origin: "LinkedIn", recruiter: "Ana Silva", lastInteraction: "Há 30 dias", notes: "Desligada após período de experiência", salary: 8500, hireDate: "2024-10-01", terminationDate: "2025-01-15", createdAt: "2024-09-10" },
  { id: "12", name: "Eduardo Martins", phone: "(21) 92222-3333", email: "eduardo@email.com", position: "Desenvolvedor Back-end", stage: "terminated", origin: "Indicação", recruiter: "Carlos Lima", lastInteraction: "Há 45 dias", notes: "Pediu demissão", salary: 9200, hireDate: "2024-08-15", terminationDate: "2025-02-28", createdAt: "2024-07-20" },
  { id: "13", name: "Priscila Nunes", phone: "(31) 93333-4444", email: "priscila@email.com", position: "Designer UX/UI", stage: "approved", origin: "LinkedIn", recruiter: "Ana Silva", lastInteraction: "Há 10 dias", notes: "Contratada", salary: 7800, hireDate: "2025-01-10", createdAt: "2024-12-05" },
  { id: "14", name: "Gustavo Ribeiro", phone: "(11) 94444-5555", email: "gustavo@email.com", position: "DevOps", stage: "approved", origin: "WhatsApp", recruiter: "Carlos Lima", lastInteraction: "Há 15 dias", notes: "Contratado", salary: 11000, hireDate: "2025-02-01", createdAt: "2025-01-05" },
];

export const mockJobs: Job[] = [
  { id: "1", title: "Desenvolvedor Front-end", department: "Tecnologia", location: "Remoto", status: "open", candidates: 4, createdAt: "2025-03-01", recruiter: "Ana Silva" },
  { id: "2", title: "Desenvolvedor Back-end", department: "Tecnologia", location: "São Paulo", status: "open", candidates: 3, createdAt: "2025-03-05", recruiter: "Carlos Lima" },
  { id: "3", title: "Designer UX/UI", department: "Design", location: "Remoto", status: "open", candidates: 2, createdAt: "2025-03-08", recruiter: "Ana Silva" },
  { id: "4", title: "Product Manager", department: "Produto", location: "Rio de Janeiro", status: "open", candidates: 2, createdAt: "2025-02-20", recruiter: "Ana Silva" },
  { id: "5", title: "DevOps", department: "Tecnologia", location: "Híbrido", status: "open", candidates: 1, createdAt: "2025-03-10", recruiter: "Carlos Lima" },
  { id: "6", title: "Analista de Dados", department: "Dados", location: "Remoto", status: "closed", candidates: 5, createdAt: "2025-01-15", recruiter: "Carlos Lima" },
];

export const mockInterviews: Interview[] = [
  { id: "1", candidateName: "Juliana Santos", jobTitle: "Designer UX/UI", date: "2025-03-11", time: "10:00", type: "video" },
  { id: "2", candidateName: "Camila Ferreira", jobTitle: "Product Manager", date: "2025-03-11", time: "14:00", type: "presencial" },
  { id: "3", candidateName: "Pedro Costa", jobTitle: "Desenvolvedor Front-end", date: "2025-03-12", time: "09:30", type: "video" },
];

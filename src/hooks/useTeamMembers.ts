const STORAGE_KEY = "zr_team_members";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "recrutador" | "visualizador";
  status: "ativo" | "inativo";
}

const defaultMembers: TeamMember[] = [
  { id: "1", name: "Ana Silva", email: "ana@empresa.com", role: "admin", status: "ativo" },
  { id: "2", name: "Carlos Lima", email: "carlos@empresa.com", role: "recrutador", status: "ativo" },
  { id: "3", name: "Maria Santos", email: "maria@empresa.com", role: "visualizador", status: "inativo" },
];

export const getTeamMembers = (): TeamMember[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultMembers;
  } catch {
    return defaultMembers;
  }
};

export const getActiveRecruiters = (): string[] => {
  const members = getTeamMembers();
  return members
    .filter((m) => m.status === "ativo")
    .map((m) => m.name);
};

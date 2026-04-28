import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "recrutador" | "visualizador";
  status: "ativo" | "inativo";
}

// Synchronous cache so legacy callers (getTeamMembers / getActiveRecruiters) keep working
let cache: TeamMember[] = [];
const listeners = new Set<(m: TeamMember[]) => void>();
let initialized = false;

const rowToMember = (r: any): TeamMember => ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  status: r.status,
});

const refresh = async () => {
  const { data } = await supabase.from("team_members").select("*").order("created_at", { ascending: true });
  cache = (data ?? []).map(rowToMember);
  listeners.forEach((l) => l(cache));
};

const init = () => {
  if (initialized) return;
  initialized = true;
  refresh();
  supabase
    .channel("team-members-sync")
    .on("postgres_changes", { event: "*", schema: "public", table: "team_members" }, refresh)
    .subscribe();
};

export const useTeamMembers = () => {
  const [members, setMembers] = useState<TeamMember[]>(cache);

  useEffect(() => {
    init();
    setMembers(cache);
    const cb = (m: TeamMember[]) => setMembers([...m]);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const addMember = async (m: Omit<TeamMember, "id">) => {
    await supabase.from("team_members").insert({
      name: m.name,
      email: m.email,
      role: m.role,
      status: m.status,
    });
  };

  const updateMember = async (id: string, updates: Partial<TeamMember>) => {
    await supabase.from("team_members").update(updates).eq("id", id);
  };

  const deleteMember = async (id: string) => {
    await supabase.from("team_members").delete().eq("id", id);
  };

  return { members, addMember, updateMember, deleteMember };
};

// Legacy synchronous helpers used across the app
export const getTeamMembers = (): TeamMember[] => {
  init();
  return cache;
};

export const getActiveRecruiters = (): string[] => {
  init();
  return cache.filter((m) => m.status === "ativo").map((m) => m.name);
};

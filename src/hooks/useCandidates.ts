import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Candidate, Job } from "@/data/mockData";
import { toast } from "sonner";

// DB row → Candidate UI shape
const rowToCandidate = (r: any): Candidate => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  email: r.email ?? "",
  position: r.position,
  stage: r.stage,
  origin: r.origin,
  recruiter: r.recruiter,
  lastInteraction: r.last_interaction ?? "",
  notes: r.notes ?? "",
  score: r.score ?? undefined,
  salary: r.salary ?? undefined,
  hireDate: r.hire_date ?? undefined,
  terminationDate: r.termination_date ?? undefined,
  createdAt: r.created_at?.split("T")[0],
});

const rowToJob = (r: any): Job => ({
  id: r.id,
  title: r.title,
  department: r.department,
  location: r.location,
  status: r.status as Job["status"],
  candidates: r.candidates_count ?? 0,
  createdAt: r.created_at?.split("T")[0] ?? "",
  recruiter: r.recruiter,
});

const candidateToRow = (c: Partial<Candidate>) => {
  const o: any = {};
  if (c.name !== undefined) o.name = c.name;
  if (c.phone !== undefined) o.phone = c.phone;
  if (c.email !== undefined) o.email = c.email;
  if (c.position !== undefined) o.position = c.position;
  if (c.stage !== undefined) o.stage = c.stage;
  if (c.origin !== undefined) o.origin = c.origin;
  if (c.recruiter !== undefined) o.recruiter = c.recruiter;
  if (c.lastInteraction !== undefined) o.last_interaction = c.lastInteraction;
  if (c.notes !== undefined) o.notes = c.notes;
  if (c.score !== undefined) o.score = c.score;
  if (c.salary !== undefined) o.salary = c.salary;
  if (c.hireDate !== undefined) o.hire_date = c.hireDate;
  if (c.terminationDate !== undefined) o.termination_date = c.terminationDate;
  return o;
};

export const useCandidates = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Initial load + realtime
  useEffect(() => {
    if (!user) {
      setCandidates([]);
      setJobs([]);
      return;
    }

    const load = async () => {
      const [{ data: cs }, { data: js }] = await Promise.all([
        supabase.from("candidates").select("*").order("created_at", { ascending: false }),
        supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      ]);
      if (cs) setCandidates(cs.map(rowToCandidate));
      if (js) setJobs(js.map(rowToJob));
    };
    load();

    const ch = supabase
      .channel("app-data")
      .on("postgres_changes", { event: "*", schema: "public", table: "candidates" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const addCandidate = async (c: Candidate) => {
    const { error } = await supabase.from("candidates").insert(candidateToRow(c));
    if (error) toast.error("Erro ao salvar candidato: " + error.message);
  };

  const updateCandidateStage = async (id: string, stage: string) => {
    const { error } = await supabase.from("candidates").update({ stage }).eq("id", id);
    if (error) toast.error(error.message);
  };

  const addNoteToCandidate = async (id: string, note: string) => {
    const current = candidates.find((c) => c.id === id);
    const merged = current?.notes ? `${current.notes}\n---\n${note}` : note;
    const { error } = await supabase
      .from("candidates")
      .update({ notes: merged, last_interaction: "Agora" })
      .eq("id", id);
    if (error) toast.error(error.message);
  };

  const addJob = async (j: Job) => {
    const { error } = await supabase.from("jobs").insert({
      title: j.title,
      department: j.department,
      location: j.location,
      status: j.status,
      recruiter: j.recruiter,
      candidates_count: j.candidates ?? 0,
    });
    if (error) toast.error("Erro ao salvar vaga: " + error.message);
  };

  const toggleJobStatus = async (id: string) => {
    const j = jobs.find((x) => x.id === id);
    if (!j) return;
    const next = j.status === "open" ? "closed" : j.status === "closed" ? "open" : j.status;
    const { error } = await supabase.from("jobs").update({ status: next }).eq("id", id);
    if (error) toast.error(error.message);
  };

  const deleteCandidate = async (id: string) => {
    const { error } = await supabase.from("candidates").delete().eq("id", id);
    if (error) toast.error(error.message);
  };

  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    const { error } = await supabase.from("candidates").update(candidateToRow(updates)).eq("id", id);
    if (error) toast.error(error.message);
  };

  const jobTitles = jobs.filter((j) => j.status === "open").map((j) => j.title);

  return {
    candidates,
    jobs,
    jobTitles,
    addCandidate,
    updateCandidateStage,
    addNoteToCandidate,
    addJob,
    toggleJobStatus,
    deleteCandidate,
    updateCandidate,
  };
};

import { useState } from "react";
import { mockCandidates, mockJobs, type Candidate, type Job } from "@/data/mockData";

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);

  const addCandidate = (candidate: Candidate) => {
    setCandidates((prev) => [candidate, ...prev]);
  };

  const updateCandidateStage = (id: string, stage: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage } : c))
    );
  };

  const addNoteToCandidate = (id: string, note: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, notes: c.notes ? `${c.notes}\n---\n${note}` : note, lastInteraction: "Agora" }
          : c
      )
    );
  };

  const addJob = (job: Job) => {
    setJobs((prev) => [job, ...prev]);
  };

  const toggleJobStatus = (id: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status: j.status === "open" ? "closed" : j.status === "closed" ? "open" : j.status }
          : j
      )
    );
  };

  const deleteCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const jobTitles = jobs.filter((j) => j.status === "open").map((j) => j.title);

  return { candidates, jobs, jobTitles, addCandidate, updateCandidateStage, addNoteToCandidate, addJob, toggleJobStatus, deleteCandidate, updateCandidate };
};

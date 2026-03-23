import React, { createContext, useContext } from "react";
import { useCandidates } from "@/hooks/useCandidates";
import { type Candidate, type Job } from "@/data/mockData";

interface AppContextType {
  candidates: Candidate[];
  jobs: Job[];
  jobTitles: string[];
  addCandidate: (candidate: Candidate) => void;
  updateCandidateStage: (id: string, stage: string) => void;
  addNoteToCandidate: (id: string, note: string) => void;
  addJob: (job: Job) => void;
  toggleJobStatus: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const data = useCandidates();
  return <AppContext.Provider value={data}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

import { useState } from "react";
import { Phone, MessageSquare, MoreHorizontal } from "lucide-react";
import { mockCandidates, PIPELINE_STAGES, type Candidate } from "@/data/mockData";

const Pipeline = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDrop = (stageId: string) => {
    if (!draggedId) return;
    setCandidates((prev) =>
      prev.map((c) => (c.id === draggedId ? { ...c, stage: stageId } : c))
    );
    setDraggedId(null);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie candidatos pelo processo seletivo</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-semibold">{stage.label}</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-background rounded-full px-2 py-0.5">
                  {stageCandidates.length}
                </span>
              </div>

              <div className="space-y-2">
                {stageCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    draggable
                    onDragStart={() => handleDragStart(candidate.id)}
                    className={`kanban-card ${draggedId === candidate.id ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-tight">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.position}</p>
                        </div>
                      </div>
                      <button className="text-muted-foreground hover:text-foreground p-0.5">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{candidate.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <span className="text-[11px] text-muted-foreground">{candidate.lastInteraction}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {candidate.origin}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;

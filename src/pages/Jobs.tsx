import { Users, MapPin, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import AddJobDialog from "@/components/AddJobDialog";
import { toast } from "@/hooks/use-toast";

const statusMap: Record<string, { label: string; className: string }> = {
  open: { label: "Aberta", className: "bg-accent text-accent-foreground" },
  closed: { label: "Fechada", className: "bg-muted text-muted-foreground" },
  paused: { label: "Pausada", className: "bg-warning/10 text-warning" },
};

const Jobs = () => {
  const { jobs, addJob, toggleJobStatus } = useAppContext();

  const handleToggleStatus = (id: string, currentStatus: string) => {
    toggleJobStatus(id);
    toast({
      title: currentStatus === "open" ? "Vaga fechada" : "Vaga reaberta",
      description: currentStatus === "open" ? "A vaga foi fechada com sucesso." : "A vaga foi reaberta.",
    });
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vagas</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie suas vagas abertas</p>
        </div>
        <AddJobDialog onAdd={addJob} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => {
          const status = statusMap[job.status];
          return (
            <div key={job.id} className="stat-card group cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{job.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{job.department}</p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job.candidates} candidatos</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-[11px] text-muted-foreground">Responsável: {job.recruiter}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleToggleStatus(job.id, job.status)}
                >
                  {job.status === "open" ? "Fechar" : "Reabrir"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Jobs;

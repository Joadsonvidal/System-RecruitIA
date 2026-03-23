import { Users, Briefcase, Calendar, AlertCircle, UserPlus, ArrowRight } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { PIPELINE_STAGES } from "@/data/mockData";
import { Link } from "react-router-dom";
import AddCandidateDialog from "@/components/AddCandidateDialog";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { candidates, jobs, jobTitles, addCandidate } = useAppContext();

  const todayInterviews: { id: string; candidateName: string; jobTitle: string; time: string; type: string }[] = [];

  const stageCounts = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: candidates.filter((c) => c.stage === stage.id).length,
  }));

  const stats = [
    { label: "Candidatos Ativos", value: candidates.length, icon: Users, color: "text-primary" },
    { label: "Vagas Abertas", value: jobs.filter((j) => j.status === "open").length, icon: Briefcase, color: "text-info" },
    { label: "Entrevistas Hoje", value: todayInterviews.length, icon: Calendar, color: "text-accent-foreground" },
    { label: "Follow-ups Atrasados", value: 3, icon: AlertCircle, color: "text-warning" },
    { label: "Candidatos Novos", value: candidates.filter((c) => c.stage === "new").length, icon: UserPlus, color: "text-primary" },
  ];

  const recentCandidates = candidates.filter((c) => c.stage === "new").slice(0, 5);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral do seu recrutamento</p>
        </div>
        <AddCandidateDialog onAdd={addCandidate} jobs={jobTitles} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Overview */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Pipeline de Candidatos</h2>
          <Link to="/pipeline">
            <Button variant="ghost" size="sm">
              Ver pipeline <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stageCounts.map((stage) => (
            <Link to="/candidates" key={stage.id} className="rounded-lg border border-border p-3 text-center hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-xs font-medium text-muted-foreground">{stage.label}</span>
              </div>
              <p className="text-xl font-bold">{stage.count}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Candidates */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Candidatos Recentes</h2>
            <Link to="/candidates">
              <Button variant="ghost" size="sm">
                Ver todos <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentCandidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum candidato novo.</p>
            ) : (
              recentCandidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground">{candidate.position}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{candidate.origin}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Open Jobs */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Vagas Abertas</h2>
            <Link to="/jobs">
              <Button variant="ghost" size="sm">
                Ver todas <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {jobs.filter((j) => j.status === "open").slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">{job.department} · {job.location}</p>
                </div>
                <span className="text-xs font-medium text-primary">{job.candidates} candidatos</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { Users, Briefcase, Calendar, AlertCircle, UserPlus } from "lucide-react";
import { mockCandidates, mockJobs, mockInterviews } from "@/data/mockData";

const stats = [
  { label: "Candidatos Ativos", value: 10, icon: Users, color: "text-primary" },
  { label: "Vagas Abertas", value: 5, icon: Briefcase, color: "text-info" },
  { label: "Entrevistas Hoje", value: 2, icon: Calendar, color: "text-accent-foreground" },
  { label: "Follow-ups Atrasados", value: 3, icon: AlertCircle, color: "text-warning" },
  { label: "Candidatos Novos", value: 3, icon: UserPlus, color: "text-primary" },
];

const Dashboard = () => {
  const todayInterviews = mockInterviews.filter((i) => i.date === "2025-03-11");
  const recentCandidates = mockCandidates.filter((c) => c.stage === "new");

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do seu recrutamento</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h2 className="font-semibold mb-4">Entrevistas Hoje</h2>
          {todayInterviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma entrevista hoje.</p>
          ) : (
            <div className="space-y-3">
              {todayInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{interview.candidateName}</p>
                    <p className="text-xs text-muted-foreground">{interview.jobTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{interview.time}</p>
                    <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      {interview.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stat-card">
          <h2 className="font-semibold mb-4">Candidatos Recentes</h2>
          <div className="space-y-3">
            {recentCandidates.map((candidate) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

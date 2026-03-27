import { useState, useMemo } from "react";
import { Users, Briefcase, Calendar, AlertCircle, UserPlus, ArrowRight, UserMinus, DollarSign, Filter } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { PIPELINE_STAGES } from "@/data/mockData";
import { Link } from "react-router-dom";
import AddCandidateDialog from "@/components/AddCandidateDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const Dashboard = () => {
  const { candidates, jobs, jobTitles, addCandidate } = useAppContext();
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth()));

  const recruiters = useMemo(() => {
    const set = new Set(candidates.map((c) => c.recruiter));
    return Array.from(set).sort();
  }, [candidates]);

  // Filtered candidates by recruiter
  const filtered = useMemo(() => {
    if (selectedRecruiter === "all") return candidates;
    return candidates.filter((c) => c.recruiter === selectedRecruiter);
  }, [candidates, selectedRecruiter]);

  const interviewCandidates = filtered.filter((c) => c.stage === "interview");
  const terminatedCandidates = filtered.filter((c) => c.stage === "terminated");
  const approvedCandidates = filtered.filter((c) => c.stage === "approved" && c.salary);

  const stageCounts = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: filtered.filter((c) => c.stage === stage.id).length,
  }));

  const stats = [
    { label: "Candidatos Ativos", value: filtered.length, icon: Users, color: "text-primary" },
    { label: "Vagas Abertas", value: jobs.filter((j) => j.status === "open").length, icon: Briefcase, color: "text-info" },
    { label: "Em Entrevista", value: interviewCandidates.length, icon: Calendar, color: "text-accent-foreground" },
    { label: "Desligados", value: terminatedCandidates.length, icon: UserMinus, color: "text-destructive" },
    { label: "Candidatos Novos", value: filtered.filter((c) => c.stage === "new").length, icon: UserPlus, color: "text-primary" },
  ];

  const recentCandidates = filtered.filter((c) => c.stage === "new").slice(0, 5);

  // Payroll data for chart
  const payrollByRecruiter = useMemo(() => {
    const data: Record<string, { name: string; total: number; count: number }> = {};
    const allWithSalary = candidates.filter((c) => c.salary && (c.stage === "approved" || c.stage === "terminated"));
    allWithSalary.forEach((c) => {
      if (!data[c.recruiter]) data[c.recruiter] = { name: c.recruiter, total: 0, count: 0 };
      data[c.recruiter].total += c.salary!;
      data[c.recruiter].count += 1;
    });
    return Object.values(data);
  }, [candidates]);

  // Interview stats per recruiter for chart
  const interviewsByRecruiter = useMemo(() => {
    const data: Record<string, { name: string; entrevistas: number; aprovados: number; desligados: number }> = {};
    recruiters.forEach((r) => {
      data[r] = { name: r, entrevistas: 0, aprovados: 0, desligados: 0 };
    });
    candidates.forEach((c) => {
      if (data[c.recruiter]) {
        if (c.stage === "interview") data[c.recruiter].entrevistas += 1;
        if (c.stage === "approved") data[c.recruiter].aprovados += 1;
        if (c.stage === "terminated") data[c.recruiter].desligados += 1;
      }
    });
    return Object.values(data);
  }, [candidates, recruiters]);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral do seu recrutamento</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedRecruiter} onValueChange={setSelectedRecruiter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Recrutador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {recruiters.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AddCandidateDialog onAdd={addCandidate} jobs={jobTitles} />
        </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
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

      {/* Recruiter Performance Chart */}
      <div className="stat-card">
        <h2 className="font-semibold mb-4">Desempenho por Recrutador</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={interviewsByRecruiter} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="entrevistas" name="Entrevistas" fill="hsl(270, 60%, 52%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="aprovados" name="Aprovados" fill="hsl(152, 60%, 36%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="desligados" name="Desligados" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminated Employees */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-destructive" />
              <h2 className="font-semibold">Desligados</h2>
            </div>
            <span className="text-sm font-bold text-destructive">{terminatedCandidates.length}</span>
          </div>
          <div className="space-y-3">
            {terminatedCandidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum desligamento registrado.</p>
            ) : (
              terminatedCandidates.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-sm font-semibold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.position} · {c.recruiter}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {c.terminationDate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.terminationDate).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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
      </div>

      {/* Payroll Comparison Table */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Folha de Pagamento — Comparação Mensal</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payroll Table */}
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Recrutador</TableHead>
                  <TableHead className="text-right">Salário (R$)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates
                  .filter((c) => c.salary && (c.stage === "approved" || c.stage === "terminated"))
                  .map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.position}</TableCell>
                      <TableCell className="text-muted-foreground">{c.recruiter}</TableCell>
                      <TableCell className="text-right font-medium">
                        {c.salary!.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.stage === "approved"
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}>
                          {c.stage === "approved" ? "Ativo" : "Desligado"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                {/* Totals */}
                <TableRow className="border-t-2">
                  <TableCell colSpan={3} className="font-bold">Total Folha Ativa</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {candidates
                      .filter((c) => c.salary && c.stage === "approved")
                      .reduce((sum, c) => sum + (c.salary || 0), 0)
                      .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Payroll Chart */}
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollByRecruiter} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(value: number) => [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Total"]}
                />
                <Bar dataKey="total" name="Custo Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {jobs.filter((j) => j.status === "open").slice(0, 6).map((job) => (
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
  );
};

export default Dashboard;

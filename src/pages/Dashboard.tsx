import { useState, useMemo } from "react";
import { Users, Briefcase, Calendar, UserPlus, ArrowRight, UserMinus, DollarSign, Filter, Plus, Trash2, Pencil, Check, X, CalendarDays } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { PIPELINE_STAGES } from "@/data/mockData";
import { getTeamMembers } from "@/hooks/useTeamMembers";
import { Link } from "react-router-dom";
import AddCandidateDialog from "@/components/AddCandidateDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Build a list of year-month options from the data + always include current month */
function buildMonthOptions(candidates: { createdAt?: string; hireDate?: string; terminationDate?: string }[], jobs: { createdAt: string }[]) {
  const set = new Set<string>();
  const now = new Date();
  set.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

  candidates.forEach((c) => {
    [c.createdAt, c.hireDate, c.terminationDate].forEach((d) => {
      if (d) set.add(d.slice(0, 7));
    });
  });
  jobs.forEach((j) => {
    if (j.createdAt) set.add(j.createdAt.slice(0, 7));
  });

  return Array.from(set)
    .sort()
    .reverse()
    .map((key) => {
      const [y, m] = key.split("-");
      return { value: key, label: `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}` };
    });
}

/** Check if a date string (YYYY-MM-DD) belongs to a year-month key (YYYY-MM) */
function isInMonth(dateStr: string | undefined, monthKey: string): boolean {
  if (!dateStr) return false;
  return dateStr.startsWith(monthKey);
}

const Dashboard = () => {
  const { candidates, jobs, jobTitles, addCandidate, updateCandidate, deleteCandidate } = useAppContext();

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  // Connect recruiters to team members
  const recruiters = useMemo(() => {
    const members = getTeamMembers();
    return members.filter((m) => m.status === "ativo").map((m) => m.name).sort();
  }, []);

  // Month options derived from all data
  const monthOptions = useMemo(() => buildMonthOptions(candidates, jobs), [candidates, jobs]);

  // --- Desligados dialog state ---
  const [addTermOpen, setAddTermOpen] = useState(false);
  const [termCandidateId, setTermCandidateId] = useState("");
  const [termDate, setTermDate] = useState(new Date().toISOString().split("T")[0]);

  // --- Payroll edit state ---
  const [editingPayroll, setEditingPayroll] = useState<string | null>(null);
  const [editSalary, setEditSalary] = useState("");

  // ===== CORE FILTERED DATA =====
  // Step 1: Filter by recruiter
  const byRecruiter = useMemo(() => {
    if (selectedRecruiter === "all") return candidates;
    return candidates.filter((c) => c.recruiter === selectedRecruiter);
  }, [candidates, selectedRecruiter]);

  // Step 2: Filter by month — candidates whose createdAt falls in selected month
  const filtered = useMemo(() => {
    return byRecruiter.filter((c) => isInMonth(c.createdAt, selectedMonth));
  }, [byRecruiter, selectedMonth]);

  // Jobs filtered by month (createdAt)
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => isInMonth(j.createdAt, selectedMonth));
  }, [jobs, selectedMonth]);

  // Terminated in selected month (by terminationDate)
  const terminatedInMonth = useMemo(() => {
    return byRecruiter.filter((c) => c.stage === "terminated" && isInMonth(c.terminationDate, selectedMonth));
  }, [byRecruiter, selectedMonth]);

  // Hired (approved) in selected month (by hireDate)
  const hiredInMonth = useMemo(() => {
    return byRecruiter.filter((c) => c.stage === "approved" && isInMonth(c.hireDate, selectedMonth));
  }, [byRecruiter, selectedMonth]);

  // Payroll: active employees (approved) with salary who were hired on or before end of selected month
  const payrollInMonth = useMemo(() => {
    const endOfMonth = `${selectedMonth}-31`;
    return byRecruiter.filter((c) => {
      if (!c.salary) return false;
      if (c.stage === "approved" && c.hireDate && c.hireDate <= endOfMonth) return true;
      if (c.stage === "terminated" && c.hireDate && c.hireDate <= endOfMonth && c.terminationDate && c.terminationDate >= `${selectedMonth}-01`) return true;
      return false;
    });
  }, [byRecruiter, selectedMonth]);

  const interviewCandidates = filtered.filter((c) => c.stage === "interview");

  const stageCounts = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: filtered.filter((c) => c.stage === stage.id).length,
  }));

  const stats = [
    { label: "Candidatos no Mês", value: filtered.length, icon: Users, color: "text-primary" },
    { label: "Vagas Abertas", value: filteredJobs.filter((j) => j.status === "open").length, icon: Briefcase, color: "text-info" },
    { label: "Em Entrevista", value: interviewCandidates.length, icon: Calendar, color: "text-accent-foreground" },
    { label: "Desligados no Mês", value: terminatedInMonth.length, icon: UserMinus, color: "text-destructive" },
    { label: "Contratados no Mês", value: hiredInMonth.length, icon: UserPlus, color: "text-primary" },
  ];

  const recentCandidates = filtered.filter((c) => c.stage === "new").slice(0, 5);

  // Candidates eligible to be marked as terminated (approved only)
  const eligibleForTermination = candidates.filter((c) => c.stage === "approved");

  const handleAddTerminated = () => {
    if (!termCandidateId) {
      toast.error("Selecione um colaborador");
      return;
    }
    updateCandidate(termCandidateId, { stage: "terminated", terminationDate: termDate });
    toast.success("Colaborador marcado como desligado");
    setAddTermOpen(false);
    setTermCandidateId("");
  };

  const handleRemoveTerminated = (id: string) => {
    deleteCandidate(id);
    toast.success("Desligado removido da lista");
  };

  const handleSavePayroll = (id: string) => {
    const value = parseFloat(editSalary.replace(/[^\d.,]/g, "").replace(",", "."));
    if (isNaN(value)) {
      toast.error("Valor inválido");
      return;
    }
    updateCandidate(id, { salary: value });
    setEditingPayroll(null);
    toast.success("Salário atualizado");
  };

  // Payroll data for chart
  const payrollByRecruiter = useMemo(() => {
    const data: Record<string, { name: string; total: number; count: number }> = {};
    payrollInMonth.forEach((c) => {
      if (!data[c.recruiter]) data[c.recruiter] = { name: c.recruiter, total: 0, count: 0 };
      data[c.recruiter].total += c.salary!;
      data[c.recruiter].count += 1;
    });
    return Object.values(data);
  }, [payrollInMonth]);

  // Interview stats per recruiter for chart (filtered by month)
  const interviewsByRecruiter = useMemo(() => {
    const data: Record<string, { name: string; entrevistas: number; aprovados: number; desligados: number }> = {};
    recruiters.forEach((r) => {
      data[r] = { name: r, entrevistas: 0, aprovados: 0, desligados: 0 };
    });
    filtered.forEach((c) => {
      if (data[c.recruiter]) {
        if (c.stage === "interview") data[c.recruiter].entrevistas += 1;
        if (c.stage === "approved") data[c.recruiter].aprovados += 1;
        if (c.stage === "terminated") data[c.recruiter].desligados += 1;
      }
    });
    return Object.values(data);
  }, [filtered, recruiters]);

  // Total active payroll for selected month
  const totalActivePayroll = payrollInMonth
    .filter((c) => c.stage === "approved")
    .reduce((sum, c) => sum + (c.salary || 0), 0);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral do seu recrutamento</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Monthly Filter */}
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Recruiter Filter */}
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
        {/* Terminated Employees - with Add/Remove */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-destructive" />
              <h2 className="font-semibold">Desligados</h2>
              <span className="text-sm font-bold text-destructive">({terminatedInMonth.length})</span>
            </div>
            <Dialog open={addTermOpen} onOpenChange={setAddTermOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Desligamento</DialogTitle>
                  <DialogDescription>Selecione um colaborador ativo para marcar como desligado.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <Select value={termCandidateId} onValueChange={setTermCandidateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleForTermination.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} — {c.position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Data de Desligamento</label>
                    <Input type="date" value={termDate} onChange={(e) => setTermDate(e.target.value)} />
                  </div>
                  <Button className="w-full" variant="destructive" onClick={handleAddTerminated}>
                    Confirmar Desligamento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3 max-h-[320px] overflow-auto">
            {terminatedInMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum desligamento neste mês.</p>
            ) : (
              terminatedInMonth.map((c) => (
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
                  <div className="flex items-center gap-2">
                    {c.terminationDate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.terminationDate).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover desligado</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remover <strong>{c.name}</strong> da lista de desligados? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveTerminated(c.id)}>Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
              <p className="text-sm text-muted-foreground">Nenhum candidato novo neste mês.</p>
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

      {/* Payroll Comparison Table - Editable */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Folha de Pagamento — {monthOptions.find((o) => o.value === selectedMonth)?.label || selectedMonth}</h2>
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
                  <TableHead className="w-[60px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollInMonth.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.position}</TableCell>
                    <TableCell className="text-muted-foreground">{c.recruiter}</TableCell>
                    <TableCell className="text-right">
                      {editingPayroll === c.id ? (
                        <Input
                          className="w-[120px] ml-auto text-right h-8"
                          value={editSalary}
                          onChange={(e) => setEditSalary(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSavePayroll(c.id)}
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium">
                          {c.salary!.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      )}
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
                    <TableCell>
                      {editingPayroll === c.id ? (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => handleSavePayroll(c.id)}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingPayroll(null)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => { setEditingPayroll(c.id); setEditSalary(String(c.salary || "")); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {payrollInMonth.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      Nenhum registro de folha para este mês.
                    </TableCell>
                  </TableRow>
                )}
                {/* Totals */}
                <TableRow className="border-t-2">
                  <TableCell colSpan={3} className="font-bold">Total Folha Ativa</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {totalActivePayroll.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell colSpan={2} />
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
          {filteredJobs.filter((j) => j.status === "open").slice(0, 6).map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">{job.title}</p>
                <p className="text-xs text-muted-foreground">{job.department} · {job.location}</p>
              </div>
              <span className="text-xs font-medium text-primary">{job.candidates} candidatos</span>
            </div>
          ))}
          {filteredJobs.filter((j) => j.status === "open").length === 0 && (
            <p className="text-sm text-muted-foreground col-span-2">Nenhuma vaga aberta neste mês.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

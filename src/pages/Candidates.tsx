import { useState } from "react";
import { Search, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PIPELINE_STAGES, TERMINATION_REASONS } from "@/data/mockData";
import { useAppContext } from "@/contexts/AppContext";
import AddCandidateDialog from "@/components/AddCandidateDialog";
import CandidateDetailDialog from "@/components/CandidateDetailDialog";
import { type Candidate } from "@/data/mockData";

const Candidates = () => {
  const { candidates, jobTitles, addCandidate, updateCandidateStage, addNoteToCandidate, deleteCandidate, updateCandidate } = useAppContext();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const activeCandidates = candidates.filter((c) => c.stage !== "terminated");
  const terminated = candidates.filter((c) => c.stage === "terminated");

  const filteredActive = activeCandidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.position.toLowerCase().includes(search.toLowerCase());
    const matchesStage = !stageFilter || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const filteredTerminated = terminated.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.position.toLowerCase().includes(search.toLowerCase());
    const matchesReason = reasonFilter === "all" || c.terminationReason === reasonFilter;
    return matchesSearch && matchesReason;
  });

  const stageCounts = PIPELINE_STAGES
    .filter((s) => s.id !== "terminated")
    .map((stage) => ({ ...stage, count: activeCandidates.filter((c) => c.stage === stage.id).length }));

  const getStageLabel = (stageId: string) => PIPELINE_STAGES.find((s) => s.id === stageId)?.label ?? stageId;
  const getStageColor = (stageId: string) => PIPELINE_STAGES.find((s) => s.id === stageId)?.color ?? "hsl(0,0%,50%)";

  const openDetail = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidatos</h1>
          <p className="text-muted-foreground text-sm mt-1">{candidates.length} candidatos cadastrados</p>
        </div>
        <AddCandidateDialog onAdd={addCandidate} jobs={jobTitles} />
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline ({activeCandidates.length})</TabsTrigger>
          <TabsTrigger value="terminated">Desligados ({terminated.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setStageFilter(null)}
              className={`rounded-lg border p-3 text-center transition-colors ${!stageFilter ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
            >
              <p className="text-xs font-medium text-muted-foreground">Todos</p>
              <p className="text-xl font-bold">{activeCandidates.length}</p>
            </button>
            {stageCounts.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setStageFilter(stageFilter === stage.id ? null : stage.id)}
                className={`rounded-lg border p-3 text-center transition-colors ${stageFilter === stage.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-xs font-medium text-muted-foreground">{stage.label}</span>
                </div>
                <p className="text-xl font-bold">{stage.count}</p>
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar candidatos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Nome</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Vaga</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Contato</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Etapa</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Origem</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Recrutador</th>
                </tr>
              </thead>
              <tbody>
                {filteredActive.map((c) => (
                  <tr key={c.id} onClick={() => openDetail(c)} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {c.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.position}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{c.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-xs font-medium px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${getStageColor(c.stage)}15`, color: getStageColor(c.stage) }}>
                        {getStageLabel(c.stage)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.origin}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.recruiter}</td>
                  </tr>
                ))}
                {filteredActive.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum candidato encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="terminated" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar desligados..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-full md:w-72"><SelectValue placeholder="Filtrar por motivo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os motivos</SelectItem>
                {TERMINATION_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Nome</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Vaga</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Data Desligamento</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Motivo do desligamento</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTerminated.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 cursor-pointer" onClick={() => openDetail(c)}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                          {c.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.position}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {c.terminationDate ? new Date(c.terminationDate).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={c.terminationReason ?? ""}
                        onValueChange={(v) => updateCandidate(c.id, { terminationReason: v })}
                      >
                        <SelectTrigger className="h-9 w-72 text-xs">
                          <SelectValue placeholder="Selecionar motivo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {TERMINATION_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openDetail(c)} className="text-xs text-primary hover:underline">Ver perfil</button>
                    </td>
                  </tr>
                ))}
                {filteredTerminated.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhum desligado encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <CandidateDetailDialog
        candidate={selectedCandidate ? candidates.find(c => c.id === selectedCandidate.id) || selectedCandidate : null}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdateStage={updateCandidateStage}
        onAddNote={addNoteToCandidate}
        onDelete={deleteCandidate}
      />
    </div>
  );
};

export default Candidates;

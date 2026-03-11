import { useState } from "react";
import { Search, Plus, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockCandidates, PIPELINE_STAGES } from "@/data/mockData";

const Candidates = () => {
  const [search, setSearch] = useState("");
  const filtered = mockCandidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.position.toLowerCase().includes(search.toLowerCase())
  );

  const getStageLabel = (stageId: string) =>
    PIPELINE_STAGES.find((s) => s.id === stageId)?.label ?? stageId;
  const getStageColor = (stageId: string) =>
    PIPELINE_STAGES.find((s) => s.id === stageId)?.color ?? "hsl(0,0%,50%)";

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidatos</h1>
          <p className="text-muted-foreground text-sm mt-1">{mockCandidates.length} candidatos cadastrados</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" /> Novo Candidato
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar candidatos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
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
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
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
                  <span
                    className="inline-block text-xs font-medium px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${getStageColor(c.stage)}15`,
                      color: getStageColor(c.stage),
                    }}
                  >
                    {getStageLabel(c.stage)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.origin}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.recruiter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Candidates;

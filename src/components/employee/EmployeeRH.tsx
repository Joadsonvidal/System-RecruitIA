import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileUp, Loader2, FileText, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const EmployeeRH = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [requests, setRequests] = useState<any[]>([]); // mock array for now

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return toast.error("Selecione o tipo de solicitação.");
    if (type === "atestado" && !file) return toast.error("Anexe a foto do atestado.");
    
    setLoading(true);
    // Simulating upload and insert
    setTimeout(() => {
      toast.success("Solicitação enviada com sucesso ao RH!");
      setRequests([{
        id: Math.random().toString(),
        type: type,
        status: "pendente",
        date: new Date().toLocaleDateString('pt-BR')
      }, ...requests]);
      setType("");
      setDesc("");
      setFile(null);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-5 border-primary/20 shadow-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
          <FileText className="h-5 w-5" /> Nova Solicitação ao RH
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo de Solicitação</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atestado">Atestado Médico / Declaração</SelectItem>
                <SelectItem value="ferias">Agendamento de Férias</SelectItem>
                <SelectItem value="adiantamento">Adiantamento Salarial</SelectItem>
                <SelectItem value="outro">Outros / Dúvidas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Detalhes / Observações</Label>
            <Textarea 
              value={desc} onChange={(e) => setDesc(e.target.value)}
              placeholder="Descreva sua solicitação ou justifique..." 
              className="resize-none h-20"
            />
          </div>

          {(type === "atestado" || type === "outro") && (
            <div className="space-y-1.5">
              <Label>Anexo (Foto ou PDF)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:font-medium text-muted-foreground cursor-pointer"
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileUp className="h-4 w-4 mr-2" />}
            {loading ? "Enviando..." : "Enviar para o RH"}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground px-1">Minhas Solicitações Recentes</h3>
        {requests.length === 0 ? (
          <Card className="p-4 text-center border-dashed bg-muted/30">
            <p className="text-xs text-muted-foreground">Você não possui solicitações abertas.</p>
          </Card>
        ) : (
          requests.map(req => (
            <Card key={req.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium capitalize">{req.type}</p>
                <p className="text-[11px] text-muted-foreground">{req.date}</p>
              </div>
              <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-[10px] font-medium border border-amber-200">
                <Clock className="h-3 w-3" /> Em Análise
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

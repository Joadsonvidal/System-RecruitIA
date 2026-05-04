import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, User, MapPin, FileText, MessageSquare, Trash2, CalendarClock, Copy } from "lucide-react";
import { type Candidate, PIPELINE_STAGES } from "@/data/mockData";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface CandidateDetailDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStage: (id: string, stage: string) => void;
  onAddNote: (id: string, note: string) => void;
  onDelete?: (id: string) => void;
}

const CandidateDetailDialog = ({ candidate, open, onOpenChange, onUpdateStage, onAddNote, onDelete }: CandidateDetailDialogProps) => {
  const [newNote, setNewNote] = useState("");

  if (!candidate) return null;

  const stage = PIPELINE_STAGES.find((s) => s.id === candidate.stage);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onAddNote(candidate.id, newNote);
    setNewNote("");
    toast({ title: "Nota adicionada", description: "A nota foi salva com sucesso." });
  };

  const handleStageChange = (newStage: string) => {
    onUpdateStage(candidate.id, newStage);
    toast({ title: "Etapa atualizada", description: `${candidate.name} movido para ${PIPELINE_STAGES.find(s => s.id === newStage)?.label}` });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(candidate.id);
      onOpenChange(false);
      toast({ title: "Candidato excluído", description: `${candidate.name} foi removido.` });
    }
  };

  const handleGenerateScheduleLink = () => {
    const link = `${window.location.origin}/agendar/${candidate.id.substring(0,8)}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link gerado e copiado!", description: `Envie este link no WhatsApp do candidato: ${link}` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
              {candidate.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p>{candidate.name}</p>
              <p className="text-sm font-normal text-muted-foreground">{candidate.position}</p>
            </div>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir candidato?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir {candidate.name}? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Recrutador: {candidate.recruiter}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Origem: {candidate.origin}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Etapa:</span>
            <Select value={candidate.stage} onValueChange={handleStageChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {candidate.score && (
              <Badge variant="secondary">Score: {candidate.score}</Badge>
            )}
            
            <div className="ml-auto">
              <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/10" onClick={handleGenerateScheduleLink}>
                <CalendarClock className="h-4 w-4 mr-2" />
                Link de Agendamento
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Notas
            </p>
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{candidate.notes}</p>
            <div className="flex gap-2">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Adicionar nova nota..."
                className="min-h-[60px]"
              />
            </div>
            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
              <MessageSquare className="h-3.5 w-3.5 mr-1" /> Adicionar Nota
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">Última interação: {candidate.lastInteraction}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailDialog;

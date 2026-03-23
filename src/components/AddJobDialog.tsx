import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { type Job } from "@/data/mockData";
import { getActiveRecruiters } from "@/hooks/useTeamMembers";

interface AddJobDialogProps {
  onAdd: (job: Job) => void;
  trigger?: React.ReactNode;
}

const AddJobDialog = ({ onAdd, trigger }: AddJobDialogProps) => {
  const [open, setOpen] = useState(false);
  const [recruiters, setRecruiters] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", department: "", location: "Remoto", recruiter: "",
  });

  useEffect(() => {
    if (open) {
      const active = getActiveRecruiters();
      setRecruiters(active);
      if (active.length > 0 && !form.recruiter) {
        setForm((f) => ({ ...f, recruiter: active[0] }));
      }
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.department) return;
    const newJob: Job = {
      id: Date.now().toString(),
      ...form,
      status: "open",
      candidates: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    onAdd(newJob);
    setForm({ title: "", department: "", location: "Remoto", recruiter: recruiters[0] || "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button><Plus className="h-4 w-4 mr-1" /> Nova Vaga</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Vaga</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título da Vaga *</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Desenvolvedor Front-end" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="department">Departamento *</Label>
            <Input id="department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Ex: Tecnologia" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Localização</Label>
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Remoto", "São Paulo", "Rio de Janeiro", "Híbrido"].map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Recrutador</Label>
              <Select value={form.recruiter} onValueChange={(v) => setForm({ ...form, recruiter: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {recruiters.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar Vaga</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJobDialog;

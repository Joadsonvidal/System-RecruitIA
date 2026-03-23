import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { type TeamMember, getTeamMembers } from "@/hooks/useTeamMembers";

const STORAGE_KEY = "zr_team_members";

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  recrutador: "bg-primary/10 text-primary",
  visualizador: "bg-muted text-muted-foreground",
};

const SettingsUsersPage = () => {
  const [members, setMembers] = useState<TeamMember[]>(getTeamMembers);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("recrutador");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  const addMember = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Preencha nome e email");
      return;
    }
    setMembers((prev) => [
      { id: Date.now().toString(), name: name.trim(), email: email.trim(), role, status: "ativo" },
      ...prev,
    ]);
    setName("");
    setEmail("");
    setRole("recrutador");
    setOpen(false);
    toast.success("Membro adicionado com sucesso!");
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success("Membro removido");
  };

  const toggleStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === "ativo" ? "inativo" : "ativo" } : m
      )
    );
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center gap-3">
        <Link to="/settings">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground text-sm">Gerencie os membros da sua equipe</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Membro</DialogTitle>
              <DialogDescription>Adicione um membro à sua equipe</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value as TeamMember["role"])}>
                <option value="admin">Admin</option>
                <option value="recrutador">Recrutador</option>
                <option value="visualizador">Visualizador</option>
              </select>
              <Button className="w-full" onClick={addMember}>Adicionar Membro</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="stat-card flex items-center gap-4">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {m.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.name}</p>
              <p className="text-xs text-muted-foreground truncate">{m.email}</p>
            </div>
            <Badge variant="outline" className={roleColors[m.role]}>{m.role}</Badge>
            <Badge
              variant={m.status === "ativo" ? "default" : "secondary"}
              className="text-xs cursor-pointer"
              onClick={() => toggleStatus(m.id)}
            >
              {m.status}
            </Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover membro</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover <strong>{m.name}</strong> da equipe? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => removeMember(m.id)}>Remover</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsUsersPage;

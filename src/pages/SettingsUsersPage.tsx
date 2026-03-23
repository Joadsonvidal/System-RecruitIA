import { Link } from "react-router-dom";
import { ArrowLeft, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "recrutador" | "visualizador";
  status: "ativo" | "inativo";
}

const initialMembers: TeamMember[] = [
  { id: "1", name: "Ana Silva", email: "ana@empresa.com", role: "admin", status: "ativo" },
  { id: "2", name: "Carlos Lima", email: "carlos@empresa.com", role: "recrutador", status: "ativo" },
  { id: "3", name: "Maria Santos", email: "maria@empresa.com", role: "visualizador", status: "inativo" },
];

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  recrutador: "bg-primary/10 text-primary",
  visualizador: "bg-muted text-muted-foreground",
};

const SettingsUsersPage = () => {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("recrutador");

  const addMember = () => {
    if (!name.trim() || !email.trim()) return;
    setMembers((prev) => [
      { id: Date.now().toString(), name: name.trim(), email: email.trim(), role, status: "ativo" },
      ...prev,
    ]);
    setName("");
    setEmail("");
    setRole("recrutador");
    setOpen(false);
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
            <Badge variant={m.status === "ativo" ? "default" : "secondary"} className="text-xs">{m.status}</Badge>
            <Button variant="ghost" size="icon" onClick={() => toggleStatus(m.id)}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsUsersPage;

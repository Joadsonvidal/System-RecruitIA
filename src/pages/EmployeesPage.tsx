import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees, type Employee } from "@/hooks/useEmployees";
import { Plus, Search, FileUp, FileText, Trash2, Mail, Phone, Briefcase, Building2, Calendar } from "lucide-react";
import { toast } from "sonner";

const EmployeesPage = () => {
  const { employees, addEmployee, deleteEmployee, uploadResume, getResumeUrl } = useEmployees();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [emailFilter, setEmailFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Employee>>({ status: "ativo" });
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const departments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department).filter(Boolean) as string[]);
    return Array.from(set);
  }, [employees]);

  const filtered = employees.filter((e) => {
    const matchName = !search || e.name.toLowerCase().includes(search.toLowerCase());
    const matchEmail = !emailFilter || (e.email ?? "").toLowerCase().includes(emailFilter.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    return matchName && matchEmail && matchDept;
  });

  const handleSubmit = async () => {
    if (!form.name?.trim()) return toast.error("Nome é obrigatório.");
    await addEmployee(form);
    setForm({ status: "ativo" });
    setOpen(false);
  };

  const handleFile = async (id: string, file: File | null) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("Arquivo máximo: 10MB");
    await uploadResume(id, file);
  };

  const viewResume = async (path: string) => {
    const url = await getResumeUrl(path);
    if (url) window.open(url, "_blank");
    else toast.error("Não foi possível abrir o currículo.");
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Colaboradores</h1>
          <p className="text-sm text-muted-foreground mt-1">{employees.length} colaboradores cadastrados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Adicionar colaborador</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo colaborador</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Nome *</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Telefone</Label><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cargo</Label><Input value={form.role ?? ""} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
                <div><Label>Área / Departamento</Label><Input value={form.department ?? ""} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Data de admissão</Label><Input type="date" value={form.hire_date ?? ""} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status ?? "ativo"} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="ferias">Férias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Observações</Label><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={handleSubmit}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filtrar por email..." value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} className="pl-9" />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger><SelectValue placeholder="Filtrar por área" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as áreas</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground col-span-full">
            Nenhum colaborador encontrado.
          </Card>
        )}
        {filtered.map((e) => (
          <Card key={e.id} className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold shrink-0">
                {e.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{e.name}</p>
                {e.role && <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><Briefcase className="h-3 w-3" /> {e.role}</p>}
                {e.department && <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><Building2 className="h-3 w-3" /> {e.department}</p>}
              </div>
              <Badge variant={e.status === "ativo" ? "secondary" : "outline"} className="text-xs">{e.status}</Badge>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground border-t pt-2">
              {e.email && <p className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3" /> {e.email}</p>}
              {e.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {e.phone}</p>}
              {e.hire_date && <p className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Admissão: {new Date(e.hire_date).toLocaleDateString("pt-BR")}</p>}
            </div>

            <div className="flex items-center gap-2 border-t pt-2">
              <input
                ref={(el) => { fileInputs.current[e.id] = el; }}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(ev) => handleFile(e.id, ev.target.files?.[0] ?? null)}
              />
              {e.resume_url ? (
                <Button size="sm" variant="outline" className="flex-1" onClick={() => viewResume(e.resume_url!)}>
                  <FileText className="h-4 w-4 mr-1" /> Ver currículo
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="flex-1" onClick={() => fileInputs.current[e.id]?.click()}>
                  <FileUp className="h-4 w-4 mr-1" /> Enviar currículo
                </Button>
              )}
              {e.resume_url && (
                <Button size="sm" variant="ghost" onClick={() => fileInputs.current[e.id]?.click()} title="Substituir">
                  <FileUp className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => deleteEmployee(e.id)} title="Remover">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmployeesPage;

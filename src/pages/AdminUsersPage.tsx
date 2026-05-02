import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ban, Check, KeyRound, Trash2, ShieldCheck, Users, UserX, UserPlus } from "lucide-react";
import { toast } from "sonner";

type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  status: string;
  created_at: string;
};

type AuditRow = {
  id: string;
  admin_email: string | null;
  target_email: string | null;
  action: string;
  created_at: string;
};

type Action = "block" | "unblock" | "delete" | "reset_password";

const actionLabel: Record<Action, string> = {
  block: "Bloquear",
  unblock: "Desbloquear",
  delete: "Excluir permanentemente",
  reset_password: "Enviar reset de senha",
};

const AdminUsersPage = () => {
  const { session } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<{ user: Profile; action: Action } | null>(null);
  const [working, setWorking] = useState(false);

  const load = async () => {
    const [{ data: pf }, { data: au }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setProfiles((pf as Profile[]) ?? []);
    setAudit((au as AuditRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profiles.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (p.email ?? "").toLowerCase().includes(q) || (p.display_name ?? "").toLowerCase().includes(q);
    });
  }, [profiles, search, statusFilter]);

  const stats = useMemo(() => {
    const total = profiles.length;
    const ativos = profiles.filter((p) => p.status === "ativo").length;
    const bloqueados = profiles.filter((p) => p.status === "bloqueado").length;
    const novosMes = profiles.filter((p) => {
      const d = new Date(p.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total, ativos, bloqueados, novosMes };
  }, [profiles]);

  const runAction = async () => {
    if (!pending || !session) return;
    setWorking(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-user", {
        body: { action: pending.action, target_user_id: pending.user.user_id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Ação executada com sucesso!");
      if (pending.action === "reset_password" && (data as any)?.action_link) {
        toast.info("Link de recuperação gerado e enviado por e-mail.");
      }
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao executar ação");
    } finally {
      setWorking(false);
      setPending(null);
    }
  };

  const fmtDate = (s: string) => new Date(s).toLocaleString("pt-BR");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Painel Super Admin</h1>
          <p className="text-sm text-muted-foreground">Gestão de todas as contas do sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total de contas" value={stats.total} />
        <StatCard icon={<Check className="h-5 w-5 text-green-600" />} label="Ativas" value={stats.ativos} />
        <StatCard icon={<UserX className="h-5 w-5 text-red-600" />} label="Bloqueadas" value={stats.bloqueados} />
        <StatCard icon={<UserPlus className="h-5 w-5 text-blue-600" />} label="Novas no mês" value={stats.novosMes} />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Contas</TabsTrigger>
          <TabsTrigger value="audit">Histórico de ações</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="bloqueado">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Carregando...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma conta encontrada</TableCell></TableRow>
                ) : filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.display_name ?? "—"}</TableCell>
                    <TableCell>{p.email ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(p.created_at)}</TableCell>
                    <TableCell>
                      {p.status === "ativo" ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Ativo</Badge>
                      ) : (
                        <Badge variant="destructive">Bloqueado</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {p.status === "ativo" ? (
                        <Button size="sm" variant="outline" onClick={() => setPending({ user: p, action: "block" })}>
                          <Ban className="h-4 w-4 mr-1" /> Bloquear
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setPending({ user: p, action: "unblock" })}>
                          <Check className="h-4 w-4 mr-1" /> Desbloquear
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setPending({ user: p, action: "reset_password" })}>
                        <KeyRound className="h-4 w-4 mr-1" /> Reset senha
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setPending({ user: p, action: "delete" })}>
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Alvo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma ação registrada ainda</TableCell></TableRow>
                ) : audit.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm">{fmtDate(a.created_at)}</TableCell>
                    <TableCell>{a.admin_email ?? "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{actionLabel[a.action as Action] ?? a.action}</Badge></TableCell>
                    <TableCell>{a.target_email ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && !working && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending && actionLabel[pending.action]} — {pending?.user.display_name ?? pending?.user.email}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.action === "delete" ? (
                <span className="text-destructive font-medium">
                  Esta ação é irreversível. Todos os dados desta conta (candidatos, vagas, batidas de ponto, colaboradores) serão apagados permanentemente.
                </span>
              ) : pending?.action === "block" ? (
                "O usuário não conseguirá mais fazer login até ser desbloqueado. Os dados ficam preservados."
              ) : pending?.action === "unblock" ? (
                "O usuário voltará a ter acesso normal ao sistema."
              ) : (
                "Um link de redefinição de senha será enviado para o e-mail do usuário."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); runAction(); }}
              disabled={working}
              className={pending?.action === "delete" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {working ? "Executando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <Card className="p-4">
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">{icon} {label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </Card>
);

export default AdminUsersPage;

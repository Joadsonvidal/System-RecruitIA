import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTimeClock } from "@/hooks/useTimeClock";
import { MapPin, Download, Loader2, AlertTriangle, CheckCircle2, FileDown, User, Megaphone, FileCheck, CalendarClock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { buildMonthlyTimeSheet, exportTimeSheetPDF, exportEntriesPDF } from "@/lib/timeSheet";

const TYPE_LABEL: Record<string, string> = {
  entrada: "1ª Entrada",
  saida_almoco: "1ª Saída",
  retorno_almoco: "2ª Entrada",
  saida: "2ª Saída",
};

const TimeClockAdminPage = () => {
  const { settings, entries, saveSettings, getSelfieSignedUrl } = useTimeClock();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [filterUser, setFilterUser] = useState("");
  const [openSelfie, setOpenSelfie] = useState<string | null>(null);
  const today = new Date();
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [announcements, setAnnouncements] = useState<any[]>([
    { id: "1", title: "Atualização da Carteirinha de Saúde", content: "Baixem o app da Unimed...", is_active: true, created_at: new Date().toISOString() }
  ]);
  const [requests, setRequests] = useState<any[]>([
    { id: "1", user_id: "user_123", type: "atestado", status: "pendente", description: "Gripe forte", created_at: new Date().toISOString() }
  ]);
  const [newAviso, setNewAviso] = useState({ title: "", content: "" });

  const usersList = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => map.set(e.user_id, (map.get(e.user_id) ?? 0) + 1));
    return Array.from(map.entries());
  }, [entries]);

  const sheetUserId = selectedUser || usersList[0]?.[0] || "";
  const sheetEntries = useMemo(
    () => entries.filter((e) => e.user_id === sheetUserId),
    [entries, sheetUserId],
  );
  const sheet = useMemo(
    () => buildMonthlyTimeSheet(sheetEntries, selectedYear, selectedMonth, {
      workdayStart: settings.workday_start,
      workdayEnd: settings.workday_end,
    }),
    [sheetEntries, selectedYear, selectedMonth, settings.workday_start, settings.workday_end],
  );

  // Keep form in sync when settings load
  useMemo(() => setForm(settings), [settings.id]);

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          office_latitude: pos.coords.latitude,
          office_longitude: pos.coords.longitude,
        }));
        toast.success("Localização capturada!");
      },
      () => toast.error("Não foi possível obter localização."),
      { enableHighAccuracy: true },
    );
  };

  const save = async () => {
    setSaving(true);
    const { error } = await saveSettings(form);
    setSaving(false);
    if (error) toast.error(error);
    else toast.success("Configurações salvas!");
  };

  const filtered = entries.filter((e) =>
    filterUser ? e.user_id.toLowerCase().includes(filterUser.toLowerCase()) : true,
  );

  const exportCsv = () => {
    const rows = [
      ["Data", "Hora", "Usuário", "Tipo", "Lat", "Lng", "Endereço", "No local", "Distância (m)"],
      ...filtered.map((e) => {
        const d = new Date(e.clocked_at);
        return [
          d.toLocaleDateString("pt-BR"),
          d.toLocaleTimeString("pt-BR"),
          e.user_id,
          e.entry_type,
          e.latitude ?? "",
          e.longitude ?? "",
          e.address ?? "",
          e.within_geofence ? "Sim" : "Não",
          e.distance_meters ?? "",
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ponto-${Date.now()}.csv`;
    a.click();
  };

  const exportEntriesPdf = () => {
    exportEntriesPDF({
      title: filterUser ? `Filtro: ${filterUser}` : "Todas as batidas",
      rows: filtered.map((e) => {
        const d = new Date(e.clocked_at);
        return {
          date: d.toLocaleDateString("pt-BR"),
          time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          user: e.user_id.slice(0, 8) + "…",
          type: TYPE_LABEL[e.entry_type] ?? e.entry_type,
          address: e.address ?? `${e.latitude}, ${e.longitude}`,
          geofence: e.within_geofence ? "Sim" : "Não",
          distance: e.distance_meters != null ? `${e.distance_meters}m` : "—",
        };
      }),
    });
  };

  const viewSelfie = async (path: string) => {
    const url = await getSelfieSignedUrl(path);
    if (url) window.open(url, "_blank");
    else toast.error("Não foi possível abrir a selfie.");
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Batedor de Ponto — Admin</h1>
        <p className="text-sm text-muted-foreground">
          Configure o local da empresa e veja todas as batidas dos colaboradores.
        </p>
      </div>

      <Tabs defaultValue="entries">
        <TabsList>
          <TabsTrigger value="entries">Batidas</TabsTrigger>
          <TabsTrigger value="sheet">Espelho de Ponto</TabsTrigger>
          <TabsTrigger value="rh_requests">Solicitações RH</TabsTrigger>
          <TabsTrigger value="mural_admin">Mural de Avisos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <Label htmlFor="filter">Filtrar por usuário (ID/email)</Label>
                <Input
                  id="filter"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  placeholder="user id..."
                />
              </div>
              <Button onClick={exportCsv} variant="outline">
                <Download className="h-4 w-4 mr-2" /> Exportar CSV
              </Button>
              <Button onClick={exportEntriesPdf} variant="outline">
                <FileDown className="h-4 w-4 mr-2" /> Exportar PDF (folha deitada)
              </Button>
            </div>
          </Card>

          <Card className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3">Data/Hora</th>
                  <th className="p-3">Usuário</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Local</th>
                  <th className="p-3">Geofence</th>
                  <th className="p-3">Selfie</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      Nenhuma batida registrada ainda.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => {
                    const d = new Date(e.clocked_at);
                    return (
                      <tr key={e.id} className="border-t">
                        <td className="p-3 tabular-nums">
                          {d.toLocaleDateString("pt-BR")}{" "}
                          {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="p-3 font-mono text-xs">{e.user_id.slice(0, 8)}…</td>
                        <td className="p-3">{TYPE_LABEL[e.entry_type] ?? e.entry_type}</td>
                        <td className="p-3 text-xs max-w-xs truncate" title={e.address ?? ""}>
                          {e.address || `${e.latitude}, ${e.longitude}`}
                        </td>
                        <td className="p-3">
                          {e.within_geofence ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" /> OK
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" /> {e.distance_meters}m
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {e.selfie_url ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewSelfie(e.selfie_url!)}
                            >
                              Ver
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="sheet" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <Label className="flex items-center gap-1"><User className="h-3 w-3" /> Colaborador</Label>
                <Select value={sheetUserId} onValueChange={setSelectedUser}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {usersList.map(([uid, count]) => (
                      <SelectItem key={uid} value={uid}>
                        {uid.slice(0, 8)}… ({count} batidas)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mês</Label>
                <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {new Date(2026, i, 1).toLocaleDateString("pt-BR", { month: "long" })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ano</Label>
                <Input
                  type="number"
                  className="w-28"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                />
              </div>
              <Button
                disabled={!sheetUserId}
                onClick={() =>
                  exportTimeSheetPDF({
                    employeeName: sheetUserId.slice(0, 8),
                    employeeEmail: sheetUserId,
                    monthLabel: new Date(selectedYear, selectedMonth, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
                    rows: sheet.rows,
                    totals: { credito: sheet.totalCredito, debito: sheet.totalDebito, saldo: sheet.saldoFinal },
                  })
                }
              >
                <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
              </Button>
            </div>
          </Card>

          {/* Totais do mês */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-4 border-emerald-200 bg-emerald-50">
              <p className="text-xs font-medium text-emerald-700">Créditos (horas extras)</p>
              <p className="text-2xl font-bold text-emerald-700 tabular-nums">
                {Math.floor(sheet.totalCredito / 60)}h{String(sheet.totalCredito % 60).padStart(2, "0")}
              </p>
            </Card>
            <Card className="p-4 border-destructive/30 bg-destructive/5">
              <p className="text-xs font-medium text-destructive">Débitos (horas faltantes)</p>
              <p className="text-2xl font-bold text-destructive tabular-nums">
                {Math.floor(sheet.totalDebito / 60)}h{String(sheet.totalDebito % 60).padStart(2, "0")}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Saldo final</p>
              <p className={`text-2xl font-bold tabular-nums ${sheet.saldoFinal >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                {sheet.saldoFinal < 0 ? "-" : ""}{Math.floor(Math.abs(sheet.saldoFinal) / 60)}h{String(Math.abs(sheet.saldoFinal) % 60).padStart(2, "0")}
              </p>
            </Card>
          </div>

          <Card className="p-0 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40">
                  <th colSpan={5} className="p-2 text-center border font-semibold">PONTOS</th>
                  <th colSpan={5} className="p-2 text-center border font-semibold">RESUMO DE JORNADA</th>
                  <th className="p-2 border"></th>
                </tr>
                <tr className="bg-muted/20 text-muted-foreground">
                  <th className="p-2 border text-left">DATA</th>
                  <th className="p-2 border">1ª ENTRADA</th>
                  <th className="p-2 border">1ª SAÍDA</th>
                  <th className="p-2 border">2ª ENTRADA</th>
                  <th className="p-2 border">2ª SAÍDA</th>
                  <th className="p-2 border">CRÉDITO</th>
                  <th className="p-2 border">DÉBITO</th>
                  <th className="p-2 border">HORA INTERV.</th>
                  <th className="p-2 border">HORA TRAB.</th>
                  <th className="p-2 border">SALDO</th>
                  <th className="p-2 border text-left">OBS</th>
                </tr>
              </thead>
              <tbody>
                {sheet.rows.map((r, i) => (
                  <tr
                    key={i}
                    className={`tabular-nums ${r.isWeekend ? "bg-muted/20" : ""} ${r.hasIssue ? "bg-amber-50" : ""}`}
                  >
                    <td className="p-2 border whitespace-nowrap">{r.weekday}</td>
                    <td className="p-2 border text-center">{r.ent1}</td>
                    <td className="p-2 border text-center">{r.sai1}</td>
                    <td className="p-2 border text-center">{r.ent2}</td>
                    <td className="p-2 border text-center">{r.sai2}</td>
                    <td className={`p-2 border text-center ${r.credito !== "0:00" ? "text-emerald-600 font-medium" : "text-muted-foreground"}`}>{r.credito}</td>
                    <td className={`p-2 border text-center ${r.debito !== "0:00" ? "text-destructive font-medium" : "text-muted-foreground"}`}>{r.debito}</td>
                    <td className="p-2 border text-center text-muted-foreground">{r.horaInterv}</td>
                    <td className="p-2 border text-center">{r.horaTrab}</td>
                    <td className="p-2 border text-center">{r.saldo}</td>
                    <td className={`p-2 border ${r.hasIssue ? "text-amber-700" : "text-muted-foreground"}`}>{r.obs}</td>
                  </tr>
                ))}
                {sheet.rows.length === 0 && (
                  <tr><td colSpan={11} className="p-6 text-center text-muted-foreground">Sem dados.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="rh_requests" className="space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-semibold flex items-center gap-2">
               <FileCheck className="h-5 w-5" /> Solicitações de Colaboradores
             </h2>
          </div>
          <Card className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3">Data</th>
                  <th className="p-3">Colaborador</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Anexo</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="p-3 font-mono text-xs">{r.user_id.slice(0,8)}...</td>
                    <td className="p-3 capitalize">{r.type}</td>
                    <td className="p-3 text-xs">{r.description}</td>
                    <td className="p-3">
                      <Button size="sm" variant="ghost">Ver</Button>
                    </td>
                    <td className="p-3">
                      <Badge variant={r.status === "pendente" ? "secondary" : "default"}>{r.status}</Badge>
                    </td>
                    <td className="p-3 flex gap-1">
                      <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700">Aprovar</Button>
                      <Button size="sm" variant="destructive" className="h-7">Recusar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="mural_admin" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-5 space-y-4 md:col-span-1">
              <h3 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" /> Novo Aviso no Mural
              </h3>
              <div className="space-y-2">
                <Label>Título do Aviso</Label>
                <Input 
                  value={newAviso.title} 
                  onChange={(e) => setNewAviso({...newAviso, title: e.target.value})}
                  placeholder="Ex: Reunião Geral amanhã" 
                />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newAviso.content} 
                  onChange={(e) => setNewAviso({...newAviso, content: e.target.value})}
                  placeholder="Descreva o aviso em detalhes..."
                />
              </div>
              <Button className="w-full" onClick={() => {
                setAnnouncements([{...newAviso, id: Date.now().toString(), created_at: new Date().toISOString(), is_active: true}, ...announcements]);
                setNewAviso({title: "", content: ""});
                toast.success("Aviso publicado!");
              }}>
                <Megaphone className="h-4 w-4 mr-2" /> Publicar Aviso
              </Button>
            </Card>

            <div className="md:col-span-2 space-y-3">
               <h3 className="font-semibold">Avisos Ativos</h3>
               {announcements.map(a => (
                 <Card key={a.id} className="p-4 flex items-start justify-between gap-4">
                   <div>
                     <h4 className="font-bold text-sm">{a.title}</h4>
                     <p className="text-xs text-muted-foreground mt-1">{a.content}</p>
                     <span className="text-[10px] text-muted-foreground mt-2 block">{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                   </div>
                   <Button size="icon" variant="ghost" className="text-destructive h-8 w-8">
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </Card>
               ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6 space-y-4 max-w-2xl">
            <div>
              <Label>Endereço do escritório</Label>
              <Input
                value={form.office_address ?? ""}
                onChange={(e) => setForm({ ...form, office_address: e.target.value })}
                placeholder="Ex: Av. Paulista, 1000 — São Paulo"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.office_latitude ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      office_latitude: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.office_longitude ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      office_longitude: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={useMyLocation}>
              <MapPin className="h-4 w-4 mr-2" /> Usar minha localização atual
            </Button>

            <div>
              <Label>Raio permitido (metros)</Label>
              <Input
                type="number"
                value={form.allowed_radius_meters}
                onChange={(e) =>
                  setForm({ ...form, allowed_radius_meters: Number(e.target.value) })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Início da jornada</Label>
                <Input
                  type="time"
                  value={form.workday_start}
                  onChange={(e) => setForm({ ...form, workday_start: e.target.value })}
                />
              </div>
              <div>
                <Label>Fim da jornada</Label>
                <Input
                  type="time"
                  value={form.workday_end}
                  onChange={(e) => setForm({ ...form, workday_end: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Exigir selfie</Label>
              <Switch
                checked={form.require_selfie}
                onCheckedChange={(v) => setForm({ ...form, require_selfie: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Aplicar geofence</Label>
              <Switch
                checked={form.enforce_geofence}
                onCheckedChange={(v) => setForm({ ...form, enforce_geofence: v })}
              />
            </div>

            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar configurações"}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeClockAdminPage;

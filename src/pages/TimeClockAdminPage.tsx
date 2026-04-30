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
import { MapPin, Download, Loader2, AlertTriangle, CheckCircle2, FileDown, User } from "lucide-react";
import { toast } from "sonner";
import { buildMonthlyTimeSheet, exportTimeSheetPDF } from "@/lib/timeSheet";

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
                        <td className="p-3 capitalize">{e.entry_type}</td>
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

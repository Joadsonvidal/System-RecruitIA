import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTimeClock, type TimeClockEntry } from "@/hooks/useTimeClock";
import { useAuth } from "@/hooks/useAuth";
import {
  LogIn, LogOut, MapPin, Camera, Loader2, CheckCircle2,
  AlertTriangle, Clock, UtensilsCrossed, Coffee, FileDown, Bell, FileText
} from "lucide-react";
import { toast } from "sonner";
import { exportTimeSheetPDF, buildMonthlyTimeSheet } from "@/lib/timeSheet";
import confetti from "canvas-confetti";
import { EmployeeRH } from "@/components/employee/EmployeeRH";
import { EmployeeAnnouncements } from "@/components/employee/EmployeeAnnouncements";

type EntryType = "entrada" | "saida_almoco" | "retorno_almoco" | "saida";

const SEQUENCE: EntryType[] = ["entrada", "saida_almoco", "retorno_almoco", "saida"];

const LABELS: Record<EntryType, string> = {
  entrada: "Bater Entrada",
  saida_almoco: "Saída para Almoço",
  retorno_almoco: "Retorno do Almoço",
  saida: "Bater Saída",
};

const SHORT: Record<EntryType, string> = {
  entrada: "1ª Entrada",
  saida_almoco: "1ª Saída",
  retorno_almoco: "2ª Entrada",
  saida: "2ª Saída",
};

const ICON: Record<EntryType, React.ComponentType<{ className?: string }>> = {
  entrada: LogIn,
  saida_almoco: UtensilsCrossed,
  retorno_almoco: Coffee,
  saida: LogOut,
};

const weekdays = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
];

const formatTime = (d: Date) =>
  d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const formatDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

const TimeClockPage = () => {
  const { user } = useAuth();
  const { settings, myEntries, clockIn, getServerTime } = useTimeClock();
  const [now, setNow] = useState(new Date());
  const [serverOffset, setServerOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "selfie" | "submitting">("idle");
  const [pendingType, setPendingType] = useState<EntryType | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [coordsError, setCoordsError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    getServerTime().then((s) => setServerOffset(s.getTime() - Date.now()));
    const t = setInterval(() => setNow(new Date(Date.now() + serverOffset)), 1000);
    return () => clearInterval(t);
  }, [serverOffset]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoordsError("Geolocalização não suportada neste dispositivo.");
      return;
    }
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setCoordsError(null);
      },
      (err) => setCoordsError(err.message),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const today = now;
  const todayEntries = myEntries.filter((e) => {
    const d = new Date(e.clocked_at);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  // Next type = primeiro da sequência que ainda não foi batido hoje
  const nextType: EntryType | null = useMemo(() => {
    for (const t of SEQUENCE) {
      if (!todayEntries.some((e) => e.entry_type === t)) return t;
    }
    return null;
  }, [todayEntries]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      toast.error("Não foi possível acessar a câmera.");
      setStep("idle");
      setPendingType(null);
    }
  };

  const captureSelfie = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const video = videoRef.current;
      if (!video) return resolve(null);
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85);
    });

  const handleClockClick = async (type: EntryType) => {
    if (!coords) return toast.error("Aguarde a localização ser obtida.");
    setPendingType(type);
    if (settings.require_selfie) {
      setStep("selfie");
      setTimeout(startCamera, 100);
    } else {
      submit(type, null);
    }
  };

  const submit = async (type: EntryType, selfieBlob: Blob | null) => {
    if (!coords) return;
    setStep("submitting");
    setLoading(true);
    const result = await clockIn({
      entryType: type,
      latitude: coords.lat,
      longitude: coords.lon,
      selfieBlob: selfieBlob ?? undefined,
    });
    setLoading(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (result.error) toast.error("Erro: " + result.error);
    else if (!result.withinGeofence) toast.warning(`Ponto registrado FORA do local (${result.distance}m).`);
    else {
      toast.success(`${SHORT[type]} registrada!`);
      if (type === "saida") {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    }
    setStep("idle");
    setPendingType(null);
  };

  const confirmSelfie = async () => {
    const blob = await captureSelfie();
    if (!blob || !pendingType) return toast.error("Falha ao capturar selfie.");
    submit(pendingType, blob);
  };

  const cancelSelfie = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStep("idle");
    setPendingType(null);
  };

  const handleExportPDF = () => {
    const sheet = buildMonthlyTimeSheet(myEntries, today.getFullYear(), today.getMonth(), {
      workdayStart: settings.workday_start,
      workdayEnd: settings.workday_end,
    });
    exportTimeSheetPDF({
      employeeName: user?.email?.split("@")[0] ?? "Colaborador",
      employeeEmail: user?.email ?? "",
      monthLabel: today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
      rows: sheet.rows,
      totals: { credito: sheet.totalCredito, debito: sheet.totalDebito, saldo: sheet.saldoFinal },
    });
  };

  const NextIcon = nextType ? ICON[nextType] : CheckCircle2;
  const isExit = nextType === "saida" || nextType === "saida_almoco";

  const [activeTab, setActiveTab] = useState<"ponto" | "rh" | "mural">("ponto");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 p-4 md:p-8">
      <div className="mx-auto max-w-md space-y-4">
        
        {activeTab === "ponto" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <p className="text-sm text-muted-foreground">{weekdays[today.getDay()]}</p>
              <p className="text-base font-medium">{formatDate(today)}</p>
              <p className="mt-2 text-5xl font-bold tabular-nums tracking-tight">{formatTime(today)}</p>
              <p className="mt-1 text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" /> Hora oficial do servidor
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Sua localização</p>
                  {coordsError ? (
                    <p className="text-xs text-destructive mt-1">{coordsError}</p>
                  ) : coords ? (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Obtendo GPS…
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {step === "selfie" && (
              <Card className="p-4 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Selfie para {pendingType && SHORT[pendingType]}
                </p>
                <video ref={videoRef} className="w-full rounded-lg bg-black aspect-[4/3] object-cover" playsInline muted />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={cancelSelfie}>Cancelar</Button>
                  <Button className="flex-1" onClick={confirmSelfie} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
                  </Button>
                </div>
              </Card>
            )}

            {step === "idle" && (
              nextType ? (
                <Button
                  size="lg"
                  className={`w-full h-24 text-lg font-bold ${isExit ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
                  onClick={() => handleClockClick(nextType)}
                  disabled={!coords || loading}
                >
                  <NextIcon className="h-6 w-6 mr-2" /> {LABELS[nextType]}
                </Button>
              ) : (
                <Card className="p-6 text-center bg-emerald-50 border-emerald-200 shadow-sm">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                  <p className="font-semibold text-emerald-900">Jornada de hoje concluída!</p>
                  <p className="text-xs text-emerald-700 mt-1">As 4 batidas do dia foram registradas.</p>
                </Card>
              )
            )}

            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Batidas de hoje</p>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{todayEntries.length}/4</span>
              </div>
              {todayEntries.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhuma batida registrada hoje.</p>
              ) : (
                <div className="space-y-2">
                  {SEQUENCE.map((t) => {
                    const e = todayEntries.find((x) => x.entry_type === t);
                    const I = ICON[t];
                    return (
                      <div key={t} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${e ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground/40'}`}>
                            <I className="h-4 w-4" />
                          </div>
                          <span className={`font-medium ${e ? '' : 'text-muted-foreground/60'}`}>{SHORT[t]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {e ? (
                            <>
                              {e.within_geofence ? (
                                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Local ok</span>
                              ) : (
                                <span className="text-[10px] uppercase font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-md">Fora ({e.distance_meters}m)</span>
                              )}
                              <span className="tabular-nums font-bold text-foreground bg-muted px-2 py-1 rounded-md">
                                {new Date(e.clocked_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground font-medium">—</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Button variant="outline" className="w-full bg-background" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4 mr-2" /> Espelho de Ponto (PDF)
            </Button>
            
            <p className="text-center text-[11px] text-muted-foreground pt-4">
              Logado como <strong>{user?.email}</strong>
            </p>
          </div>
        )}

        {activeTab === "rh" && <EmployeeRH />}
        
        {activeTab === "mural" && <EmployeeAnnouncements />}

      </div>

      {/* Bottom Navigation for PWA/Mobile feel */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg z-50 pb-safe">
        <div className="max-w-md mx-auto flex justify-around items-center p-2">
          <button 
            onClick={() => setActiveTab("ponto")}
            className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all ${activeTab === "ponto" ? 'text-primary scale-105' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            <Clock className={`h-5 w-5 mb-1 ${activeTab === "ponto" ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-semibold">Ponto</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("mural")}
            className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all relative ${activeTab === "mural" ? 'text-primary scale-105' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            <div className="relative">
              <Bell className={`h-5 w-5 mb-1 ${activeTab === "mural" ? 'fill-primary/20' : ''}`} />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background animate-pulse" />
            </div>
            <span className="text-[10px] font-semibold">Avisos</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("rh")}
            className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all ${activeTab === "rh" ? 'text-primary scale-105' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            <FileText className={`h-5 w-5 mb-1 ${activeTab === "rh" ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-semibold">Meu RH</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeClockPage;

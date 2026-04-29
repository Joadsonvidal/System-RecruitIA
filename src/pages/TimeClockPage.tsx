import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTimeClock } from "@/hooks/useTimeClock";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, MapPin, Camera, Loader2, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";

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
  const [pendingType, setPendingType] = useState<"entrada" | "saida" | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [coordsError, setCoordsError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync clock with server
  useEffect(() => {
    getServerTime().then((s) => setServerOffset(s.getTime() - Date.now()));
    const t = setInterval(() => setNow(new Date(Date.now() + serverOffset)), 1000);
    return () => clearInterval(t);
  }, [serverOffset]);

  // Get geolocation
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

  // Stop camera on cleanup
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const today = now;
  const todayEntries = myEntries.filter((e) => {
    const d = new Date(e.clocked_at);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  });

  const lastEntry = todayEntries[0];
  const nextType: "entrada" | "saida" =
    !lastEntry || lastEntry.entry_type === "saida" ? "entrada" : "saida";

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
      toast.error("Não foi possível acessar a câmera. Verifique as permissões.");
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

  const handleClockClick = async (type: "entrada" | "saida") => {
    if (!coords) {
      toast.error("Aguarde a localização ser obtida.");
      return;
    }
    setPendingType(type);
    if (settings.require_selfie) {
      setStep("selfie");
      setTimeout(startCamera, 100);
    } else {
      submit(type, null);
    }
  };

  const submit = async (type: "entrada" | "saida", selfieBlob: Blob | null) => {
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

    if (result.error) {
      toast.error("Erro: " + result.error);
    } else if (!result.withinGeofence) {
      toast.warning(
        `Ponto registrado FORA do local permitido (${result.distance}m de distância).`,
      );
    } else {
      toast.success(`${type === "entrada" ? "Entrada" : "Saída"} registrada com sucesso!`);
    }
    setStep("idle");
    setPendingType(null);
  };

  const confirmSelfie = async () => {
    const blob = await captureSelfie();
    if (!blob || !pendingType) {
      toast.error("Falha ao capturar selfie.");
      return;
    }
    submit(pendingType, blob);
  };

  const cancelSelfie = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStep("idle");
    setPendingType(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-md space-y-4">
        {/* Header / clock */}
        <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground">{weekdays[today.getDay()]}</p>
          <p className="text-base font-medium">{formatDate(today)}</p>
          <p className="mt-2 text-5xl font-bold tabular-nums tracking-tight">
            {formatTime(today)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" /> Hora oficial do servidor
          </p>
        </Card>

        {/* Location card */}
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

        {/* Selfie modal-ish step */}
        {step === "selfie" && (
          <Card className="p-4 space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Camera className="h-4 w-4" /> Tire uma selfie para confirmar
            </p>
            <video
              ref={videoRef}
              className="w-full rounded-lg bg-black aspect-[4/3] object-cover"
              playsInline
              muted
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={cancelSelfie}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={confirmSelfie} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
              </Button>
            </div>
          </Card>
        )}

        {/* Big action button */}
        {step === "idle" && (
          <Button
            size="lg"
            className={`w-full h-24 text-lg font-bold ${
              nextType === "entrada"
                ? "bg-primary hover:bg-primary/90"
                : "bg-destructive hover:bg-destructive/90"
            }`}
            onClick={() => handleClockClick(nextType)}
            disabled={!coords || loading}
          >
            {nextType === "entrada" ? (
              <>
                <LogIn className="h-6 w-6 mr-2" /> Bater Entrada
              </>
            ) : (
              <>
                <LogOut className="h-6 w-6 mr-2" /> Bater Saída
              </>
            )}
          </Button>
        )}

        {/* Today entries */}
        <Card className="p-4">
          <p className="text-sm font-semibold mb-3">Suas batidas de hoje</p>
          {todayEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma batida registrada hoje.</p>
          ) : (
            <div className="space-y-2">
              {todayEntries.slice().reverse().map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {e.entry_type === "entrada" ? (
                      <LogIn className="h-4 w-4 text-primary" />
                    ) : (
                      <LogOut className="h-4 w-4 text-destructive" />
                    )}
                    <span className="capitalize font-medium">{e.entry_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {e.within_geofence ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> No local
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" /> Fora ({e.distance_meters}m)
                      </Badge>
                    )}
                    <span className="tabular-nums text-muted-foreground">
                      {new Date(e.clocked_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent history */}
        <Card className="p-4">
          <p className="text-sm font-semibold mb-3">Histórico recente</p>
          {myEntries.filter((e) => !todayEntries.includes(e)).slice(0, 10).length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem registros anteriores.</p>
          ) : (
            <div className="space-y-1.5">
              {myEntries
                .filter((e) => !todayEntries.includes(e))
                .slice(0, 10)
                .map((e) => {
                  const d = new Date(e.clocked_at);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between text-xs text-muted-foreground py-1 border-b last:border-0"
                    >
                      <span>
                        {d.toLocaleDateString("pt-BR")} • {weekdays[d.getDay()].slice(0, 3)}
                      </span>
                      <span className="capitalize">{e.entry_type}</span>
                      <span className="tabular-nums">
                        {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Logado como <strong>{user?.email}</strong>
        </p>
      </div>
    </div>
  );
};

export default TimeClockPage;

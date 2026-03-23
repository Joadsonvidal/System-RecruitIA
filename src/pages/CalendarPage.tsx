import { Video, MapPin, Phone, CalendarPlus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { toast } from "sonner";

const typeIcons: Record<string, typeof Video> = {
  video: Video,
  presencial: MapPin,
  telefone: Phone,
};

interface InterviewEntry {
  id: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  type: string;
}

const buildGoogleCalendarUrl = (interview: InterviewEntry) => {
  const [year, month, day] = interview.date.split("-");
  const [hour, minute] = interview.time.split(":");
  const startDate = `${year}${month}${day}T${hour}${minute}00`;
  const endHour = String(Number(hour) + 1).padStart(2, "0");
  const endDate = `${year}${month}${day}T${endHour}${minute}00`;

  const title = encodeURIComponent(`Entrevista - ${interview.candidateName} (${interview.jobTitle})`);
  const details = encodeURIComponent(
    `Candidato: ${interview.candidateName}\nVaga: ${interview.jobTitle}\nTipo: ${interview.type}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}`;
};

const getTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const CalendarPage = () => {
  const { candidates } = useAppContext();

  // Build interview entries from candidates in the "interview" stage
  const interviewEntries: InterviewEntry[] = candidates
    .filter((c) => c.stage === "interview")
    .map((c) => ({
      id: c.id,
      candidateName: c.name,
      jobTitle: c.position,
      date: getTodayDate(), // default to today — user sets real date via Google Calendar
      time: "10:00",
      type: "video",
    }));

  const handleAddToCalendar = (interview: InterviewEntry) => {
    const url = buildGoogleCalendarUrl(interview);
    window.open(url, "_blank");
    toast.success(`Abrindo Google Calendar para "${interview.candidateName}"...`);
  };

  const handleAddAllToCalendar = () => {
    if (interviewEntries.length === 0) {
      toast.info("Nenhum candidato na etapa de entrevista.");
      return;
    }
    interviewEntries.forEach((interview, i) => {
      setTimeout(() => {
        window.open(buildGoogleCalendarUrl(interview), "_blank");
      }, i * 500);
    });
    toast.success("Abrindo Google Calendar para todas as entrevistas...");
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Candidatos na etapa de entrevista — agende pelo Google Calendar
          </p>
        </div>
        <Button onClick={handleAddAllToCalendar} className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          Exportar para Google Calendar
        </Button>
      </div>

      {interviewEntries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarPlus className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma entrevista agendada</p>
          <p className="text-sm mt-1">Mova candidatos para a etapa "Entrevista" no Pipeline para vê-los aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interviewEntries.map((interview) => {
            const Icon = typeIcons[interview.type] || Video;
            return (
              <div key={interview.id} className="stat-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{interview.candidateName}</p>
                    <p className="text-xs text-muted-foreground">{interview.jobTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{interview.date}</p>
                    <p className="text-xs text-muted-foreground">{interview.time}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddToCalendar(interview)}
                    title="Adicionar ao Google Calendar"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;

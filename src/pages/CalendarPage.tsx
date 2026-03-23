import { Video, MapPin, Phone, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockInterviews } from "@/data/mockData";
import { toast } from "sonner";

const typeIcons = {
  video: Video,
  presencial: MapPin,
  telefone: Phone,
};

const GOOGLE_CALENDAR_SCOPES = "https://www.googleapis.com/auth/calendar.events";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

const CalendarPage = () => {
  const handleConnectGoogleCalendar = () => {
    toast.info("A integração com Google Calendar requer configuração do OAuth. Em breve disponível!");
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground text-sm mt-1">Suas entrevistas e compromissos</p>
        </div>
        <Button onClick={handleConnectGoogleCalendar} variant="outline" className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          Conectar Google Calendar
        </Button>
      </div>

      <div className="space-y-3">
        {mockInterviews.map((interview) => {
          const Icon = typeIcons[interview.type];
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
              <div className="text-right">
                <p className="text-sm font-medium">{interview.date}</p>
                <p className="text-xs text-muted-foreground">{interview.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarPage;

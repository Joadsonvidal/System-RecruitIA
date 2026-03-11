import { Video, MapPin, Phone } from "lucide-react";
import { mockInterviews } from "@/data/mockData";

const typeIcons = {
  video: Video,
  presencial: MapPin,
  telefone: Phone,
};

const CalendarPage = () => {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">Agenda</h1>
        <p className="text-muted-foreground text-sm mt-1">Suas entrevistas e compromissos</p>
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

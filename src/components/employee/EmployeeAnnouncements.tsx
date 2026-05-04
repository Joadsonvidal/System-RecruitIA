import { Card } from "@/components/ui/card";
import { Bell, Megaphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_ANNOUNCEMENTS = [
  {
    id: "1",
    title: "Atualização da Carteirinha de Saúde",
    content: "Pessoal, as novas carteirinhas digitais já estão disponíveis no app da Unimed. Por favor, baixem até sexta-feira.",
    date: "Hoje, 08:30",
    read: false,
    priority: "high"
  },
  {
    id: "2",
    title: "Festa dos Aniversariantes do Mês",
    content: "Nesta sexta-feira às 16h teremos bolo na copa para os aniversariantes de Maio! Contamos com a presença de todos que estiverem no escritório.",
    date: "Ontem, 14:00",
    read: true,
    priority: "normal"
  }
];

export const EmployeeAnnouncements = () => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" /> Mural de Avisos
        </h2>
        <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-1 rounded-full">
          1 Não lido
        </span>
      </div>

      <div className="space-y-3">
        {MOCK_ANNOUNCEMENTS.map(aviso => (
          <Card key={aviso.id} className={`p-4 transition-all ${aviso.read ? 'opacity-70 bg-muted/20' : 'border-primary/40 shadow-sm bg-primary/[0.02]'}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className={`text-sm font-semibold leading-tight ${aviso.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                {aviso.title}
              </h3>
              {!aviso.read && (
                <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {aviso.content}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{aviso.date}</span>
              {!aviso.read ? (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Marcar como ciente
                </Button>
              ) : (
                <span className="text-[10px] flex items-center text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Lida
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      <Card className="p-4 bg-muted/30 border-dashed text-center mt-6">
         <Bell className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
         <p className="text-xs text-muted-foreground">Você está em dia com os avisos da empresa.</p>
      </Card>
    </div>
  );
};

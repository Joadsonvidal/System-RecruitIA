import { MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Messages = () => {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">Conversas</h1>
        <p className="text-muted-foreground text-sm mt-1">Inbox do WhatsApp</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Zap className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Conecte seu WhatsApp</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Integre seu WhatsApp Business para enviar e receber mensagens dos candidatos diretamente pelo ZapRecruit.
        </p>
        <Button>
          <MessageSquare className="h-4 w-4 mr-1" /> Configurar Integração
        </Button>
      </div>
    </div>
  );
};

export default Messages;

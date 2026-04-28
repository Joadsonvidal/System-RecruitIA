import { MessageSquare, Zap, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

const Messages = () => {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(() => {
    return localStorage.getItem("zr_whatsapp_connected") === "true";
  });

  const handleConnect = () => {
    if (!phone.trim() || !token.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    localStorage.setItem("zr_whatsapp_connected", "true");
    localStorage.setItem("zr_whatsapp_phone", phone.trim());
    setConnected(true);
    setOpen(false);
    toast.success("WhatsApp conectado com sucesso!");
  };

  const handleDisconnect = () => {
    localStorage.removeItem("zr_whatsapp_connected");
    localStorage.removeItem("zr_whatsapp_phone");
    setConnected(false);
    toast.info("WhatsApp desconectado");
  };

  if (connected) {
    return (
      <div className="space-y-6 animate-slide-in">
        <div>
          <h1 className="text-2xl font-bold">Conversas</h1>
          <p className="text-muted-foreground text-sm mt-1">Inbox do WhatsApp</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-semibold mb-2">WhatsApp Conectado</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-2">
            Número: {localStorage.getItem("zr_whatsapp_phone")}
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-md mb-6">
            As mensagens dos candidatos aparecerão aqui quando a integração estiver ativa.
          </p>
          <Button variant="outline" onClick={handleDisconnect}>
            Desconectar WhatsApp
          </Button>
        </div>
      </div>
    );
  }

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
          Integre seu WhatsApp Business para enviar e receber mensagens dos candidatos diretamente pelo SystemrecruitIA.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="h-4 w-4 mr-1" /> Configurar Integração
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar WhatsApp</DialogTitle>
              <DialogDescription>
                Conecte sua conta do WhatsApp Business API
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Número do WhatsApp</label>
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="+55 11 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Token de Acesso</label>
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Token da API do WhatsApp Business"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <a
                href="https://business.facebook.com/latest/whatsapp_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Como obter o token do WhatsApp Business
              </a>
              <Button className="w-full" onClick={handleConnect}>
                Conectar WhatsApp
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Messages;

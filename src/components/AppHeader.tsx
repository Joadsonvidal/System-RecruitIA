import { Bell, Search, Check, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";

const AppHeader = () => {
  const { name, updateName } = useProfile();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(name);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth", { replace: true });
    toast.success("Sessão encerrada");
  };

  const handleSaveName = () => {
    if (!editName.trim()) return;
    updateName(editName);
    setEditOpen(false);
    toast.success("Nome atualizado!");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6 py-3">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar candidatos, vagas..."
          className="pl-9 bg-muted/50 border-transparent focus:border-primary/30"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold">Notificações</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllRead}>
                  <Check className="h-3 w-3 mr-1" /> Marcar todas
                </Button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma notificação</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium text-muted-foreground"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile */}
        <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (o) setEditName(name); }}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{name}</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nome</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Seu nome" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveName}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;

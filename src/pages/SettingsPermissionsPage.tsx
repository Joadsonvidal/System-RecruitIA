import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface Permission {
  id: string;
  label: string;
  description: string;
}

const permissionsByRole: Record<string, Permission[]> = {
  Recrutador: [
    { id: "r1", label: "Ver candidatos", description: "Acesso à lista de candidatos" },
    { id: "r2", label: "Editar candidatos", description: "Adicionar e editar informações" },
    { id: "r3", label: "Mover pipeline", description: "Arrastar candidatos entre etapas" },
    { id: "r4", label: "Ver vagas", description: "Acesso às vagas da empresa" },
    { id: "r5", label: "Criar vagas", description: "Cadastrar novas vagas" },
  ],
  Visualizador: [
    { id: "v1", label: "Ver candidatos", description: "Acesso somente leitura" },
    { id: "v2", label: "Ver vagas", description: "Acesso somente leitura às vagas" },
    { id: "v3", label: "Ver pipeline", description: "Visualizar o pipeline sem editar" },
  ],
};

const SettingsPermissionsPage = () => {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    r1: true, r2: true, r3: true, r4: true, r5: false,
    v1: true, v2: true, v3: false,
  });

  const toggle = (id: string) => setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center gap-3">
        <Link to="/settings">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Permissões</h1>
          <p className="text-muted-foreground text-sm">Configure acessos por role</p>
        </div>
      </div>

      {Object.entries(permissionsByRole).map(([role, perms]) => (
        <div key={role} className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">{role}</h2>
          </div>
          <div className="space-y-1">
            {perms.map((p) => (
              <div key={p.id} className="stat-card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
                <Switch checked={enabled[p.id] ?? false} onCheckedChange={() => toggle(p.id)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SettingsPermissionsPage;

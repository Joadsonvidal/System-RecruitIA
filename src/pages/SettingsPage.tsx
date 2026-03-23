import { Link } from "react-router-dom";
import { User, Shield, MessageSquare, CreditCard } from "lucide-react";

const sections = [
  { icon: User, label: "Usuários", description: "Gerencie os membros da sua equipe", path: "/settings/users" },
  { icon: Shield, label: "Permissões", description: "Configure acessos e roles", path: "/settings/permissions" },
  { icon: MessageSquare, label: "WhatsApp", description: "Configure a integração com WhatsApp", path: "/messages" },
  { icon: CreditCard, label: "Plano", description: "Gerencie sua assinatura", path: "/pricing" },
];

const SettingsPage = () => {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie sua conta e preferências</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Link key={section.label} to={section.path}>
            <div className="stat-card flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <section.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{section.label}</p>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;

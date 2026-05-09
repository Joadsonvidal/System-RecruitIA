import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Kanban,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  Settings,
  Zap,
  Clock,
  UserCheck,
  ShieldCheck,
  BarChart3,
  FileCheck,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useUserRole } from "@/hooks/useUserRole";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/pipeline", icon: Kanban, label: "Pipeline" },
  { path: "/candidates", icon: Users, label: "Candidatos" },
  { path: "/colaboradores", icon: UserCheck, label: "Colaboradores" },
  { path: "/jobs", icon: Briefcase, label: "Vagas" },
  { path: "/calendar", icon: Calendar, label: "Agenda" },
  { path: "/messages", icon: MessageSquare, label: "Conversas" },
  { path: "/ponto/admin", icon: Clock, label: "Ponto" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/onboarding", icon: FileCheck, label: "Onboarding" },
  { path: "/settings", icon: Settings, label: "Configurações" },
];

const AppSidebar = () => {
  const location = useLocation();
  const { isSuperAdmin } = useUserRole();
  const items = isSuperAdmin
    ? [...navItems, { path: "/admin", icon: ShieldCheck, label: "Super Admin" }]
    : navItems;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src={logo} alt="SystemrecruitIA" className="h-8 w-8" />
        <span className="text-lg font-bold text-sidebar-primary-foreground">
          Systemrecruit<span className="text-sidebar-primary">IA</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? "sidebar-item-active" : "sidebar-item-inactive"}`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="h-4 w-4 text-sidebar-primary" />
            <span className="text-xs font-semibold text-sidebar-accent-foreground">WhatsApp</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60">Conecte seu WhatsApp para enviar mensagens.</p>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;

import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

const RequireSuperAdmin = ({ children }: { children: React.ReactNode }) => {
  const { isSuperAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Verificando permissões...</div>
      </div>
    );
  }

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default RequireSuperAdmin;

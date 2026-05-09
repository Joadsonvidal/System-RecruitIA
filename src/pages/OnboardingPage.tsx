import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileCheck, 
  Upload, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  FileText,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const OnboardingPage = () => {
  const [employees, setEmployees] = useState([
    { id: "1", name: "João Silva", position: "Dev Fullstack", status: "in_progress", docs: { rg: true, cpf: true, contrato: false } },
    { id: "2", name: "Maria Santos", position: "Designer UX", status: "completed", docs: { rg: true, cpf: true, contrato: true } },
    { id: "3", name: "Pedro Oliveira", position: "Product Manager", status: "pending", docs: { rg: false, cpf: false, contrato: false } },
  ]);

  const getDocStatus = (hasDoc: boolean) => {
    return hasDoc ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    ) : (
      <Clock className="h-4 w-4 text-amber-500" />
    );
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Onboarding Digital</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie a entrada e documentação de novos talentos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 shadow-lg">
          <UserPlus className="h-4 w-4 mr-2" /> Novo Processo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-none shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">5</p>
            <p className="text-xs text-muted-foreground font-medium uppercase">Em Andamento</p>
          </div>
        </Card>
        <Card className="p-4 bg-white border-none shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">12</p>
            <p className="text-xs text-muted-foreground font-medium uppercase">Finalizados (Mês)</p>
          </div>
        </Card>
        <Card className="p-4 bg-white border-none shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">28</p>
            <p className="text-xs text-muted-foreground font-medium uppercase">Docs Pendentes</p>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b">
            <tr className="text-left">
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Colaborador</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">RG</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">CPF</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Contrato</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map((e) => (
              <tr key={e.id} className="hover:bg-muted/10 transition-colors">
                <td className="p-4">
                  <div>
                    <p className="font-bold text-slate-900">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.position}</p>
                  </div>
                </td>
                <td className="p-4">{getDocStatus(e.docs.rg)}</td>
                <td className="p-4">{getDocStatus(e.docs.cpf)}</td>
                <td className="p-4">{getDocStatus(e.docs.contrato)}</td>
                <td className="p-4">
                  <Badge variant={e.status === "completed" ? "secondary" : "outline"} className="capitalize">
                    {e.status === "completed" ? "Finalizado" : e.status === "in_progress" ? "Em andamento" : "Pendente"}
                  </Badge>
                </td>
                <td className="p-4">
                  <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/5">
                    Detalhes
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default OnboardingPage;

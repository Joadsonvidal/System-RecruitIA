import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Users, Timer, TrendingUp, UserMinus, Target, Award } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F"];

const AnalyticsPage = () => {
  const { candidates, jobs } = useAppContext();

  const stats = useMemo(() => {
    const total = candidates.length;
    const hired = candidates.filter(c => c.stage === "approved").length;
    const conversionRate = total > 0 ? ((hired / total) * 100).toFixed(1) : 0;
    
    // Mocking average days to hire (in real app, diff between createdAt and hireDate)
    const avgDays = 18; 

    return [
      { label: "Taxa de Conversão", value: `${conversionRate}%`, icon: Target, color: "text-blue-600" },
      { label: "Tempo Médio (Dias)", value: avgDays, icon: Timer, color: "text-amber-600" },
      { label: "Retenção Estimada", value: "94%", icon: Award, color: "text-emerald-600" },
      { label: "Custo por Vaga (R$)", value: "1.250", icon: TrendingUp, color: "text-indigo-600" },
    ];
  }, [candidates]);

  // Data for Funnel Chart
  const funnelData = useMemo(() => [
    { name: "Triagem", value: candidates.filter(c => c.stage === "new").length },
    { name: "Entrevista", value: candidates.filter(c => c.stage === "interview").length },
    { name: "Teste Técnico", value: candidates.filter(c => c.stage === "technical").length },
    { name: "Aprovados", value: candidates.filter(c => c.stage === "approved").length },
  ], [candidates]);

  // Data for Hiring by Department
  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach(c => {
      const dept = c.position || "Outros";
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [candidates]);

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">People Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Indicadores avançados de recrutamento e retenção</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-4 border-none shadow-sm bg-white">
            <div className={`p-3 rounded-xl bg-muted/50 ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funil de Recrutamento */}
        <Card className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Funil de Conversão</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Contratações por Área */}
        <Card className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Contratações por Área</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Evolução Temporal */}
      <Card className="p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Tendência de Contratação vs Desligamento</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { name: "Jan", hired: 4, left: 1 },
              { name: "Fev", hired: 7, left: 2 },
              { name: "Mar", hired: 5, left: 1 },
              { name: "Abr", hired: 8, left: 3 },
              { name: "Mai", hired: 10, left: 2 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hired" name="Contratados" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="left" name="Desligados" stroke="#ff4d4f" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;

import { Check, Zap, Star, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    price: "197",
    icon: Zap,
    popular: false,
    url: "https://pay.kiwify.com.br/AGgZs7x",
    features: [
      "1 usuário",
      "Até 10 vagas ativas",
      "Pipeline básico",
      "Gestão de candidatos",
      "Notas internas",
    ],
  },
  {
    name: "Pro",
    price: "237",
    icon: Star,
    popular: true,
    url: "https://pay.kiwify.com.br/RTJHZ38",
    features: [
      "5 usuários",
      "Vagas ilimitadas",
      "Pipeline completo",
      "Entrevistas e agenda",
      "Lembretes automáticos",
      "Integrações",
    ],
  },
  {
    name: "Business",
    price: "297",
    icon: Building2,
    popular: false,
    url: "https://pay.kiwify.com.br/fqFOJ5M",
    features: [
      "Usuários ilimitados",
      "Tudo do Pro",
      "Automações avançadas",
      "Relatórios e métricas",
      "Integrações premium",
      "Suporte prioritário",
      "API de acesso",
    ],
  },
];

const PricingPage = () => {
  return (
    <div className="space-y-8 animate-slide-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Escolha seu plano</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Comece gratuitamente por 7 dias. Cancele quando quiser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl border p-6 flex flex-col transition-shadow ${
              plan.popular
                ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                : "border-border bg-card"
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Mais popular
              </Badge>
            )}

            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <plan.icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold">{plan.name}</h2>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-extrabold">R${plan.price}</span>
              <span className="text-sm text-muted-foreground">/mês</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={plan.popular ? "default" : "outline"}
              onClick={() => window.open(plan.url, "_blank")}
            >
              Começar agora
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;

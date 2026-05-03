import { Link } from "react-router-dom";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { User, Shield, MessageSquare, CreditCard, Smartphone, Copy, Share2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const sections = [
  { icon: User, label: "Usuários", description: "Gerencie os membros da sua equipe", path: "/settings/users" },
  { icon: Shield, label: "Permissões", description: "Configure acessos e roles", path: "/settings/permissions" },
  { icon: MessageSquare, label: "WhatsApp", description: "Configure a integração com WhatsApp", path: "/messages" },
  { icon: CreditCard, label: "Plano", description: "Gerencie sua assinatura", path: "/pricing" },
];

const SettingsPage = () => {
  const { user } = useAuth();
  const pontoUrl = `${window.location.origin}/ponto/acesso?empresa=${user?.id ?? ""}`;
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(pontoUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Olá! Este é o seu link para bater ponto pelo celular:\n\n${pontoUrl}\n\nFaça login uma vez e adicione à tela inicial do seu celular.`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie sua conta e preferências</p>
      </div>

      {/* Acesso ao Ponto */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Acesso ao Ponto pelo celular</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Compartilhe este QR Code ou link com seus colaboradores. Eles fazem login uma vez e podem salvar o ícone na tela inicial do celular.
            </p>

            <div className="mt-5 grid md:grid-cols-[auto,1fr] gap-6 items-start">
              <div className="rounded-xl bg-white p-4 border w-fit mx-auto md:mx-0">
                <QRCodeSVG value={pontoUrl} size={180} level="M" />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Link direto:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md truncate">{pontoUrl}</code>
                    <Button size="sm" variant="outline" onClick={copyLink}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button onClick={shareWhatsApp} className="w-full md:w-auto">
                  <Share2 className="h-4 w-4 mr-2" /> Compartilhar pelo WhatsApp
                </Button>

                <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                  <p className="font-medium text-foreground">Como o colaborador usa:</p>
                  <p>1. Abre a câmera do celular e aponta para o QR Code (ou clica no link).</p>
                  <p>2. Faz login com email e senha (uma única vez).</p>
                  <p>3. <strong>iPhone:</strong> Toca em "Compartilhar" → "Adicionar à Tela de Início".</p>
                  <p>3. <strong>Android:</strong> Menu do navegador → "Adicionar à tela inicial".</p>
                  <p>4. Pronto! Vira um ícone igual a um app — basta abrir e bater o ponto.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

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

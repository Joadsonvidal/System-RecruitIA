import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock, ArrowLeft } from "lucide-react";

type Step = "email" | "otp" | "create" | "login";

const EmployeeAccessPage = () => {
  const [params] = useSearchParams();
  const ownerId = params.get("empresa");
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // se já está logado, vai direto para o ponto
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/ponto", { replace: true });
    });
  }, [navigate]);

  if (!ownerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-xl font-bold mb-2">Link inválido</h1>
          <p className="text-sm text-muted-foreground">
            O link do QR Code está incompleto. Peça um novo ao RH da sua empresa.
          </p>
        </Card>
      </div>
    );
  }

  const checkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("employee-access", {
      body: { email, owner_id: ownerId, action: "check" },
    });
    
    if (error || (data as any)?.error) {
      setLoading(false);
      return toast.error((data as any)?.error || "E-mail não cadastrado nesta empresa.");
    }
    
    setName((data as any).name || "");
    
    if ((data as any).has_account) {
      setStep("login");
      setLoading(false);
    } else {
      // Conta não existe, dispara o PIN para o e-mail (OTP)
      const { data: otpData, error: otpError } = await supabase.functions.invoke("employee-access", {
        body: { email, owner_id: ownerId, action: "send_otp" },
      });
      
      setLoading(false);
      if (otpError || (otpData as any)?.error) {
        return toast.error("Erro ao enviar código de verificação.");
      }
      
      toast.success("Código enviado para o seu e-mail!");
      if ((otpData as any)?.dev_pin) {
         // Apenas em ambiente sem Resend configurado
         toast.info(`PIN DE TESTE: ${(otpData as any).dev_pin}`, { duration: 10000 });
      }
      setStep("otp");
    }
  };

  const verifyOtpAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("O código deve ter 6 dígitos.");
    setStep("create");
  };

  const createPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("A senha deve ter pelo menos 6 caracteres.");
    if (password !== confirm) return toast.error("As senhas não coincidem.");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("employee-access", {
      body: { email, owner_id: ownerId, action: "signup", password, otp },
    });
    if (error || (data as any)?.error) {
      setLoading(false);
      return toast.error((data as any)?.error || "Não foi possível criar a senha.");
    }
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signErr) return toast.error("Conta criada, mas falhou ao entrar. Tente novamente.");
    toast.success(`Bem-vindo(a), ${name || "colaborador"}!`);
    navigate("/ponto", { replace: true });
  };

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error("Senha incorreta. Tente novamente.");
    navigate("/ponto", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Clock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">Acesso do Colaborador</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === "email" && "Digite o e-mail cadastrado pela sua empresa."}
            {step === "otp" && "Enviamos um código para o seu e-mail."}
            {step === "create" && `Olá, ${name || ""}! Crie sua senha para começar.`}
            {step === "login" && `Olá, ${name || ""}! Digite sua senha para entrar.`}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={checkEmail} className="space-y-3">
            <div>
              <Label htmlFor="em">E-mail</Label>
              <Input
                id="em" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verificando..." : "Continuar"}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtpAndProceed} className="space-y-3">
            <div>
              <Label htmlFor="otp">Código de Verificação (6 dígitos)</Label>
              <Input
                id="otp" type="text" required maxLength={6}
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="text-center tracking-widest text-lg font-bold"
              />
            </div>
            <Button type="submit" className="w-full" disabled={otp.length !== 6}>
              Validar Código
            </Button>
            <button type="button" onClick={() => setStep("email")}
              className="text-xs text-muted-foreground hover:underline flex items-center gap-1 mx-auto">
              <ArrowLeft className="h-3 w-3" /> Voltar
            </button>
          </form>
        )}

        {step === "create" && (
          <form onSubmit={createPassword} className="space-y-3">
            <div>
              <Label htmlFor="pw">Crie sua senha</Label>
              <Input
                id="pw" type="password" required minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pw2">Confirmar senha</Label>
              <Input
                id="pw2" type="password" required minLength={6}
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando..." : "Criar senha e entrar"}
            </Button>
            <button type="button" onClick={() => setStep("email")}
              className="text-xs text-muted-foreground hover:underline flex items-center gap-1 mx-auto">
              <ArrowLeft className="h-3 w-3" /> Cancelar
            </button>
          </form>
        )}

        {step === "login" && (
          <form onSubmit={doLogin} className="space-y-3">
            <div>
              <Label htmlFor="pw">Senha</Label>
              <Input
                id="pw" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <button type="button" onClick={() => setStep("email")}
              className="text-xs text-muted-foreground hover:underline flex items-center gap-1 mx-auto">
              <ArrowLeft className="h-3 w-3" /> Trocar e-mail
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Dica: salve na tela inicial do celular</p>
          <p><strong>iPhone:</strong> Compartilhar → "Adicionar à Tela de Início".</p>
          <p><strong>Android:</strong> Menu do navegador → "Adicionar à tela inicial".</p>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeAccessPage;

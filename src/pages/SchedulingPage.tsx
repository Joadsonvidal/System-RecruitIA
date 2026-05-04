import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Clock, Calendar as CalendarIcon, CheckCircle2, ArrowRight, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ptBR } from "date-fns/locale";

import { supabase } from "@/integrations/supabase/client";

const AVAILABLE_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"
];

const SchedulingPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<"date" | "success">("date");
  const [loading, setLoading] = useState(false);

  const handleSchedule = async () => {
    if (!date || !selectedTime) return;
    setLoading(true);
    
    // Pegando dados do candidato (mock ou DB se estivesse linkado)
    // Para efeito de execução real salvando na tabela de entrevistas:
    const { error } = await supabase.from("interviews" as any).insert({
      candidate_name: "Candidato " + (candidateId?.substring(0, 4) || ""),
      job_title: "Vaga Aplicada",
      date: date.toISOString().split('T')[0],
      time: selectedTime,
      type: "video"
    });

    if (error) {
      toast.error("Erro ao agendar: " + error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("success");
    toast.success("Entrevista agendada com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === "date" ? (
          <motion.div
            key="scheduling"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl grid md:grid-cols-5 gap-6"
          >
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-primary mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="font-bold text-xl leading-none">RecruitIA</h1>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Sistemas Inteligentes</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">Agende sua Entrevista</h2>
                <p className="text-muted-foreground">Escolha o melhor dia e horário para conversarmos sobre a sua candidatura.</p>
              </div>

              <Card className="p-4 bg-primary/5 border-primary/10 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Duração: 45 minutos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium">Local: Google Meet (Online)</span>
                </div>
              </Card>
            </div>

            <Card className="md:col-span-3 p-6 shadow-xl border-white/20 bg-white/50 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">1</span>
                    Selecione o Dia
                  </p>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    className="rounded-md border shadow-sm bg-white"
                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">2</span>
                    Horários Disponíveis
                  </p>
                  <div className="grid grid-cols-2 gap-2 h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                    {AVAILABLE_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === time
                            ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                            : "bg-white border hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div className="text-sm">
                  {date && selectedTime ? (
                    <p className="text-muted-foreground">
                      Confirmado para <span className="font-bold text-foreground">{date.toLocaleDateString('pt-BR')}</span> às <span className="font-bold text-foreground">{selectedTime}</span>
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Selecione uma data e horário</p>
                  )}
                </div>
                <Button 
                  onClick={handleSchedule} 
                  disabled={!date || !selectedTime || loading}
                  className="px-8"
                >
                  {loading ? "Processando..." : "Confirmar Agendamento"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="p-10 text-center space-y-6 shadow-2xl border-emerald-100 bg-emerald-50/30">
              <div className="relative mx-auto w-20 h-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="absolute inset-0 bg-emerald-500 rounded-full"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center text-white"
                >
                  <CheckCircle2 className="h-10 w-10" />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-emerald-900">Agendado com Sucesso!</h2>
                <p className="text-emerald-800/70">
                  Enviamos os detalhes da entrevista para o seu e-mail e WhatsApp. Nos vemos em breve!
                </p>
              </div>

              <div className="bg-white/60 p-4 rounded-xl border border-emerald-100 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-bold">{date?.toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horário:</span>
                  <span className="font-bold">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Link da Reunião:</span>
                  <span className="font-bold text-primary underline">meet.google.com/abc-defg-hij</span>
                </div>
              </div>

              <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100" onClick={() => window.close()}>
                Fechar Janela
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchedulingPage;

# 🧠 Memória do Sistema: System-RecruitIA

> Este arquivo serve como a "memória contínua" do projeto para nós. Todas as decisões arquiteturais, integrações e o roadmap estão registrados aqui para garantir que nenhum contexto seja perdido entre sessões.

## 📋 Sobre o Projeto
- **Nome:** System-RecruitIA / ZapRecruta
- **Objetivo:** CRM de Recrutamento pelo WhatsApp + Gestão de RH Digital.
- **Repositório:** [Joadsonvidal/System-RecruitIA](https://github.com/Joadsonvidal/System-RecruitIA)
- **Produção:** [https://zaprecruit-production.up.railway.app](https://zaprecruit-production.up.railway.app)
- **Local (Workspace):** `C:\Users\Usuário\Downloads\Sistemas\System-RecruitIA`

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, TypeScript
- **Estilização:** Tailwind CSS, Shadcn UI, Lucide Icons
- **Backend/DB:** Supabase (PostgreSQL + RLS)
- **Deploy Frontend:** Railway (Infraestrutura oficial)
- **Gerenciador de Pacotes:** NPM (Migrado de Bun para melhor compatibilidade de build)

## 🔗 Integrações e Chaves
### Supabase
- **Status:** Instância oficial conectada.
- **Project ID:** `sqlqhikhwlprrxnvjvrd`
- **Ambiente Local:** O `.env` está sincronizado e protegido (ignorado pelo git).

### Railway (Deploy)
- **Status:** Integrado via CLI.
- **Projeto:** `8002fd77-40b8-406e-987e-9a3fe59408e4`
- **Serviço:** `zaprecruit`
- **Hardening:** CORS restrito aos domínios oficiais.

## 🚀 Funcionalidades Entregues (Maio/2026)

### 1. Portal do Colaborador (PWA)
- **Ponto Biométrico:** Registro com geolocalização e **Liveness Detection** (biometria facial).
- **Autoatendimento:** Mural de avisos e envio de solicitações (atestados/férias).

### 2. Gestão de Talentos (Admin)
- **Pipeline Kanban:** CRM de recrutamento com fluxo de candidatos.
- **Agendamento Inteligente:** Interface pública para candidatos marcarem entrevistas.
- **Onboarding Digital:** Monitoramento de documentos de admissão.

### 3. Business Intelligence & BI
- **People Analytics:** Dashboards de turnover, funil e retenção.
- **Exportação Contábil:** Geração de folha de pagamento em CSV padrão contabilidade.
- **Geofencing:** Alerta visual e auditoria de local de trabalho.

## 🛡️ Segurança & Hardening (Pentest Concluído)
- **RLS (Row Level Security):** Todas as tabelas protegidas no nível do banco.
- **OTP (One Time Password):** Fluxo de login de colaborador blindado no backend.
- **CORS:** Restrição total de origem nas Edge Functions.
- **Build Seguro:** Lockfile sincronizado e remoção de logs de depuração.

## 🗺️ Roadmap de Evolução

### 1. IA e Automação (Próxima Fase)
- [ ] **Leitura de Currículos (IA):** Extração de dados de PDFs via API OpenAI/Gemini.
- [ ] **WhatsApp Bot:** Automação de notificações de status de processo.

## 📅 Histórico de Intervenções
- **[03/05/2026]:** Configuração inicial Supabase.
- **[04/05/2026]:** Implementação do ecossistema de colaborador.
- **[05/05/2026]:** Lançamento de Analytics e Biometria.
- **[09/05/2026]:** Integração total Railway, Onboarding Digital, Exportação Contábil e Hardening de Segurança (Pentest).

---
*Nota para a IA: Este arquivo é a bússola do projeto. Mantenha-o sempre atualizado.*

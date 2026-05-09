# 🧠 Memória do Sistema: System-RecruitIA

> Este arquivo serve como a "memória contínua" do projeto para nós. Todas as decisões arquiteturais, integrações e o roadmap estão registrados aqui para garantir que nenhum contexto seja perdido entre sessões.

## 📋 Sobre o Projeto
- **Nome:** System-RecruitIA
- **Objetivo:** CRM de Recrutamento pelo WhatsApp.
- **Repositório:** [Joadsonvidal/System-RecruitIA](https://github.com/Joadsonvidal/System-RecruitIA)
- **Local (Workspace):** `C:\Users\Usuário\Downloads\Sistemas\System-RecruitIA`

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, TypeScript
- **Estilização:** Tailwind CSS, Shadcn UI, Lucide Icons
- **Backend/DB:** Supabase
- **Deploy Frontend:** Railway (Produção Oficial)
- **Gerenciador de Pacotes:** NPM

## 🔗 Integrações e Chaves
### Supabase
- **Status:** Apontando para a instância oficial.
- **Project ID:** `sqlqhikhwlprrxnvjvrd`
- **Ambiente Local:** O `.env` foi sincronizado.

### Railway (Deploy)
- **Status:** Integrado via CLI.
- **Projeto:** `System RecruitIA` (ID: `8002fd77-40b8-406e-987e-9a3fe59408e4`)
- **Serviço:** `zaprecruit`
- **Deploy:** Automatizado via `railway up`. Variáveis configuradas.

## 🚀 Funcionalidades Entregues (Maio/2026)

### 1. Portal do Colaborador (Autoatendimento)
- **Interface PWA:** Navegação mobile-first por abas (Ponto, Mural, Meu RH).
- **Mural de Avisos:** Sistema de comunicados internos com marcação de leitura.
- **Solicitações RH:** Envio de atestados e pedidos de férias com upload.

### 2. Recrutamento & Agendamento
- **Link estilo "Calendly":** Geração de link único por candidato.
- **Página de Agendamento Pública:** Interface premium para candidatos.

### 3. Onboarding & Documentação Digital
- **Checklist de Admissão:** Monitoramento de documentos (RG, CPF, Contrato) para novos talentos.
- **Status de Entrada:** Acompanhamento visual do progresso de integração de cada colaborador.

### 4. Integração Contábil & Geofencing
- **Exportação de Folha:** Geração de arquivo CSV formatado para sistemas de contabilidade.
- **Alertas de Localização:** Sistema visual de avisos no Admin para batidas fora do raio permitido (Geofencing dinâmico).

### 5. People Analytics (Business Intelligence)
- **Dashboard Avançado:** Gráficos de funil, tempo médio de contratação e tendências de turnover.

## 🗺️ Roadmap de Evolução e Melhorias

### 1. Inteligência Artificial (Próxima Etapa - Requer API OpenAI/Gemini)
- [ ] **Leitura de Currículos (Parsing Automático):** Processar PDFs e extrair Habilidades e Experiência.
- [ ] **Matching de Candidatos:** Gerar score de aderência automática à vaga.

### 2. Automação Dinâmica com WhatsApp
- [ ] **Notificações Ativas:** Enviar confirmações de agendamento e status via WhatsApp API.

## 📅 Histórico de Intervenções
- **[03/05/2026]:** Configuração inicial e troca de chaves Supabase.
- **[04/05/2026]:** Implementação do ecossistema de colaborador, agendamento e segurança.
- **[05/05/2026]:** Lançamento do módulo de People Analytics e Liveness Detection.
- **[09/05/2026]:** Integração total com Railway concluída. Lançamento dos módulos de Onboarding Digital e Integração Contábil.

---
*Nota para a IA: Este arquivo é a bússola do projeto. Mantenha-o sempre atualizado.*

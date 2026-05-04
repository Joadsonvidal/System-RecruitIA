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
- **Deploy Frontend:** Lovable (Geração) / Railway (Planejado para Produção)
- **Gerenciador de Pacotes:** NPM / Bun

## 🔗 Integrações e Chaves
### Supabase
- **Status:** Apontando para a instância do usuário.
- **Project ID do Usuário:** `sqlqhikhwlprrxnvjvrd`
- **Ambiente Local:** O `.env` já foi atualizado e enviado para o GitHub.
- **Ação Pendente:** Rodar as migrações (arquivos SQL em `/supabase/migrations/`) no SQL Editor do painel Supabase para criar as tabelas.

## 🗺️ Roadmap de Evolução e Melhorias

### 1. Inteligência Artificial (Próxima Etapa)
- [ ] **Leitura de Currículos (Parsing Automático):** Processar PDFs e extrair Habilidades, Experiência, e Contato via IA.
- [ ] **Matching de Candidatos:** Gerar uma pontuação (Score de 0 a 100%) da aderência do candidato aos requisitos da vaga (`Jobs`).

### 2. Automação Dinâmica com WhatsApp
- [ ] **Mensagens Automáticas de Status:** Enviar notificação pelo WhatsApp sempre que um candidato for movido no `Pipeline`.
- [ ] **Webhooks de Agendamento:** Notificar o gestor e o candidato via WhatsApp assim que uma entrevista for agendada.

## 🚀 Funcionalidades Entregues (Maio/2026)

### 1. Portal do Colaborador (Autoatendimento)
- **Interface PWA:** Navegação mobile-first por abas (Ponto, Mural, Meu RH).
- **Mural de Avisos:** Sistema de comunicados internos com marcação de leitura e gestão administrativa.
- **Solicitações RH:** Envio de atestados e pedidos de férias com upload de documentos.

### 2. Recrutamento & Agendamento
- **Link estilo "Calendly":** Geração de link único por candidato no Pipeline.
- **Página de Agendamento Pública:** Interface premium onde o candidato escolhe data/hora e salva no banco (`interviews`).

### 3. Segurança e Hardening (Nível Enterprise)
- **Anti-Spam OTP:** Rate limit e PINs criptográficos imprevisíveis.
- **Redirecionamento Inteligente:** `ProtectedRoute` que separa o acesso de Admin do acesso de Colaborador.
- **QR Code Dinâmico:** Link seguro com ID da empresa para acesso instantâneo.

## 📅 Histórico de Intervenções
- **[03/05/2026]:** Configuração inicial, troca de chaves Supabase oficiais (`sqlqhikhwlprrxnvjvrd`).
- **[04/05/2026]:** Implementação do ecossistema de colaborador, automação de agendamento e blindagem de segurança.

---
*Nota para a IA: Este arquivo é a bússola do projeto. Mantenha-o sempre atualizado.*

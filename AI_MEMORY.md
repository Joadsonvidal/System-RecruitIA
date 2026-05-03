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

### 1. Inteligência Artificial (Prioridade)
- [ ] **Leitura de Currículos (Parsing Automático):** Processar PDFs e extrair Habilidades, Experiência, e Contato via IA.
- [ ] **Matching de Candidatos:** Gerar uma pontuação (Score de 0 a 100%) da aderência do candidato aos requisitos da vaga (`Jobs`).

### 2. Automação Dinâmica com WhatsApp
- [ ] **Mensagens Automáticas de Status:** Enviar notificação pelo WhatsApp sempre que um candidato for movido no `Pipeline`.
- [ ] **Integração Técnica:** Utilizar API Oficial do WhatsApp ou bibliotecas alternativas (como Baileys / Evolution API).

### 3. Melhorias Visuais e UX (Premium)
- [ ] **Glassmorphism:** Aplicar efeitos translúcidos e modernos nos cards.
- [ ] **Dark Mode Aprimorado:** Ajustar a paleta para um aspecto mais sofisticado e corporativo.
- [ ] **Animações (Micro-interações):** Tornar o Kanban (Pipeline) mais fluido.

### 4. Funcionalidades em Tempo Real
- [ ] **Supabase Realtime:** Ativar a sincronização em tempo real nas listas de candidatos, pipeline e relógio de ponto (`TimeClock`).

## 📅 Histórico de Intervenções
- **[03/05/2026]:** Projeto clonado, dependências instaladas. Chaves do Supabase original do Lovable removidas e substituídas pelas chaves oficiais do projeto (`sqlqhikhwlprrxnvjvrd`). Alterações enviadas para a branch `main`. Arquivo de memória (`AI_MEMORY.md`) criado.

---
*Nota para a IA: Sempre atualize este arquivo após grandes marcos, instalações de bibliotecas importantes ou mudanças na estrutura do banco de dados.*

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

## 🚀 Funcionalidades Entregues (Maio/2026)

### 1. Portal do Colaborador (Autoatendimento)
- **Interface PWA:** Navegação mobile-first por abas (Ponto, Mural, Meu RH).
- **Mural de Avisos:** Sistema de comunicados internos com marcação de leitura.
- **Solicitações RH:** Envio de atestados e pedidos de férias com upload.

### 2. Recrutamento & Agendamento
- **Link estilo "Calendly":** Geração de link único por candidato.
- **Página de Agendamento Pública:** Interface premium para candidatos.

### 3. People Analytics (Business Intelligence)
- **Dashboard Avançado:** Gráficos de funil, tempo médio de contratação e tendências de turnover.
- **Filtros por Área:** Visualização da distribuição de colaboradores por departamento.

### 4. Segurança e Hardening (Nível Enterprise)
- **Liveness Detection:** Desafios aleatórios de movimento ("Olhe para o lado") para prevenir fraudes com fotos estáticas no ponto eletrônico.
- **Redirecionamento Inteligente:** Proteção de rotas que separa Admin de Colaborador automaticamente.
- **QR Code Dinâmico:** Link robusto com ID de empresa embutido.

## 🗺️ Roadmap de Evolução e Melhorias

### 1. Inteligência Artificial (Próxima Etapa)
- [ ] **Leitura de Currículos (Parsing Automático):** Processar PDFs e extrair Habilidades, Experiência, e Contato via IA.
- [ ] **Matching de Candidatos:** Gerar uma pontuação (Score de 0 a 100%) da aderência do candidato aos requisitos da vaga.

### 2. Automação Dinâmica com WhatsApp
- [ ] **Mensagens Automáticas de Status:** Enviar notificação pelo WhatsApp sempre que um candidato for movido no Pipeline.
- [ ] **Integração Técnica:** Utilizar API Oficial do WhatsApp ou Evolution API.

## 📅 Histórico de Intervenções
- **[03/05/2026]:** Configuração inicial e troca de chaves Supabase.
- **[04/05/2026]:** Implementação do ecossistema de colaborador, agendamento e blindagem de segurança.
- **[05/05/2026]:** Lançamento do módulo de People Analytics e introdução de Biometria/Liveness Detection no ponto.

---
*Nota para a IA: Este arquivo é a bússola do projeto. Mantenha-o sempre atualizado.*

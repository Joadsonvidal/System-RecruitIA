
# Plano de melhorias

## 1. Como os colaboradores acessam o ponto pelo celular

A maneira mais simples — sem precisar instalar app:

1. Cada colaborador faz login uma vez no celular pelo link direto:
   **`https://sistemarecruitia.lovable.app/ponto`**
2. Vou criar uma página interna **"Acesso ao Ponto"** dentro de Configurações com:
   - O link `/ponto` pronto para copiar
   - Um **QR Code** desse link (você projeta na TV/imprime, o colaborador aponta a câmera e já abre)
   - Botão **"Compartilhar pelo WhatsApp"** que abre o WhatsApp com a mensagem pronta ("Olá {nome}, este é seu link para bater ponto: …")
   - Instrução de "Adicionar à Tela Inicial" (vira um ícone igual app)
3. No `/ponto` vou adicionar um botão **"Salvar atalho na tela inicial"** com instruções rápidas para iPhone e Android.

Resultado: colaborador abre uma vez pelo QR Code/WhatsApp, faz login, salva na tela inicial e a partir daí toca no ícone → abre direto a tela de bater ponto.

## 2. Cálculo automático do débito e o que são créditos

Sim, **créditos = horas extras** (tempo trabalhado acima da jornada esperada do dia) e **débitos = horas faltantes** (jornada não cumprida ou faltas).

Vou ajustar o Espelho de Ponto para mostrar, no rodapé da tabela e no PDF, três totais bem destacados:
- **Total de Créditos** (horas extras do mês)
- **Total de Débitos** (horas que precisam ser repostas/descontadas no mês)
- **Saldo final** (créditos − débitos)

Hoje a soma já é calculada internamente, mas não aparece visualmente. Vai passar a aparecer.

## 3. Aba "Desligados" com motivo de saída

Nova aba na tela de **Candidatos** chamada **"Desligados"**, mostrando todos com etapa = `terminated`.

Cada desligado terá um campo de seleção (dropdown) com os motivos:
- Desistência por valor
- Desistência por desânimo
- Conflito interno
- Recebeu outra proposta externa
- Proposta de Player
- Proposta de Conselheiro

E um filtro no topo da aba para filtrar por motivo. O motivo fica salvo no banco (campo novo `termination_reason` na tabela `candidates`).

## 4. Exportar batidas em PDF (folha deitada) além do CSV

Na tela **Ponto → Batidas**, ao lado do botão "Exportar CSV" vou adicionar **"Exportar PDF"** — gera o PDF em A4 paisagem (folha deitada) com as mesmas colunas: Data/Hora, Colaborador, Tipo, Endereço, Geofence, Distância. Respeita o filtro aplicado.

## 5. Nova aba "Colaboradores"

Nova página no menu lateral: **Colaboradores** (`/colaboradores`).

Funcionalidades:
- Lista todos os colaboradores ativos (vindos de `team_members` + candidatos com etapa `approved`)
- Filtros: por **nome**, **email** e **área/departamento**
- Cards/tabela mostrando: foto/inicial, nome, email, cargo, área, data de admissão, status, e **currículo (PDF/DOC)**
- Botão **"Enviar currículo"** em cada colaborador → faz upload para o storage e fica disponível para download/visualização
- Botão **"Adicionar colaborador"** com formulário (nome, email, cargo, área)

## Detalhes técnicos

**Banco de dados (migrações):**
- `candidates`: adicionar coluna `termination_reason TEXT`
- Nova tabela `employees`:
  - `id, owner_id, user_id (opcional), name, email, role/cargo, department/area, hire_date, status, resume_url, avatar_url, phone, notes, timestamps`
  - RLS: dono da conta gerencia tudo
- Bucket de storage **`employee-resumes`** (privado) com RLS para upload/leitura pelo dono

**Frontend:**
- `src/pages/TimeClockPage.tsx`: instrução "Salvar na tela inicial"
- `src/pages/SettingsPage.tsx`: nova seção "Acesso ao Ponto" com QR Code (lib `qrcode.react`) + botão WhatsApp
- `src/pages/Candidates.tsx`: nova aba `Tabs` "Pipeline" / "Desligados", com select de motivo e filtro
- `src/pages/TimeClockAdminPage.tsx`: botão "Exportar PDF" (jspdf landscape) + totais Crédito/Débito/Saldo no rodapé
- `src/lib/timeSheet.ts`: incluir totais no PDF do espelho
- Nova página `src/pages/EmployeesPage.tsx` + hook `useEmployees.ts`
- `src/components/AppSidebar.tsx`: adicionar item "Colaboradores"
- `src/App.tsx`: nova rota `/colaboradores`

**Dependência nova:** `qrcode.react` para gerar o QR Code.

# Plano de implementação

## 1. Remover "Continuar com Google" da tela de login

Em `src/pages/AuthPage.tsx`:
- Remover o botão "Continuar com Google", o divisor "ou" e o handler `handleGoogle`.
- Remover o import de `lovable`.

## 2. Adicionar "Esqueci minha senha" (em português)

Tudo em português, com mensagens claras de feedback.

**Em `src/pages/AuthPage.tsx` (aba Entrar):**
- Adicionar link "Esqueci minha senha" abaixo do campo de senha.
- Ao clicar, abre um diálogo (Dialog do shadcn) pedindo o e-mail.
- Ao enviar, chama:
  ```ts
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`
  })
  ```
- Toast: "Enviamos um link de redefinição para seu e-mail. Confira sua caixa de entrada (e o spam)."

**Nova página `src/pages/ResetPasswordPage.tsx`** (rota pública `/redefinir-senha`):
- Detecta a sessão de recovery automaticamente (Supabase trata o token na URL).
- Formulário com "Nova senha" + "Confirmar nova senha" (mín. 6 caracteres).
- Ao enviar: `supabase.auth.updateUser({ password })`.
- Sucesso: toast "Senha atualizada com sucesso!" → redireciona para `/auth`.
- Erro: mensagens em PT ("Senha muito curta", "As senhas não coincidem", "Link expirado, solicite um novo").

**Registrar a rota** em `src/App.tsx` (fora do `ProtectedRoute`).

## 3. Cadastro simplificado de colaborador via QR Code

Hoje o QR Code (`/ponto`) leva ao login padrão do sistema. Vamos criar uma rota dedicada que reconhece o colaborador pelo e-mail já cadastrado na tabela `employees` da empresa.

### Como vai funcionar (fluxo do colaborador)
1. Colaborador escaneia o QR Code → abre `/ponto/acesso?empresa=<owner_id>` (o link no `SettingsPage` será atualizado para incluir o `owner_id` da empresa logada).
2. Tela "Acesso do Colaborador" pede **apenas o e-mail**.
3. Sistema verifica via Edge Function se esse e-mail existe na tabela `employees` daquela empresa:
   - **Não existe** → mensagem "E-mail não cadastrado. Procure o RH da sua empresa."
   - **Existe e ainda não tem login** → tela "Crie sua senha" (apenas senha + confirmar). Cria a conta auth com esse e-mail e vincula automaticamente.
   - **Existe e já tem login** → tela "Digite sua senha" (login normal).
4. Após autenticar, redireciona direto para `/ponto` (a tela de bater ponto que já existe).
5. Mensagem na tela explicando como adicionar à tela inicial do celular (já existe em SettingsPage, replicar o resumo).

### Mudanças técnicas

**Nova Edge Function `employee-access`** (pública, `verify_jwt = false`):
- Input: `{ email, owner_id, action: "check" | "signup" | "login", password? }`
- `check`: usa `SERVICE_ROLE_KEY` para consultar `employees` filtrando por `owner_id` + `email`. Verifica se já existe usuário no auth com esse e-mail. Retorna `{ exists_in_company, has_account }`.
- `signup`: cria o usuário no auth (`admin.createUser`, com email confirmado) e devolve sucesso. O frontend faz `signInWithPassword` em seguida.
- Não retorna login direto — o frontend chama `supabase.auth.signInWithPassword` normalmente.

**Nova página `src/pages/EmployeeAccessPage.tsx`** (rota pública `/ponto/acesso`):
- Lê `?empresa=` da URL.
- 3 etapas: e-mail → (cria senha OU digita senha) → redireciona para `/ponto`.
- Tudo em português, design simples com card centralizado (mesmo estilo do AuthPage).

**Atualizar `SettingsPage.tsx`**:
- Trocar `pontoUrl` para incluir `?empresa=${user.id}` (precisa importar `useAuth`).
- Atualizar instruções: "1. Escaneia o QR Code → abre tela de acesso. 2. Digita o e-mail (que o RH cadastrou). 3. Cria a senha na primeira vez. 4. Bate o ponto."

**Atualizar `App.tsx`**:
- Adicionar rota pública `/ponto/acesso` (fora do `ProtectedRoute`).

**Pré-requisito UX**: a empresa precisa cadastrar o colaborador na aba **Colaboradores** com o e-mail antes do colaborador conseguir acessar. Isso já está implementado.

## 4. Como funciona o rastreamento de localização (explicação para você)

Não é rastreamento contínuo — é **verificação pontual no momento da batida**. Funciona assim:

**O que acontece tecnicamente:**
- Quando o colaborador abre a tela de bater ponto, o navegador pede permissão de localização (uma vez). Se ele negar, não consegue bater ponto.
- O navegador usa GPS (no celular) ou Wi-Fi/IP (no computador) para obter latitude e longitude **naquele instante**.
- O sistema calcula a distância em metros entre a posição dele e o endereço da empresa (cadastrado em `time_clock_settings`) usando a fórmula de Haversine.
- Se a distância for **menor ou igual ao raio permitido** (padrão 100m, configurável), a batida é marcada como `within_geofence: true` (dentro da área permitida).
- Se estiver fora, a batida ainda é registrada, mas marcada em vermelho no painel admin para você ver.
- A localização **não é salva entre batidas** — só o ponto exato no momento de cada batida (entrada, almoço, retorno, saída) fica gravado no banco.

**Precisão típica:**
- Celular ao ar livre: 5-20 metros (GPS).
- Celular em ambiente fechado: 20-100 metros.
- Computador: pode ser bem impreciso (pelo IP, às vezes erra por quilômetros).

**Recomendação:** raio de 100-200 metros funciona bem para escritórios. Se a empresa for grande (galpão, fábrica), pode aumentar para 300-500m.

**O que está configurável** em "Configurações → Ponto" (aba admin):
- Endereço do escritório (vira lat/lon).
- Raio permitido (em metros).
- Ligar/desligar a verificação de geofence.
- Exigir selfie ou não.

**Privacidade:** Você (admin) vê a localização de cada batida. O colaborador vê apenas as próprias batidas. A localização **nunca** é coletada quando ele não está com o app aberto.

## Arquivos afetados

- editar `src/pages/AuthPage.tsx` (remover Google, adicionar "esqueci senha")
- criar `src/pages/ResetPasswordPage.tsx`
- criar `src/pages/EmployeeAccessPage.tsx`
- editar `src/pages/SettingsPage.tsx` (URL com owner_id + instruções)
- editar `src/App.tsx` (registrar `/redefinir-senha` e `/ponto/acesso` como rotas públicas)
- criar `supabase/functions/employee-access/index.ts` + entrada em `supabase/config.toml` com `verify_jwt = false`

## Pontos a confirmar

- **OK remover totalmente o Google?** (você pediu, só confirmando que ninguém usa hoje).
- **Os e-mails de redefinição de senha vão sair em inglês** (template padrão da Lovable). Quer que eu configure também os templates de e-mail em português? Isso requer configurar um domínio de envio — posso fazer em uma próxima etapa se quiser.

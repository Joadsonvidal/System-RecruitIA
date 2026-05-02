# Painel Super Admin

## Confirmação sobre isolamento de dados
Cada empresa que se cadastra tem seu próprio `user_id`. Todas as tabelas (candidates, jobs, employees, time_clock_entries, etc.) já têm RLS filtrando por `auth.uid() = user_id` / `owner_id`. Uma empresa **nunca** vê dados de outra — garantido no nível do banco.

## O que será criado

### 1. Sistema de papéis (roles)
- Enum `app_role` com valores `super_admin` e `user`
- Tabela `user_roles` (separada do `profiles` para evitar escalonamento de privilégio)
- Função `has_role(user_id, role)` com `SECURITY DEFINER`
- Sua conta (**joadson.e.e.d@gmail.com**) recebe `super_admin` na migração

### 2. Status de contas
- Coluna `status` em `profiles`: `ativo` | `bloqueado`
- Política RLS extra: super_admin pode ler/atualizar todas as linhas de `profiles` e `user_roles`

### 3. Tabela de auditoria
- Nova tabela `admin_audit_log` (id, admin_id, target_user_id, target_email, action, details, created_at)
- RLS: apenas super_admin lê/insere

### 4. Edge Function `admin-manage-user`
Recebe ações privilegiadas usando `SUPABASE_SERVICE_ROLE_KEY`:
- Valida JWT e checa `has_role(uid, 'super_admin')`
- Ações suportadas:
  - `block` → `auth.admin.updateUserById(id, { ban_duration: '876000h' })` + `profiles.status = 'bloqueado'`
  - `unblock` → `ban_duration: 'none'` + `status = 'ativo'`
  - `delete` → `auth.admin.deleteUser(id)` (cascade apaga todos os dados via RLS)
  - `reset_password` → gera link de recuperação por e-mail
- Cada ação grava linha em `admin_audit_log`

### 5. Página `/admin` (rota protegida)

**Cards de resumo:** Total de contas, Ativas, Bloqueadas, Novas no mês

**Tabela principal:**

```text
| Empresa/Nome | E-mail | Cadastro   | Status      | Ações                                          |
|--------------|--------|------------|-------------|------------------------------------------------|
| Acme         | a@x    | 12/03/2026 | Ativo       | [Bloquear] [Excluir] [Reset senha]            |
| Beta         | b@x    | 20/04/2026 | Bloqueado   | [Desbloquear] [Excluir] [Reset senha]         |
```

- Filtro por status + busca por nome/e-mail
- Cada botão abre **diálogo de confirmação** antes de executar
- Excluir mostra aviso vermelho: "irreversível, apaga todos os dados"

**Aba "Histórico de ações":** lista cronológica do `admin_audit_log` (quem fez, em quem, qual ação, quando)

### 6. Itens de UI
- `useUserRole` hook (verifica se é super_admin)
- `RequireSuperAdmin` guard de rota
- Item "Super Admin" no sidebar (visível só para super_admin)

## Arquivos
**Migrações:** enum + `user_roles` + `has_role` + coluna `status` em profiles + `admin_audit_log` + RLS + INSERT do super_admin inicial

**Backend:** `supabase/functions/admin-manage-user/index.ts`

**Frontend novo:**
- `src/hooks/useUserRole.ts`
- `src/components/RequireSuperAdmin.tsx`
- `src/pages/AdminUsersPage.tsx`

**Frontend editado:**
- `src/App.tsx` (rota `/admin`)
- `src/components/AppSidebar.tsx` (item condicional)
- `src/hooks/useAuth.tsx` (bloquear sessão se `status = 'bloqueado'`)

Aprove para eu executar.

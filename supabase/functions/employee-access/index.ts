import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, owner_id, action, password } = await req.json();

    if (!email || !owner_id || !action) {
      return json({ error: "Parâmetros inválidos." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Verify employee belongs to this company
    const { data: employee, error: empErr } = await supabase
      .from("employees")
      .select("id, name, email, status")
      .eq("owner_id", owner_id)
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (empErr) return json({ error: empErr.message }, 500);
    if (!employee) {
      return json({
        error: "E-mail não cadastrado nesta empresa. Procure o RH para cadastrá-lo.",
      }, 404);
    }
    if (employee.status && employee.status !== "ativo") {
      return json({ error: "Colaborador inativo. Procure o RH." }, 403);
    }

    // 2. Look up if auth user exists with this email
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) return json({ error: listErr.message }, 500);
    const existing = list.users.find(
      (u) => u.email?.toLowerCase() === normalizedEmail,
    );

    if (action === "check") {
      return json({
        exists_in_company: true,
        has_account: !!existing,
        name: employee.name,
      });
    }

    if (action === "signup") {
      if (!password || String(password).length < 6) {
        return json({ error: "A senha deve ter pelo menos 6 caracteres." }, 400);
      }
      if (existing) {
        return json({ error: "Já existe uma conta com este e-mail. Faça login." }, 409);
      }
      const { error: createErr } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { display_name: employee.name },
      });
      if (createErr) return json({ error: createErr.message }, 500);
      return json({ ok: true });
    }

    return json({ error: "Ação inválida." }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Erro inesperado." }, 500);
  }
});

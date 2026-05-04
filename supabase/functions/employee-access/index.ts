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
    const { email, owner_id, action, password, otp } = await req.json();

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

    if (action === "send_otp") {
      if (existing) return json({ error: "E-mail já tem conta." }, 409);
      
      // Prevenção de Email Bombing / Rate Limit: 1 OTP a cada 60 segundos
      const { data: recentOtps } = await supabase
        .from("employee_otps")
        .select("created_at")
        .eq("email", normalizedEmail)
        .gte("created_at", new Date(Date.now() - 60000).toISOString())
        .limit(1);
        
      if (recentOtps && recentOtps.length > 0) {
        return json({ error: "Aguarde 1 minuto antes de solicitar um novo código." }, 429);
      }

      // Criptografia forte para gerar PIN (Nunca usar Math.random para segurança)
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const pin = (100000 + (array[0] % 900000)).toString();
      
      // Salvar no DB com validade de 15 minutos
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await supabase.from("employee_otps").insert({
        email: normalizedEmail,
        otp_code: pin,
        expires_at: expiresAt
      });

      // Enviar e-mail usando a API Resend (se tiver configurada nas secrets, senão apenas finge sucesso para dev)
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "System-RecruitIA <no-reply@resend.dev>",
            to: [normalizedEmail],
            subject: "Seu código de acesso - Ponto Eletrônico",
            html: `<p>Olá ${employee.name},</p><p>Seu código de verificação é: <strong>${pin}</strong></p><p>Este código expira em 15 minutos.</p>`
          })
        });
      }

      return json({ ok: true, dev_pin: resendKey ? undefined : pin }); // retorna o pin no frontend só se não tiver resend (para facilitar seus testes)
    }

    if (action === "signup") {
      
      if (!password || String(password).length < 6) {
        return json({ error: "A senha deve ter pelo menos 6 caracteres." }, 400);
      }
      if (!otp || String(otp).length !== 6) {
        return json({ error: "Código de verificação inválido." }, 400);
      }
      if (existing) {
        return json({ error: "Já existe uma conta com este e-mail. Faça login." }, 409);
      }

      // Validar OTP
      const { data: otps } = await supabase
        .from("employee_otps")
        .select("*")
        .eq("email", normalizedEmail)
        .eq("otp_code", otp)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (!otps || otps.length === 0) {
         return json({ error: "Código inválido ou expirado." }, 400);
      }

      // Prevenção de Reuso: Deletar OTP imediatamente após a validação bem-sucedida
      await supabase.from("employee_otps").delete().eq("id", otps[0].id);

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

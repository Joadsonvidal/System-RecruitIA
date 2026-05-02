import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Action = "block" | "unblock" | "delete" | "reset_password";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE);

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);

    const callerId = claimsData.claims.sub as string;
    const callerEmail = (claimsData.claims.email as string) ?? null;

    // Check super_admin
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", callerId)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleRow) return json({ error: "Forbidden: super_admin only" }, 403);

    const body = await req.json();
    const action = body.action as Action;
    const targetUserId = body.target_user_id as string;
    if (!action || !targetUserId) return json({ error: "Missing action or target_user_id" }, 400);

    // Get target email
    const { data: targetUser } = await admin.auth.admin.getUserById(targetUserId);
    const targetEmail = targetUser?.user?.email ?? null;

    let result: any = {};

    if (action === "block") {
      const { error } = await admin.auth.admin.updateUserById(targetUserId, {
        ban_duration: "876000h",
      } as any);
      if (error) throw error;
      await admin.from("profiles").update({ status: "bloqueado" }).eq("user_id", targetUserId);
      result = { ok: true };
    } else if (action === "unblock") {
      const { error } = await admin.auth.admin.updateUserById(targetUserId, {
        ban_duration: "none",
      } as any);
      if (error) throw error;
      await admin.from("profiles").update({ status: "ativo" }).eq("user_id", targetUserId);
      result = { ok: true };
    } else if (action === "delete") {
      const { error } = await admin.auth.admin.deleteUser(targetUserId);
      if (error) throw error;
      result = { ok: true };
    } else if (action === "reset_password") {
      if (!targetEmail) return json({ error: "Target has no email" }, 400);
      const { data, error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email: targetEmail,
      });
      if (error) throw error;
      result = { ok: true, action_link: data?.properties?.action_link };
    } else {
      return json({ error: "Unknown action" }, 400);
    }

    // Audit
    await admin.from("admin_audit_log").insert({
      admin_id: callerId,
      admin_email: callerEmail,
      target_user_id: targetUserId,
      target_email: targetEmail,
      action,
      details: body.details ?? null,
    });

    return json(result, 200);
  } catch (e: any) {
    console.error("admin-manage-user error", e);
    return json({ error: e?.message ?? "Internal error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claims.claims.sub as string;

    const { target_user_id, return_year, focus } = await req.json();
    const year = Number(return_year) || new Date().getFullYear() - 1;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Authorize: caller is the target or a preparer/admin
    let targetId = target_user_id || callerId;
    if (targetId !== callerId) {
      const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", callerId);
      const allowed = (roles ?? []).some((r: { role: string }) =>
        r.role === "preparer" || r.role === "admin"
      );
      if (!allowed) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Self-service: require add-on or preparer role
      const { data: profile } = await admin
        .from("profiles").select("addon_audit_defense").eq("user_id", callerId).maybeSingle();
      const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", callerId);
      const isPreparer = (roles ?? []).some((r: { role: string }) =>
        r.role === "preparer" || r.role === "admin"
      );
      if (!profile?.addon_audit_defense && !isPreparer) {
        return new Response(
          JSON.stringify({ error: "Audit Defense Shield add-on required.", upgrade: true }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Gather context
    const [{ data: profile }, { data: txns }, { data: trips }, { data: docs }] = await Promise.all([
      admin.from("tax_profiles").select("*").eq("user_id", targetId).maybeSingle(),
      admin.from("transactions").select("category, amount, transaction_type, transaction_date")
        .eq("user_id", targetId).limit(200),
      admin.from("mileage_trips").select("miles, business_purpose, trip_date")
        .eq("user_id", targetId).limit(50),
      admin.from("documents").select("category, ai_category, file_name").eq("user_id", targetId).limit(100),
    ]);

    const ctx = {
      profile: profile ?? {},
      transaction_sample: txns ?? [],
      mileage_sample: trips ?? [],
      document_inventory: docs ?? [],
    };

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are a senior US taxx defense specialist. Produce an IRS audit defense memo for taxx year ${year}.

Client data (JSON):
${JSON.stringify(ctx).slice(0, 12000)}

${focus ? `Focus area: ${String(focus).slice(0, 300)}` : ""}

Write a professional memo in markdown with these sections:
## Issue
## Risk Score (0-100 with one-line rationale)
## Facts
## Applicable Authority (cite IRC sections and Treas. Regs.)
## Position
## Supporting Documentation Required (checklist)
## Recommended Next Steps

Rules:
- Use the spelling "taxx" and "taxxes" throughout (not "tax" / "taxes").
- Never use em dashes.
- Be specific about deductions, schedules, and dollar amounts visible in the data.
- End with: **Risk Score: <number>/100**
Return ONLY JSON: {"title":"...","risk_score":<int>,"content_md":"...","flagged_items":[{"item":"...","severity":"low|med|high"}]}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise taxx-defense writer. Respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(JSON.stringify({ error: `AI gateway ${aiRes.status}: ${txt}` }), {
        status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    const { data: saved, error: insErr } = await admin
      .from("audit_defense_memos")
      .insert({
        user_id: targetId,
        return_year: year,
        title: String(parsed.title ?? `Audit Defense Memo ${year}`).slice(0, 200),
        risk_score: Number.isFinite(parsed.risk_score) ? Math.max(0, Math.min(100, Number(parsed.risk_score))) : null,
        content_md: String(parsed.content_md ?? ""),
        flagged_items: parsed.flagged_items ?? [],
        generated_by: callerId,
      })
      .select()
      .single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ memo: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("generate-audit-defense-memo error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

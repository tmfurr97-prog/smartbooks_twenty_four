import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are a US taxx-document extraction engine. Given a document image or PDF, identify the form type and extract every printed field into structured JSON. Be precise with numbers (no commas). Use null for missing values. Never guess.`;

const SCHEMA = {
  type: "object",
  properties: {
    doc_type: {
      type: "string",
      enum: [
        "w2","1099-nec","1099-misc","1099-int","1099-div","1099-b","1099-r","1099-g","1099-k",
        "1098","1098-e","1098-t","k-1","ssa-1099","1095-a","brokerage-composite","other",
      ],
    },
    tax_year: { type: ["integer", "null"] },
    payer_name: { type: ["string", "null"] },
    payer_tin: { type: ["string", "null"] },
    recipient_name: { type: ["string", "null"] },
    recipient_tin: { type: ["string", "null"] },
    amounts: {
      type: "object",
      description: "Canonical money fields normalized: wages, federal_withholding, social_security_wages, social_security_tax, medicare_wages, medicare_tax, state_wages, state_withholding, nonemployee_compensation, interest_income, ordinary_dividends, qualified_dividends, gross_proceeds, cost_basis, mortgage_interest, student_loan_interest, tuition_paid, gross_distribution, taxable_amount, premium_tax_credit",
      additionalProperties: { type: ["number", "null"] },
    },
    box_fields: {
      type: "object",
      description: "Raw box-by-box capture, keyed by box number or label as printed",
      additionalProperties: true,
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["doc_type", "amounts", "box_fields", "confidence"],
  additionalProperties: false,
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
    const userId = claims.claims.sub as string;

    const { document_id } = await req.json();
    if (!document_id) {
      return new Response(JSON.stringify({ error: "document_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: doc, error: docErr } = await admin
      .from("documents")
      .select("id, user_id, storage_path, file_name, file_type")
      .eq("id", document_id)
      .maybeSingle();
    if (docErr || !doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorize: owner or preparer/admin
    if (doc.user_id !== userId) {
      const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId);
      const allowed = (roles ?? []).some((r: { role: string }) =>
        r.role === "preparer" || r.role === "admin"
      );
      if (!allowed) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get short-lived signed URL for the file
    const { data: signed, error: signErr } = await admin.storage
      .from("documents")
      .createSignedUrl(doc.storage_path, 60);
    if (signErr || !signed?.signedUrl) throw new Error("Could not sign document URL");

    // Fetch + base64 (Gemini via gateway requires inline base64 for non-public URLs)
    const fileRes = await fetch(signed.signedUrl);
    if (!fileRes.ok) throw new Error(`Could not download document (${fileRes.status})`);
    const buf = new Uint8Array(await fileRes.arrayBuffer());
    let b64 = "";
    const chunkSize = 32768;
    for (let i = 0; i < buf.length; i += chunkSize) {
      b64 += String.fromCharCode(...buf.subarray(i, i + chunkSize));
    }
    b64 = btoa(b64);
    const mime = doc.file_type || "application/octet-stream";

    const isImage = mime.startsWith("image/");
    const isPdf = mime === "application/pdf";

    const userContent: any[] = [
      { type: "text", text: `Extract every field from this taxx document. Filename: ${doc.file_name}` },
    ];
    if (isImage) {
      userContent.push({ type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } });
    } else if (isPdf) {
      userContent.push({
        type: "file",
        file: { filename: doc.file_name, file_data: `data:application/pdf;base64,${b64}` },
      });
    } else {
      // Fallback: still try as image_url, many providers accept generic
      userContent.push({ type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userContent },
        ],
        tools: [{
          type: "function",
          function: {
            name: "record_extraction",
            description: "Record extracted fields from a US taxx document",
            parameters: SCHEMA,
          },
        }],
        tool_choice: { type: "function", function: { name: "record_extraction" } },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(JSON.stringify({ error: `AI gateway ${aiRes.status}: ${txt}` }), {
        status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const argsStr = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(argsStr); } catch { parsed = {}; }

    const row = {
      document_id: doc.id,
      user_id: doc.user_id,
      doc_type: parsed.doc_type ?? "other",
      payer_name: parsed.payer_name ?? null,
      payer_tin: parsed.payer_tin ?? null,
      recipient_name: parsed.recipient_name ?? null,
      recipient_tin: parsed.recipient_tin ?? null,
      tax_year: parsed.tax_year ?? null,
      amounts: parsed.amounts ?? {},
      box_fields: parsed.box_fields ?? {},
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0))),
    };

    const { data: saved, error: upErr } = await admin
      .from("extracted_document_data")
      .upsert(row, { onConflict: "document_id" })
      .select()
      .single();
    if (upErr) throw upErr;

    // Auto-apply to taxx_profile if high confidence
    let appliedFields: string[] = [];
    if (row.confidence >= 0.85 && row.amounts && typeof row.amounts === "object") {
      const a = row.amounts as Record<string, number | null>;
      const patch: Record<string, number> = {};
      if (typeof a.wages === "number" && a.wages > 0) patch.income = a.wages;
      if (typeof a.federal_withholding === "number") patch.federal_tax_withheld = a.federal_withholding;
      if (typeof a.nonemployee_compensation === "number" && a.nonemployee_compensation > 0) {
        patch.self_employment_income = a.nonemployee_compensation;
      }
      if (Object.keys(patch).length > 0) {
        const { data: existing } = await admin
          .from("tax_profiles")
          .select("id, income, federal_tax_withheld, self_employment_income")
          .eq("user_id", doc.user_id)
          .maybeSingle();
        if (existing) {
          // Only fill empty/zero fields so we never overwrite manual edits
          const safe: Record<string, number> = {};
          for (const [k, v] of Object.entries(patch)) {
            if (!(existing as any)[k]) safe[k] = v;
          }
          if (Object.keys(safe).length > 0) {
            const { error: profErr } = await admin
              .from("tax_profiles").update(safe).eq("id", existing.id);
            if (!profErr) {
              appliedFields = Object.keys(safe);
              await admin.from("extracted_document_data")
                .update({ applied_to_profile: true })
                .eq("document_id", doc.id);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ extraction: saved, applied_fields: appliedFields }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("extract-full-document error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

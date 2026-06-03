import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// Fields the AI may populate on tax_profiles. Numeric fields have NOT NULL default 0;
// we only overwrite when current value is 0/empty so we never clobber user input.
const TEXT_FIELDS = [
  "ssn",
  "occupation",
  "phone",
  "address_line1",
  "address_line2",
  "city",
  "state",
  "zip",
  "spouse_first_name",
  "spouse_last_name",
  "spouse_ssn",
  "spouse_occupation",
  "business_name",
  "business_ein",
  "business_type",
  "business_code",
] as const;

const DATE_FIELDS = ["date_of_birth", "spouse_date_of_birth"] as const;

const NUMERIC_FIELDS = [
  "income",
  "expenses",
  "w2_wages",
  "federal_withholding",
  "state_withholding",
  "interest_income",
  "dividend_income",
  "qualified_dividends",
  "capital_gains",
  "unemployment_income",
  "social_security_income",
  "retirement_distributions",
  "other_income",
  "student_loan_interest",
  "ira_contributions",
  "hsa_contributions",
  "sep_solo_401k_contributions",
  "charitable_contributions",
  "medical_expenses",
  "state_local_taxes_paid",
  "mortgage_interest",
  "property_taxes",
  "dependent_care_expenses",
  "education_expenses",
  "estimated_tax_paid",
  "prior_year_agi",
] as const;

const ENUM_FIELDS = ["filing_status"] as const; // single | married_filing_jointly | married_filing_separately | head_of_household | qualifying_widow

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { document_id } = await req.json();
    if (!document_id) throw new Error("Missing document_id");

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id, user_id, file_name, file_type, storage_path, category, ai_category")
      .eq("id", document_id)
      .maybeSingle();
    if (docError || !doc) throw new Error("Document not found");
    if (doc.user_id !== user.id) throw new Error("Forbidden");

    const { data: blob, error: dlError } = await supabase.storage.from("documents").download(doc.storage_path);
    if (dlError || !blob) throw new Error("Failed to download file");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const mime = doc.file_type || blob.type || "application/octet-stream";
    const isImage = mime.startsWith("image/");
    const isPdf = mime === "application/pdf";
    const isText = mime.startsWith("text/") || mime === "application/json" || mime === "text/csv";

    const instruction = `File name: ${doc.file_name}\nUser-selected category: ${doc.ai_category || doc.category}\n\nExtract EVERYTHING you can from this document:\n1. All financial figures (totals + line items).\n2. Any personal identifying info (name, SSN, DOB, address, phone, occupation).\n3. Spouse info, dependents (with names/SSNs/DOBs/relationships if visible).\n4. Filing status if shown.\n5. Business info (name, EIN, business code).\n6. Banking/refund info if shown.\nIf a value is not present, leave it null. NEVER guess or invent values.`;

    let userContent: any;
    if (isImage || isPdf) {
      const b64 = arrayBufferToBase64(await blob.arrayBuffer());
      userContent = [
        { type: "text", text: instruction },
        { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
      ];
    } else if (isText) {
      const text = (await blob.text()).slice(0, 200_000);
      userContent = `${instruction}\n\nDocument contents:\n\n${text}`;
    } else {
      const b64 = arrayBufferToBase64(await blob.arrayBuffer());
      userContent = [
        { type: "text", text: instruction },
        { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
      ];
    }

    const numericProps = Object.fromEntries(NUMERIC_FIELDS.map((f) => [f, { type: "number" }]));
    const textProps = Object.fromEntries(TEXT_FIELDS.map((f) => [f, { type: "string" }]));
    const dateProps = Object.fromEntries(
      DATE_FIELDS.map((f) => [f, { type: "string", description: "YYYY-MM-DD" }]),
    );

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You extract structured data from US taxx documents (W-2, 1099, P&L, prior tax returns, receipts, IDs, etc.). Always call the extract tool. Never invent data. Numbers are USD with no symbols. Dates are YYYY-MM-DD. SSNs as 9 digits with dashes (XXX-XX-XXXX).",
          },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract",
              description: "Structured extraction of financial figures and tax profile fields",
              parameters: {
                type: "object",
                properties: {
                  document_type: { type: "string" },
                  period: { type: "string" },
                  entity_name: { type: "string" },
                  filing_status: {
                    type: "string",
                    enum: [
                      "single",
                      "married_filing_jointly",
                      "married_filing_separately",
                      "head_of_household",
                      "qualifying_widow",
                    ],
                  },
                  taxpayer_first_name: { type: "string" },
                  taxpayer_last_name: { type: "string" },
                  profile: {
                    type: "object",
                    description: "Tax profile field values found in the document. Omit unknown fields.",
                    properties: { ...textProps, ...dateProps, ...numericProps },
                    additionalProperties: false,
                  },
                  dependents: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        first_name: { type: "string" },
                        last_name: { type: "string" },
                        ssn: { type: "string" },
                        date_of_birth: { type: "string", description: "YYYY-MM-DD" },
                        relationship: { type: "string" },
                      },
                      required: ["first_name"],
                    },
                  },
                  totals: {
                    type: "object",
                    properties: {
                      revenue: { type: "number" },
                      gross_profit: { type: "number" },
                      total_expenses: { type: "number" },
                      operating_income: { type: "number" },
                      net_income: { type: "number" },
                      amount: { type: "number" },
                    },
                    additionalProperties: true,
                  },
                  line_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        amount: { type: "number" },
                        category: { type: "string" },
                      },
                      required: ["label", "amount"],
                    },
                  },
                  raw_text: { type: "string", description: "Readable text extracted, max 8000 chars" },
                  notes: { type: "string" },
                },
                required: ["document_type"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract" } },
      }),
    });

    if (!aiResponse.ok) {
      const txt = await aiResponse.text();
      console.error("AI error", aiResponse.status, txt);
      const status = aiResponse.status === 429 || aiResponse.status === 402 ? aiResponse.status : 500;
      return new Response(JSON.stringify({ error: `AI error ${aiResponse.status}` }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let extracted: any = null;
    if (toolCall?.function?.arguments) {
      try {
        extracted = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("parse error", e);
      }
    }
    if (!extracted) throw new Error("No structured data returned");

    const raw_text = (extracted.raw_text || "").slice(0, 20_000);
    delete extracted.raw_text;

    await supabase
      .from("documents")
      .update({ extracted_data: extracted, extracted_text: raw_text })
      .eq("id", document_id);

    // ===== Auto-fill tax_profiles (only empty/zero fields) =====
    const { data: profile } = await supabase
      .from("tax_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const updates: Record<string, unknown> = {};
    const filled: string[] = [];

    const isEmptyText = (v: unknown) => v === null || v === undefined || v === "";
    const isZeroNum = (v: unknown) => v === null || v === undefined || Number(v) === 0;

    const p = extracted.profile ?? {};

    for (const f of TEXT_FIELDS) {
      const incoming = p[f];
      if (typeof incoming === "string" && incoming.trim() && (!profile || isEmptyText((profile as any)[f]))) {
        updates[f] = incoming.trim();
        filled.push(f);
      }
    }
    for (const f of DATE_FIELDS) {
      const incoming = p[f];
      if (typeof incoming === "string" && /^\d{4}-\d{2}-\d{2}$/.test(incoming) && (!profile || isEmptyText((profile as any)[f]))) {
        updates[f] = incoming;
        filled.push(f);
      }
    }
    for (const f of NUMERIC_FIELDS) {
      const incoming = p[f];
      if (typeof incoming === "number" && incoming !== 0 && (!profile || isZeroNum((profile as any)[f]))) {
        updates[f] = incoming;
        filled.push(f);
      }
    }
    for (const f of ENUM_FIELDS) {
      const incoming = extracted[f];
      if (typeof incoming === "string" && (!profile || isEmptyText((profile as any)[f]) || (profile as any)[f] === "single")) {
        updates[f] = incoming;
        filled.push(f);
      }
    }

    // Dependents: only add if profile has none
    if (
      Array.isArray(extracted.dependents) &&
      extracted.dependents.length > 0 &&
      (!profile || !Array.isArray((profile as any).dependents) || (profile as any).dependents.length === 0)
    ) {
      updates.dependents = extracted.dependents;
      filled.push("dependents");
    }

    let profile_updated = false;
    if (Object.keys(updates).length > 0) {
      if (profile) {
        const { error: upErr } = await supabase.from("tax_profiles").update(updates).eq("user_id", user.id);
        if (upErr) console.error("profile update error", upErr);
        else profile_updated = true;
      } else {
        const { error: insErr } = await supabase
          .from("tax_profiles")
          .insert({ user_id: user.id, ...updates });
        if (insErr) console.error("profile insert error", insErr);
        else profile_updated = true;
      }
    }

    return new Response(
      JSON.stringify({
        extracted_data: extracted,
        profile_updated,
        filled_fields: filled,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("extract-document-data error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    // Download file from storage
    const { data: blob, error: dlError } = await supabase.storage.from("documents").download(doc.storage_path);
    if (dlError || !blob) throw new Error("Failed to download file");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const mime = doc.file_type || blob.type || "application/octet-stream";
    const isImage = mime.startsWith("image/");
    const isPdf = mime === "application/pdf";
    const isText =
      mime.startsWith("text/") ||
      mime === "application/json" ||
      mime === "text/csv";

    let userContent: any;

    if (isImage || isPdf) {
      const b64 = arrayBufferToBase64(await blob.arrayBuffer());
      userContent = [
        {
          type: "text",
          text: `File name: ${doc.file_name}\nCategory: ${doc.ai_category || doc.category}\n\nExtract all financial figures, dates, names, and key data points from this document. If it's a profit & loss / income statement, capture revenue, expenses (by line), gross profit, operating income, net income, and the period covered.`,
        },
        { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
      ];
    } else if (isText) {
      const text = (await blob.text()).slice(0, 200_000);
      userContent = `File name: ${doc.file_name}\nCategory: ${doc.ai_category || doc.category}\n\nDocument contents:\n\n${text}\n\nExtract all financial figures, dates, names, and key data points.`;
    } else {
      // Excel / docx — try as binary via image_url base64 (Gemini accepts many doc types)
      const b64 = arrayBufferToBase64(await blob.arrayBuffer());
      userContent = [
        {
          type: "text",
          text: `File name: ${doc.file_name}\nCategory: ${doc.ai_category || doc.category}\n\nExtract all financial figures, dates, names, and key data points.`,
        },
        { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
      ];
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You extract structured financial and identifying data from taxx documents (W-2, 1099, receipts, bank statements, P&L, balance sheets, etc.). Always call the extract_data tool. Use null for unknown fields. Currency amounts are numbers in USD (no symbols).",
          },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_data",
              description: "Structured data extracted from the document",
              parameters: {
                type: "object",
                properties: {
                  document_type: { type: "string", description: "Best label, e.g. 'Profit & Loss', 'W-2', 'Receipt'" },
                  period: { type: "string", description: "Date or period covered, e.g. '2025-01-01 to 2025-12-31'" },
                  entity_name: { type: "string", description: "Person or business this document concerns" },
                  totals: {
                    type: "object",
                    description: "Key totals found",
                    properties: {
                      revenue: { type: "number" },
                      gross_profit: { type: "number" },
                      total_expenses: { type: "number" },
                      operating_income: { type: "number" },
                      net_income: { type: "number" },
                      wages: { type: "number" },
                      federal_withholding: { type: "number" },
                      interest_income: { type: "number" },
                      dividends: { type: "number" },
                      amount: { type: "number", description: "Generic single amount (e.g. receipt total)" },
                    },
                    additionalProperties: true,
                  },
                  line_items: {
                    type: "array",
                    description: "Individual line items with amounts",
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
                  raw_text: { type: "string", description: "Full readable text extracted from the document (truncate to 8000 chars)" },
                  notes: { type: "string" },
                },
                required: ["document_type", "totals", "line_items"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_data" } },
      }),
    });

    if (!aiResponse.ok) {
      const txt = await aiResponse.text();
      console.error("AI error", aiResponse.status, txt);
      if (aiResponse.status === 429)
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (aiResponse.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
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

    const { error: updateError } = await supabase
      .from("documents")
      .update({ extracted_data: extracted, extracted_text: raw_text })
      .eq("id", document_id);
    if (updateError) throw updateError;

    return new Response(JSON.stringify({ extracted_data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-document-data error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

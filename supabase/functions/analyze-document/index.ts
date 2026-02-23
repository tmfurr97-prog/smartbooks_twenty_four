import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { file_name, file_size, file_type, file_hash } = await req.json();

    // 1. Duplicate detection — check if same hash exists for this user
    let isDuplicate = false;
    let duplicateOf: string | null = null;
    if (file_hash) {
      const { data: existing } = await supabase
        .from("documents")
        .select("id, file_name")
        .eq("file_hash", file_hash)
        .limit(1)
        .maybeSingle();
      if (existing) {
        isDuplicate = true;
        duplicateOf = existing.file_name;
      }
    }

    // 2. AI auto-sort & auto-name using tool calling
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a taxx document classifier. Given a file name, size, and type, determine:
1. The best category for this document
2. A clean, human-readable suggested name

Categories: w2, 1099, receipt, id, expense, bank_statement, tax_return, insurance, investment, other

For the suggested name, create something like "2025 W-2 - Employer Name" or "Receipt - Office Supplies Jan 2025" based on clues in the filename.`,
          },
          {
            role: "user",
            content: `File: "${file_name}", Size: ${file_size} bytes, Type: ${file_type}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_document",
              description: "Classify and suggest a name for a taxx document",
              parameters: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: ["w2", "1099", "receipt", "id", "expense", "bank_statement", "tax_return", "insurance", "investment", "other"],
                  },
                  suggested_name: { type: "string" },
                  confidence: { type: "number", description: "0-1 confidence score" },
                },
                required: ["category", "suggested_name", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_document" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error:", status, await aiResponse.text());
      // Fallback: return without AI classification
      return new Response(JSON.stringify({
        ai_category: "other",
        suggested_name: file_name,
        confidence: 0,
        is_duplicate: isDuplicate,
        duplicate_of: duplicateOf,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let classification = { category: "other", suggested_name: file_name, confidence: 0 };
    if (toolCall?.function?.arguments) {
      try {
        classification = JSON.parse(toolCall.function.arguments);
      } catch { /* use defaults */ }
    }

    return new Response(JSON.stringify({
      ai_category: classification.category,
      suggested_name: classification.suggested_name,
      confidence: classification.confidence,
      is_duplicate: isDuplicate,
      duplicate_of: duplicateOf,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze-document error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

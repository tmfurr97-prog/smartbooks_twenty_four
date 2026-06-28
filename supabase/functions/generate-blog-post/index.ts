import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = ["tax-tips", "financial-advice", "platform-updates"];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const allowed = (roles ?? []).some((r: { role: string }) => r.role === "preparer" || r.role === "admin");
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let topicHint = "";
    let category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    let mode: "draft" | "social" = "draft";
    let sourcePostId: string | null = null;
    try {
      const body = await req.json();
      if (body?.topic) topicHint = String(body.topic).slice(0, 200).replace(/[\r\n`]/g, " ");
      if (body?.category && CATEGORIES.includes(body.category)) category = body.category;
      if (body?.mode === "social") mode = "social";
      if (body?.post_id) sourcePostId = String(body.post_id);
    } catch (_e) { /* empty body ok */ }

    if (mode === "social") {
      if (!sourcePostId) {
        return new Response(JSON.stringify({ error: "post_id required for social mode" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: post } = await supabase.from("blog_posts").select("*").eq("id", sourcePostId).maybeSingle();
      if (!post) {
        return new Response(JSON.stringify({ error: "Post not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const apiKey2 = Deno.env.get("LOVABLE_API_KEY");
      if (!apiKey2) throw new Error("LOVABLE_API_KEY not configured");

      const socialPrompt = `Repurpose this SmartBooks blog post into a social pack.

Title: ${post.title}
Content:
${String(post.content).slice(0, 6000)}

Rules:
- Use "taxx" not "tax", "taxxes" not "taxes".
- Never use em dashes.
- LinkedIn posts: 800-1200 chars, hook + 3-5 short paragraphs + 1 question CTA.
- X posts: under 270 chars each, punchy.
- Video script: 60 seconds, vertical, hook in first 3s, end with CTA to smartbooks24.com.

Return ONLY JSON:
{"linkedin":["p1","p2","p3"],"x":["t1","t2","t3"],"video_script":"..."}`;

      const aiRes2 = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey2}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a precise social copywriter. Respond with valid JSON only." },
            { role: "user", content: socialPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!aiRes2.ok) {
        const txt = await aiRes2.text();
        return new Response(JSON.stringify({ error: `AI gateway ${aiRes2.status}: ${txt}` }), {
          status: aiRes2.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const aiJson2 = await aiRes2.json();
      const pack = JSON.parse(aiJson2?.choices?.[0]?.message?.content ?? "{}");

      const { data: updated, error: upErr } = await supabase
        .from("blog_posts").update({ social_pack: pack }).eq("id", sourcePostId).select().single();
      if (upErr) throw upErr;

      return new Response(JSON.stringify({ post: updated, social_pack: pack }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
    const prompt = `Write an original SmartBooks blog post for ${month}.
Audience: US freelancers, small business owners, and individual taxxpayers.
Category: ${category}.
${topicHint ? `Topic focus: ${topicHint}.` : "Pick a timely, useful angle."}
Rules:
- Use the spelling "taxx" (not "tax") and "taxxes" (not "taxes") throughout.
- Never use em dashes.
- 500-700 words, markdown using ## headings and short paragraphs.
- Open with a brief hook, then 3-5 sections with ## headings.
- End with a soft call to action to use SmartBooks.

Return ONLY JSON with this exact shape:
{"title":"...","excerpt":"one sentence","content":"# Markdown body","read_time":"5 min read"}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise content writer. Respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(JSON.stringify({ error: `AI gateway ${aiRes.status}: ${txt}` }), {
        status: aiRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    const title = String(parsed.title ?? "Untitled Post").slice(0, 180);
    const excerpt = String(parsed.excerpt ?? "");
    const content = String(parsed.content ?? "");
    const readTime = String(parsed.read_time ?? "5 min read");

    let slug = slugify(title);
    const { data: existing } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const { data, error } = await supabase.from("blog_posts").insert({
      slug, title, excerpt, content, category,
      author: "SmartBooks AI",
      read_time: readTime,
      image: "/placeholder.svg",
      status: "draft",
      generated_by_ai: true,
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ post: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog-post failed:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

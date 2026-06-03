import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require shared secret — only the scheduler may invoke this function.
  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(reminderDate.getDate() + 14);
    const reminderDateStr = reminderDate.toISOString().split("T")[0];

    // Restrict reminders to small business users (have a business profile)
    const { data: bizProfiles, error: bizErr } = await supabase
      .from("tax_profiles")
      .select("user_id")
      .not("business_name", "is", null);

    if (bizErr) {
      console.error("Error fetching business profiles:", bizErr);
      return new Response(JSON.stringify({ error: bizErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const businessUserIds = Array.from(new Set((bizProfiles || []).map((p: any) => p.user_id))).filter(Boolean);

    if (businessUserIds.length === 0) {
      console.log("No small business users found; skipping.");
      return new Response(JSON.stringify({ success: true, reminders_sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find unpaid payments due within 14 days that haven't been reminded
    const { data: payments, error } = await supabase
      .from("estimated_tax_payments")
      .select("*")
      .eq("status", "pending")
      .eq("reminder_sent", false)
      .lte("due_date", reminderDateStr)
      .gte("due_date", today.toISOString().split("T")[0])
      .in("user_id", businessUserIds);

    if (error) {
      console.error("Error fetching payments:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${payments?.length || 0} payments needing reminders`);


    let remindersSent = 0;

    for (const payment of payments || []) {
      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(payment.user_id);
      if (!userData?.user?.email) continue;

      const quarterLabel = `Q${payment.quarter}`;
      const dueDate = new Date(payment.due_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      console.log(
        `Reminder: ${userData.user.email} — ${quarterLabel} ${payment.year}, $${payment.estimated_amount} due ${dueDate}`
      );

      // Mark reminder as sent
      await supabase
        .from("estimated_tax_payments")
        .update({ reminder_sent: true })
        .eq("id", payment.id);

      remindersSent++;
    }

    return new Response(
      JSON.stringify({ success: true, reminders_sent: remindersSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

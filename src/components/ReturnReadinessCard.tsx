import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  computeReturnPreview,
  type ComputeInputs,
} from "@/lib/returnPreview";

export default function ReturnReadinessCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [confidence, setConfidence] = useState(0);
  const [refund, setRefund] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [profileRes, txRes, docsRes, mileRes] = await Promise.all([
        supabase.from("tax_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("transactions").select("amount,is_tax_deductible").eq("user_id", user.id),
        supabase.from("documents").select("category").eq("user_id", user.id),
        supabase.from("mileage_trips").select("id").eq("user_id", user.id),
      ]);

      const profile = profileRes.data;
      const inputs: ComputeInputs = {
        taxYear: 2026,
        income: Number(profile?.income ?? 0),
        expenses: Number(profile?.expenses ?? 0),
        mileage: Number(profile?.mileage ?? 0),
        homeOfficeDeduction: Number(profile?.home_office_deduction ?? 0),
        withholding: 0,
        estimatedPayments: 0,
        cryptoGains: 0,
        filingStatus: (profile?.filing_status as ComputeInputs["filingStatus"]) ?? "single",
        incomeDocCount: (docsRes.data ?? []).filter((d) =>
          d.category ? /1099|w-?2|income/i.test(d.category) : false
        ).length,
        expenseDocCount: (docsRes.data ?? []).filter((d) =>
          d.category ? /receipt|expense/i.test(d.category) : false
        ).length,
        transactionCount: (txRes.data ?? []).length,
        mileageTripCount: (mileRes.data ?? []).length,
      };

      const result = computeReturnPreview(inputs);
      setConfidence(result.confidenceOverall);
      setRefund(result.topLine.estimatedRefund);
      setLoading(false);
    })();
  }, [user?.id]);

  if (loading) return <Skeleton className="h-32 w-full" />;

  const isRefund = refund >= 0;

  return (
    <Card className="border-gold/30 bg-gradient-to-r from-gold/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between flex-wrap gap-3 text-foreground">
          <span className="flex items-center gap-2 font-heading text-lg">
            <TrendingUp className="w-5 h-5 text-gold" />
            Return Readiness
          </span>
          <span className="text-3xl font-heading font-bold text-foreground tabular-nums">{confidence}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={confidence} className="h-2" />
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-foreground">
            Live draft says you're tracking toward a{" "}
            <span className={`font-semibold ${isRefund ? "text-emerald-700" : "text-red-700"}`}>
              {isRefund ? "refund of " : "balance due of "}
              {Math.abs(refund).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
            </span>
          </p>
          <Button asChild size="sm" variant="outline" className="border-gold/40">
            <Link to="/dashboard/return-preview">Open Return Preview</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

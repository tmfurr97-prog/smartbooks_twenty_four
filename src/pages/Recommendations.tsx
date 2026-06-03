import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Lock, ArrowRight, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { generateRecommendations, type TaxxRecommendation } from "@/utils/recommendationEngine";
import type { TaxxProfile } from "@/types/taxProfile";
import { calculateTaxxProfile } from "@/utils/taxCalculator";

const PRIORITY_STYLES = {
  high: { className: "bg-red-500/15 text-red-700 border-red-500/30", Icon: AlertTriangle },
  medium: { className: "bg-amber-500/15 text-amber-700 border-amber-500/30", Icon: AlertCircle },
  low: { className: "bg-blue-500/15 text-blue-700 border-blue-500/30", Icon: Info },
};

export default function Recommendations() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [recs, setRecs] = useState<TaxxRecommendation[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from("tax_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);

      const roles = (rolesRes.data ?? []).map((r) => r.role as string);
      setHasProAccess(roles.includes("admin") || roles.includes("preparer"));

      const p = profileRes.data;
      const profile: TaxxProfile = calculateTaxxProfile({
        income: Number(p?.income ?? 0),
        expenses: Number(p?.expenses ?? 0),
        mileage: Number(p?.mileage ?? 0),
        homeOfficeDeduction: Number(p?.home_office_deduction ?? 0),
        filingStatus: (p?.filing_status as TaxxProfile["filingStatus"]) ?? "single",
        netProfit: 0,
        estimatedTaxLiability: 0,
        projectedRefund: 0,
      });

      setRecs(generateRecommendations(profile));
      setLoading(false);
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const visible = hasProAccess ? recs : recs.filter((r) => r.tier === "free");
  const hiddenCount = recs.length - visible.length;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-gold" />
          Recommendations
        </h1>
        <p className="text-foreground mt-1">
          Personalized taxx strategies based on your current numbers, updated every time your data changes.
        </p>
      </div>

      {!hasProAccess && hiddenCount > 0 && (
        <Card className="border-gold/40 bg-gradient-to-r from-gold/10 to-transparent">
          <CardContent className="flex items-center justify-between gap-4 py-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gold" />
              <div>
                <p className="font-heading font-semibold text-foreground">
                  {hiddenCount} more {hiddenCount === 1 ? "recommendation" : "recommendations"} available with Pro
                </p>
                <p className="text-sm text-foreground">
                  Unlock retirement, loss-year, and high-earner strategies tailored to your return.
                </p>
              </div>
            </div>
            <Button className="bg-gold hover:bg-gold/90 text-black gap-2">
              Upgrade to Pro
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {visible.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-foreground">
              No recommendations right now. Keep your taxx profile updated and we'll surface ideas as your situation changes.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {visible.map((r) => {
          const style = PRIORITY_STYLES[r.priority];
          return (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <CardTitle className="font-heading text-lg text-foreground">{r.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${style.className} gap-1`}>
                      <style.Icon className="w-3 h-3" />
                      {r.priority}
                    </Badge>
                    {r.tier !== "free" && (
                      <Badge className="bg-gold/20 text-foreground border-gold/40 capitalize">{r.tier}</Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-foreground pt-2">{r.message}</CardDescription>
              </CardHeader>
              {r.action && (
                <CardContent>
                  <Button variant="outline" size="sm">
                    {r.action}
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

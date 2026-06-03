import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCcw, FileText } from "lucide-react";
import {
  computeReturnPreview,
  type ScenarioInputs,
  type ReturnPreviewResult,
  type ComputeInputs,
} from "@/lib/returnPreview";
import { getEngagementVersionHash, ENGAGEMENT_SCOPE } from "@/lib/engagementLetter";
import EngagementLetterGate from "@/components/return-preview/EngagementLetterGate";
import PreparerCredentialsBanner, {
  type PreparerProfile,
} from "@/components/return-preview/PreparerCredentialsBanner";
import TopLineCard from "@/components/return-preview/TopLineCard";
import ScheduleCard from "@/components/return-preview/ScheduleCard";
import ScenarioPanel from "@/components/return-preview/ScenarioPanel";
import ProPaywallCard from "@/components/return-preview/ProPaywallCard";

const TAX_YEAR = 2026;

export default function ReturnPreview() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [versionHash, setVersionHash] = useState<string>("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [signing, setSigning] = useState(false);

  const [preparer, setPreparer] = useState<PreparerProfile | null>(null);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [computeInputs, setComputeInputs] = useState<ComputeInputs | null>(null);
  const [scenario, setScenario] = useState<ScenarioInputs>({});

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const hash = await getEngagementVersionHash();
      setVersionHash(hash);

      const [rolesRes, letterRes, prepRes, profileRes, txRes, docsRes, mileRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase
          .from("engagement_letters")
          .select("id")
          .eq("user_id", user.id)
          .eq("tax_year", TAX_YEAR)
          .eq("version_hash", hash)
          .maybeSingle(),
        supabase.from("preparer_profiles_public" as any).select("*").limit(1).maybeSingle(),
        supabase.from("tax_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("transactions")
          .select("amount,is_tax_deductible,category", { count: "exact" })
          .eq("user_id", user.id),
        supabase.from("documents").select("category", { count: "exact" }).eq("user_id", user.id),
        supabase.from("mileage_trips").select("distance_miles", { count: "exact" }).eq("user_id", user.id),
      ]);

      const roles = (rolesRes.data ?? []).map((r) => r.role as string);
      const isAdminOrPreparer = roles.includes("admin") || roles.includes("preparer");
      setHasProAccess(isAdminOrPreparer); // TODO: wire Stripe Pro tier here

      setAcknowledged(!!letterRes.data || isAdminOrPreparer);
      setPreparer((prepRes.data as PreparerProfile | null) ?? null);

      const profile = profileRes.data;
      const txs = txRes.data ?? [];
      const incomeTxs = txs.filter((t) => Number(t.amount) > 0 && !t.is_tax_deductible);
      const expenseTxs = txs.filter((t) => t.is_tax_deductible);

      const docs = docsRes.data ?? [];
      const incomeDocCats = ["W-2", "1099", "1099-NEC", "1099-K", "1099-MISC", "Income"];
      const incomeDocs = docs.filter((d) =>
        d.category ? incomeDocCats.some((c) => d.category!.toLowerCase().includes(c.toLowerCase())) : false
      );
      const expenseDocs = docs.filter((d) =>
        d.category ? ["receipt", "expense"].some((c) => d.category!.toLowerCase().includes(c)) : false
      );

      const mileageTrips = mileRes.data ?? [];

      setComputeInputs({
        taxYear: TAX_YEAR,
        income: Number(profile?.income ?? 0),
        expenses: Number(profile?.expenses ?? 0),
        mileage: Number(profile?.mileage ?? 0),
        homeOfficeDeduction: Number(profile?.home_office_deduction ?? 0),
        withholding: 0,
        estimatedPayments: 0,
        cryptoGains: 0,
        filingStatus: (profile?.filing_status as ComputeInputs["filingStatus"]) ?? "single",
        incomeDocCount: incomeDocs.length,
        expenseDocCount: expenseDocs.length,
        transactionCount: incomeTxs.length + expenseTxs.length,
        mileageTripCount: mileageTrips.length,
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Could not load preview", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const result: ReturnPreviewResult | null = useMemo(() => {
    if (!computeInputs) return null;
    return computeReturnPreview({ ...computeInputs, scenario: hasProAccess ? scenario : {} });
  }, [computeInputs, scenario, hasProAccess]);

  const handleAcknowledge = async (signatureName: string) => {
    if (!user) return;
    setSigning(true);
    try {
      const { error } = await supabase.from("engagement_letters").insert({
        user_id: user.id,
        preparer_id: preparer ? (preparer as PreparerProfile & { id?: string }).id ?? null : null,
        tax_year: TAX_YEAR,
        version_hash: versionHash,
        signature_name: signatureName,
        scope_json: JSON.parse(JSON.stringify(ENGAGEMENT_SCOPE)),
      });
      if (error) throw error;
      setAcknowledged(true);
      toast({ title: "Engagement signed", description: "Your draft return is ready." });
    } catch (err) {
      toast({ title: "Could not sign", description: String(err), variant: "destructive" });
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!acknowledged) {
    return (
      <div className="p-6">
        <EngagementLetterGate
          preparer={preparer}
          taxYear={TAX_YEAR}
          onAcknowledge={handleAcknowledge}
          submitting={signing}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-7 h-7 text-gold" />
            Return Preview
          </h1>
          <p className="text-foreground mt-1">
            A live draft that rebuilds itself every time a document or transaction lands in your account.
          </p>
        </div>
        <Button variant="outline" onClick={loadAll} className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Recalculate
        </Button>
      </div>

      <PreparerCredentialsBanner preparer={preparer} />

      {result && (
        <>
          <TopLineCard result={result} />
          <div className="grid lg:grid-cols-2 gap-4">
            {result.schedules.map((s) => (
              <ScheduleCard key={s.key} schedule={s} />
            ))}
          </div>

          {hasProAccess ? (
            <ScenarioPanel scenario={scenario} onChange={setScenario} />
          ) : (
            <ProPaywallCard />
          )}
        </>
      )}
    </div>
  );
}

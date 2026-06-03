import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, Save, TrendingDown, DollarSign, FileText, Lightbulb } from "lucide-react";
import { calculateTaxxProfile, MILEAGE_RATE } from "@/utils/taxCalculator";
import { generateRecommendations, type RecommendationPriority } from "@/utils/recommendationEngine";
import { createEmptyTaxxProfile, type FilingStatus, type TaxxProfile } from "@/types/taxProfile";

export default function TaxxProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<TaxxProfile>(() => createEmptyTaxxProfile(""));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("tax_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setProfile({
          ...createEmptyTaxxProfile(user.id),
          userId: user.id,
          filingStatus: data.filing_status as FilingStatus,
          income: Number(data.income),
          expenses: Number(data.expenses),
          mileage: Number(data.mileage),
          homeOfficeDeduction: Number(data.home_office_deduction),
        });
      } else {
        setProfile(createEmptyTaxxProfile(user.id));
      }
      setLoading(false);
    })();
  }, [user]);

  const calculated = calculateTaxxProfile(profile);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("tax_profiles").upsert(
      {
        user_id: user.id,
        filing_status: profile.filingStatus,
        income: profile.income,
        expenses: profile.expenses,
        mileage: profile.mileage,
        home_office_deduction: profile.homeOfficeDeduction,
      },
      { onConflict: "user_id" }
    );
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Taxx profile saved" });
    }
  };

  const update = <K extends keyof TaxxProfile>(key: K, value: TaxxProfile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Taxx Profile</h1>
        <p className="text-muted-foreground">
          Tell us about your year so we can estimate liability and surface deductions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold text-foreground">${calculated.netProfit.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Estimated Liability</p>
                <p className="text-2xl font-bold text-foreground">${calculated.estimatedTaxLiability.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Mileage Deduction</p>
                <p className="text-2xl font-bold text-foreground">
                  ${Math.round(profile.mileage * MILEAGE_RATE).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Filing Details
          </CardTitle>
          <CardDescription>Updates auto-recalculate liability above.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filing Status</Label>
              <Select
                value={profile.filingStatus}
                onValueChange={(v) => update("filingStatus", v as FilingStatus)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married Filing Jointly</SelectItem>
                  <SelectItem value="head_of_household">Head of Household</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="income">Annual Income ($)</Label>
              <Input
                id="income" type="number" value={profile.income || ""}
                onChange={(e) => update("income", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenses">Business Expenses ($)</Label>
              <Input
                id="expenses" type="number" value={profile.expenses || ""}
                onChange={(e) => update("expenses", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="home">Home Office Deduction ($)</Label>
              <Input
                id="home" type="number" value={profile.homeOfficeDeduction || ""}
                onChange={(e) => update("homeOfficeDeduction", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="mileage">Business Mileage (miles)</Label>
              <Input
                id="mileage" type="number" value={profile.mileage || ""}
                onChange={(e) => update("mileage", parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Applied at the IRS standard rate of ${MILEAGE_RATE.toFixed(2)}/mile.
              </p>
            </div>
          </div>

          <Separator />

          <Button onClick={save} disabled={saving || loading} variant="gold">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Taxx Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

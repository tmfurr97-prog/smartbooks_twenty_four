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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator, Save, TrendingDown, DollarSign, FileText, Lightbulb,
  User, Users, Briefcase, Landmark, Plus, Trash2, ShieldCheck,
} from "lucide-react";
import { calculateTaxxProfile, MILEAGE_RATE } from "@/utils/taxCalculator";
import { generateRecommendations, type RecommendationPriority } from "@/utils/recommendationEngine";
import { createEmptyTaxxProfile, type FilingStatus, type TaxxProfile } from "@/types/taxProfile";

interface Dependent {
  first_name: string;
  last_name: string;
  ssn: string;
  date_of_birth: string;
  relationship: string;
}

interface FullTaxxRecord extends TaxxProfile {
  // Personal
  ssn: string;
  date_of_birth: string;
  occupation: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip: string;
  // Spouse
  spouse_first_name: string;
  spouse_last_name: string;
  spouse_ssn: string;
  spouse_date_of_birth: string;
  spouse_occupation: string;
  // Dependents
  dependents: Dependent[];
  // Income
  w2_wages: number;
  federal_withholding: number;
  state_withholding: number;
  interest_income: number;
  dividend_income: number;
  qualified_dividends: number;
  capital_gains: number;
  unemployment_income: number;
  social_security_income: number;
  retirement_distributions: number;
  other_income: number;
  // Self-employment
  business_name: string;
  business_ein: string;
  business_type: string;
  business_code: string;
  // Deductions / adjustments
  student_loan_interest: number;
  ira_contributions: number;
  hsa_contributions: number;
  sep_solo_401k_contributions: number;
  charitable_contributions: number;
  medical_expenses: number;
  state_local_taxes_paid: number;
  mortgage_interest: number;
  property_taxes: number;
  // Credits
  dependent_care_expenses: number;
  education_expenses: number;
  // Payments
  estimated_tax_paid: number;
  prior_year_agi: number;
  // Refund
  refund_bank_name: string;
  refund_routing: string;
  refund_account: string;
  refund_account_type: string;
}

const blankDependent = (): Dependent => ({
  first_name: "", last_name: "", ssn: "", date_of_birth: "", relationship: "Child",
});

const createBlank = (userId: string): FullTaxxRecord => ({
  ...createEmptyTaxxProfile(userId),
  ssn: "", date_of_birth: "", occupation: "", phone: "",
  address_line1: "", address_line2: "", city: "", state: "", zip: "",
  spouse_first_name: "", spouse_last_name: "", spouse_ssn: "",
  spouse_date_of_birth: "", spouse_occupation: "",
  dependents: [],
  w2_wages: 0, federal_withholding: 0, state_withholding: 0,
  interest_income: 0, dividend_income: 0, qualified_dividends: 0,
  capital_gains: 0, unemployment_income: 0, social_security_income: 0,
  retirement_distributions: 0, other_income: 0,
  business_name: "", business_ein: "", business_type: "", business_code: "",
  student_loan_interest: 0, ira_contributions: 0, hsa_contributions: 0,
  sep_solo_401k_contributions: 0, charitable_contributions: 0,
  medical_expenses: 0, state_local_taxes_paid: 0, mortgage_interest: 0,
  property_taxes: 0, dependent_care_expenses: 0, education_expenses: 0,
  estimated_tax_paid: 0, prior_year_agi: 0,
  refund_bank_name: "", refund_routing: "", refund_account: "", refund_account_type: "checking",
});

const N = (v: unknown) => Number(v ?? 0);
const S = (v: unknown) => (v == null ? "" : String(v));

export default function TaxxProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<FullTaxxRecord>(() => createBlank(""));
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
      const base = createBlank(user.id);
      if (data) {
        const d = data as Record<string, unknown>;
        setProfile({
          ...base,
          filingStatus: (d.filing_status as FilingStatus) ?? "single",
          income: N(d.income),
          expenses: N(d.expenses),
          mileage: N(d.mileage),
          homeOfficeDeduction: N(d.home_office_deduction),
          ssn: S(d.ssn),
          date_of_birth: S(d.date_of_birth),
          occupation: S(d.occupation),
          phone: S(d.phone),
          address_line1: S(d.address_line1),
          address_line2: S(d.address_line2),
          city: S(d.city),
          state: S(d.state),
          zip: S(d.zip),
          spouse_first_name: S(d.spouse_first_name),
          spouse_last_name: S(d.spouse_last_name),
          spouse_ssn: S(d.spouse_ssn),
          spouse_date_of_birth: S(d.spouse_date_of_birth),
          spouse_occupation: S(d.spouse_occupation),
          dependents: Array.isArray(d.dependents) ? (d.dependents as Dependent[]) : [],
          w2_wages: N(d.w2_wages),
          federal_withholding: N(d.federal_withholding),
          state_withholding: N(d.state_withholding),
          interest_income: N(d.interest_income),
          dividend_income: N(d.dividend_income),
          qualified_dividends: N(d.qualified_dividends),
          capital_gains: N(d.capital_gains),
          unemployment_income: N(d.unemployment_income),
          social_security_income: N(d.social_security_income),
          retirement_distributions: N(d.retirement_distributions),
          other_income: N(d.other_income),
          business_name: S(d.business_name),
          business_ein: S(d.business_ein),
          business_type: S(d.business_type),
          business_code: S(d.business_code),
          student_loan_interest: N(d.student_loan_interest),
          ira_contributions: N(d.ira_contributions),
          hsa_contributions: N(d.hsa_contributions),
          sep_solo_401k_contributions: N(d.sep_solo_401k_contributions),
          charitable_contributions: N(d.charitable_contributions),
          medical_expenses: N(d.medical_expenses),
          state_local_taxes_paid: N(d.state_local_taxes_paid),
          mortgage_interest: N(d.mortgage_interest),
          property_taxes: N(d.property_taxes),
          dependent_care_expenses: N(d.dependent_care_expenses),
          education_expenses: N(d.education_expenses),
          estimated_tax_paid: N(d.estimated_tax_paid),
          prior_year_agi: N(d.prior_year_agi),
          refund_bank_name: S(d.refund_bank_name),
          refund_routing: S(d.refund_routing),
          refund_account: S(d.refund_account),
          refund_account_type: S(d.refund_account_type) || "checking",
        });
      } else {
        setProfile(base);
      }
      setLoading(false);
    })();
  }, [user]);

  const calculated = calculateTaxxProfile(profile);
  const recommendations = generateRecommendations(calculated);
  const priorityStyles: Record<RecommendationPriority, string> = {
    high: "bg-red-500/15 text-red-700 border-red-500/30",
    medium: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    low: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  };

  // Completeness for AI auto-fill (visual hint)
  const requiredFields: Array<keyof FullTaxxRecord> = [
    "ssn", "date_of_birth", "address_line1", "city", "state", "zip",
  ];
  const completedRequired = requiredFields.filter((k) => String(profile[k] ?? "").trim() !== "").length;
  const completeness = Math.round((completedRequired / requiredFields.length) * 100);

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
        ssn: profile.ssn || null,
        date_of_birth: profile.date_of_birth || null,
        occupation: profile.occupation || null,
        phone: profile.phone || null,
        address_line1: profile.address_line1 || null,
        address_line2: profile.address_line2 || null,
        city: profile.city || null,
        state: profile.state || null,
        zip: profile.zip || null,
        spouse_first_name: profile.spouse_first_name || null,
        spouse_last_name: profile.spouse_last_name || null,
        spouse_ssn: profile.spouse_ssn || null,
        spouse_date_of_birth: profile.spouse_date_of_birth || null,
        spouse_occupation: profile.spouse_occupation || null,
        dependents: profile.dependents as unknown as never,
        w2_wages: profile.w2_wages,
        federal_withholding: profile.federal_withholding,
        state_withholding: profile.state_withholding,
        interest_income: profile.interest_income,
        dividend_income: profile.dividend_income,
        qualified_dividends: profile.qualified_dividends,
        capital_gains: profile.capital_gains,
        unemployment_income: profile.unemployment_income,
        social_security_income: profile.social_security_income,
        retirement_distributions: profile.retirement_distributions,
        other_income: profile.other_income,
        business_name: profile.business_name || null,
        business_ein: profile.business_ein || null,
        business_type: profile.business_type || null,
        business_code: profile.business_code || null,
        student_loan_interest: profile.student_loan_interest,
        ira_contributions: profile.ira_contributions,
        hsa_contributions: profile.hsa_contributions,
        sep_solo_401k_contributions: profile.sep_solo_401k_contributions,
        charitable_contributions: profile.charitable_contributions,
        medical_expenses: profile.medical_expenses,
        state_local_taxes_paid: profile.state_local_taxes_paid,
        mortgage_interest: profile.mortgage_interest,
        property_taxes: profile.property_taxes,
        dependent_care_expenses: profile.dependent_care_expenses,
        education_expenses: profile.education_expenses,
        estimated_tax_paid: profile.estimated_tax_paid,
        prior_year_agi: profile.prior_year_agi,
        refund_bank_name: profile.refund_bank_name || null,
        refund_routing: profile.refund_routing || null,
        refund_account: profile.refund_account || null,
        refund_account_type: profile.refund_account_type || null,
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

  const update = <K extends keyof FullTaxxRecord>(key: K, value: FullTaxxRecord[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const setDep = (i: number, patch: Partial<Dependent>) =>
    setProfile((p) => ({
      ...p,
      dependents: p.dependents.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
    }));

  const addDep = () => setProfile((p) => ({ ...p, dependents: [...p.dependents, blankDependent()] }));
  const removeDep = (i: number) =>
    setProfile((p) => ({ ...p, dependents: p.dependents.filter((_, idx) => idx !== i) }));

  const isSpouseRequired = profile.filingStatus === "married";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Taxx Profile</h1>
          <p className="text-foreground">
            Complete data set used by AI to auto-populate your taxx return.
          </p>
        </div>
        <Badge className="bg-gold/15 text-foreground border-gold/40 gap-1">
          <ShieldCheck className="w-3 h-3" />
          AI Return-Ready: {completeness}%
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-foreground">Net Profit</p>
              <p className="text-2xl font-bold text-foreground">${calculated.netProfit.toLocaleString()}</p>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-sm text-foreground">Estimated Liability</p>
              <p className="text-2xl font-bold text-foreground">${calculated.estimatedTaxLiability.toLocaleString()}</p>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-sm text-foreground">Mileage Deduction</p>
              <p className="text-2xl font-bold text-foreground">
                ${Math.round(profile.mileage * MILEAGE_RATE).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="personal"><User className="w-4 h-4 mr-1" />Personal</TabsTrigger>
          <TabsTrigger value="household"><Users className="w-4 h-4 mr-1" />Household</TabsTrigger>
          <TabsTrigger value="income"><DollarSign className="w-4 h-4 mr-1" />Income</TabsTrigger>
          <TabsTrigger value="business"><Briefcase className="w-4 h-4 mr-1" />Self-Employment</TabsTrigger>
          <TabsTrigger value="deductions"><TrendingDown className="w-4 h-4 mr-1" />Deductions & Credits</TabsTrigger>
          <TabsTrigger value="refund"><Landmark className="w-4 h-4 mr-1" />Payments & Refund</TabsTrigger>
        </TabsList>

        {/* PERSONAL */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Used on Form 1040 header. Stored privately.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Social Security Number" value={profile.ssn} onChange={(v) => update("ssn", v)} placeholder="XXX-XX-XXXX" />
              <Field label="Date of Birth" type="date" value={profile.date_of_birth} onChange={(v) => update("date_of_birth", v)} />
              <Field label="Occupation" value={profile.occupation} onChange={(v) => update("occupation", v)} />
              <Field label="Phone" value={profile.phone} onChange={(v) => update("phone", v)} placeholder="(555) 555-5555" />
              <Field label="Address Line 1" value={profile.address_line1} onChange={(v) => update("address_line1", v)} className="md:col-span-2" />
              <Field label="Address Line 2" value={profile.address_line2} onChange={(v) => update("address_line2", v)} className="md:col-span-2" />
              <Field label="City" value={profile.city} onChange={(v) => update("city", v)} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="State" value={profile.state} onChange={(v) => update("state", v)} placeholder="CA" />
                <Field label="ZIP" value={profile.zip} onChange={(v) => update("zip", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HOUSEHOLD */}
        <TabsContent value="household" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-md">
                <Label>Filing Status</Label>
                <Select value={profile.filingStatus} onValueChange={(v) => update("filingStatus", v as FilingStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married Filing Jointly</SelectItem>
                    <SelectItem value="head_of_household">Head of Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {isSpouseRequired && (
            <Card>
              <CardHeader>
                <CardTitle>Spouse</CardTitle>
                <CardDescription>Required for joint returns.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name" value={profile.spouse_first_name} onChange={(v) => update("spouse_first_name", v)} />
                <Field label="Last Name" value={profile.spouse_last_name} onChange={(v) => update("spouse_last_name", v)} />
                <Field label="Spouse SSN" value={profile.spouse_ssn} onChange={(v) => update("spouse_ssn", v)} placeholder="XXX-XX-XXXX" />
                <Field label="Date of Birth" type="date" value={profile.spouse_date_of_birth} onChange={(v) => update("spouse_date_of_birth", v)} />
                <Field label="Occupation" value={profile.spouse_occupation} onChange={(v) => update("spouse_occupation", v)} className="md:col-span-2" />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dependents</CardTitle>
                <CardDescription>Children and qualifying relatives claimed on the return.</CardDescription>
              </div>
              <Button onClick={addDep} variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" />Add</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.dependents.length === 0 && (
                <p className="text-sm text-foreground">No dependents added.</p>
              )}
              {profile.dependents.map((dep, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-background">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Dependent {i + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeDep(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="First Name" value={dep.first_name} onChange={(v) => setDep(i, { first_name: v })} />
                    <Field label="Last Name" value={dep.last_name} onChange={(v) => setDep(i, { last_name: v })} />
                    <Field label="SSN" value={dep.ssn} onChange={(v) => setDep(i, { ssn: v })} />
                    <Field label="Date of Birth" type="date" value={dep.date_of_birth} onChange={(v) => setDep(i, { date_of_birth: v })} />
                    <div className="space-y-2 md:col-span-2">
                      <Label>Relationship</Label>
                      <Select value={dep.relationship} onValueChange={(v) => setDep(i, { relationship: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Child", "Stepchild", "Foster Child", "Sibling", "Parent", "Other Relative"].map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INCOME */}
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Income Sources</CardTitle>
              <CardDescription>Annual totals across all W-2s and 1099s.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumField label="W-2 Wages (Box 1)" value={profile.w2_wages} onChange={(v) => update("w2_wages", v)} />
              <NumField label="Federal Withholding (W-2 Box 2)" value={profile.federal_withholding} onChange={(v) => update("federal_withholding", v)} />
              <NumField label="State Withholding (W-2 Box 17)" value={profile.state_withholding} onChange={(v) => update("state_withholding", v)} />
              <NumField label="Self-Employment / 1099 Income" value={profile.income} onChange={(v) => update("income", v)} />
              <NumField label="Interest Income (1099-INT)" value={profile.interest_income} onChange={(v) => update("interest_income", v)} />
              <NumField label="Dividend Income (1099-DIV)" value={profile.dividend_income} onChange={(v) => update("dividend_income", v)} />
              <NumField label="Qualified Dividends" value={profile.qualified_dividends} onChange={(v) => update("qualified_dividends", v)} />
              <NumField label="Capital Gains (1099-B)" value={profile.capital_gains} onChange={(v) => update("capital_gains", v)} />
              <NumField label="Unemployment (1099-G)" value={profile.unemployment_income} onChange={(v) => update("unemployment_income", v)} />
              <NumField label="Social Security (SSA-1099)" value={profile.social_security_income} onChange={(v) => update("social_security_income", v)} />
              <NumField label="Retirement Distributions (1099-R)" value={profile.retirement_distributions} onChange={(v) => update("retirement_distributions", v)} />
              <NumField label="Other Income" value={profile.other_income} onChange={(v) => update("other_income", v)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* BUSINESS */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Self-Employment (Schedule C)</CardTitle>
              <CardDescription>Used to populate Schedule C and SE.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Business Name" value={profile.business_name} onChange={(v) => update("business_name", v)} />
              <Field label="EIN" value={profile.business_ein} onChange={(v) => update("business_ein", v)} placeholder="XX-XXXXXXX" />
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Select value={profile.business_type || ""} onValueChange={(v) => update("business_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Sole Proprietorship", "Single-Member LLC", "Multi-Member LLC", "S-Corp", "C-Corp", "Partnership"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Business / NAICS Code" value={profile.business_code} onChange={(v) => update("business_code", v)} placeholder="541211" />
              <NumField label="Total Business Expenses" value={profile.expenses} onChange={(v) => update("expenses", v)} />
              <NumField label="Home Office Deduction" value={profile.homeOfficeDeduction} onChange={(v) => update("homeOfficeDeduction", v)} />
              <div className="md:col-span-2">
                <NumField label="Business Mileage (miles)" value={profile.mileage} onChange={(v) => update("mileage", v)} />
                <p className="text-xs text-foreground mt-1">
                  Applied at the IRS standard rate of ${MILEAGE_RATE.toFixed(2)}/mile.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEDUCTIONS */}
        <TabsContent value="deductions">
          <Card>
            <CardHeader>
              <CardTitle>Adjustments, Deductions & Credits</CardTitle>
              <CardDescription>Itemized deductions and above-the-line adjustments.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumField label="Student Loan Interest (1098-E)" value={profile.student_loan_interest} onChange={(v) => update("student_loan_interest", v)} />
              <NumField label="Traditional IRA Contributions" value={profile.ira_contributions} onChange={(v) => update("ira_contributions", v)} />
              <NumField label="HSA Contributions" value={profile.hsa_contributions} onChange={(v) => update("hsa_contributions", v)} />
              <NumField label="SEP / Solo 401(k) Contributions" value={profile.sep_solo_401k_contributions} onChange={(v) => update("sep_solo_401k_contributions", v)} />
              <NumField label="Charitable Contributions" value={profile.charitable_contributions} onChange={(v) => update("charitable_contributions", v)} />
              <NumField label="Medical & Dental Expenses" value={profile.medical_expenses} onChange={(v) => update("medical_expenses", v)} />
              <NumField label="State & Local Taxes Paid (SALT)" value={profile.state_local_taxes_paid} onChange={(v) => update("state_local_taxes_paid", v)} />
              <NumField label="Mortgage Interest (1098)" value={profile.mortgage_interest} onChange={(v) => update("mortgage_interest", v)} />
              <NumField label="Property Taxes" value={profile.property_taxes} onChange={(v) => update("property_taxes", v)} />
              <NumField label="Dependent Care Expenses" value={profile.dependent_care_expenses} onChange={(v) => update("dependent_care_expenses", v)} />
              <NumField label="Education Expenses (1098-T)" value={profile.education_expenses} onChange={(v) => update("education_expenses", v)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS & REFUND */}
        <TabsContent value="refund">
          <Card>
            <CardHeader>
              <CardTitle>Payments & Refund Routing</CardTitle>
              <CardDescription>For direct deposit and underpayment calculations.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumField label="Estimated Taxx Already Paid" value={profile.estimated_tax_paid} onChange={(v) => update("estimated_tax_paid", v)} />
              <NumField label="Prior-Year AGI (for e-file ID)" value={profile.prior_year_agi} onChange={(v) => update("prior_year_agi", v)} />
              <Field label="Bank Name" value={profile.refund_bank_name} onChange={(v) => update("refund_bank_name", v)} />
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={profile.refund_account_type} onValueChange={(v) => update("refund_account_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="Routing Number" value={profile.refund_routing} onChange={(v) => update("refund_routing", v)} />
              <Field label="Account Number" value={profile.refund_account} onChange={(v) => update("refund_account", v)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end sticky bottom-4">
        <Button onClick={save} disabled={saving || loading} variant="gold" size="lg" className="shadow-lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Taxx Profile"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>
            Personalized guidance based on the numbers above. Informational only, not taxx advice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <p className="text-sm text-foreground">
              Add your income, expenses, and deductions above to see tailored suggestions.
            </p>
          ) : (
            <ul className="space-y-3">
              {recommendations.map((r) => (
                <li key={r.id} className="rounded-lg border border-border p-4 bg-background">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{r.title}</h3>
                    <div className="flex gap-2 shrink-0">
                      <Badge variant="outline" className={priorityStyles[r.priority]}>{r.priority}</Badge>
                      <Badge variant="secondary" className="uppercase text-xs">{r.tier}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{r.message}</p>
                  {r.action && <p className="text-xs font-medium text-primary mt-2">{r.action}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NumField({
  label, value, onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}

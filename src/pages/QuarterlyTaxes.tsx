import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, CheckCircle, Clock, AlertTriangle, DollarSign, CalendarDays } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

interface TaxPayment {
  id: string;
  year: number;
  quarter: number;
  due_date: string;
  estimated_amount: number;
  paid_amount: number | null;
  paid_date: string | null;
  status: string;
  reminder_sent: boolean;
}

const QUARTER_LABELS: Record<number, { label: string; period: string }> = {
  1: { label: "Q1", period: "Jan 1 – Mar 31" },
  2: { label: "Q2", period: "Apr 1 – May 31" },
  3: { label: "Q3", period: "Jun 1 – Aug 31" },
  4: { label: "Q4", period: "Sep 1 – Dec 31" },
};

function getDueDates(year: number) {
  return {
    1: `${year}-04-15`,
    2: `${year}-06-15`,
    3: `${year}-09-15`,
    4: `${year + 1}-01-15`,
  };
}

function getStatusBadge(payment: TaxPayment) {
  const today = new Date();
  const due = parseISO(payment.due_date);
  const daysUntil = differenceInDays(due, today);

  if (payment.status === "paid") {
    return <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
  }
  if (daysUntil < 0) {
    return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Overdue</Badge>;
  }
  if (daysUntil <= 14) {
    return <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30"><Clock className="w-3 h-3 mr-1" /> Due Soon</Badge>;
  }
  return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Upcoming</Badge>;
}

export default function QuarterlyTaxes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  const [annualIncome, setAnnualIncome] = useState("");
  const [annualExpenses, setAnnualExpenses] = useState("");
  const [taxRate, setTaxRate] = useState("25");
  const [payments, setPayments] = useState<TaxPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (user) fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("estimated_tax_payments")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", currentYear)
      .order("quarter");
    if (error) {
      toast({ title: "Error loading payments", description: error.message, variant: "destructive" });
    } else {
      setPayments((data as TaxPayment[]) || []);
    }
    setLoading(false);
  };

  const calculateAndCreate = async () => {
    if (!user) return;
    const income = parseFloat(annualIncome);
    const expenses = parseFloat(annualExpenses || "0");
    const rate = parseFloat(taxRate) / 100;

    if (isNaN(income) || income <= 0) {
      toast({ title: "Enter a valid income", variant: "destructive" });
      return;
    }

    setCalculating(true);
    const taxableIncome = Math.max(0, income - expenses);
    const annualTax = taxableIncome * rate;
    const quarterlyAmount = Math.round((annualTax / 4) * 100) / 100;
    const dueDates = getDueDates(currentYear);

    for (const q of [1, 2, 3, 4] as const) {
      const existing = payments.find((p) => p.quarter === q);
      if (existing) {
        await supabase
          .from("estimated_tax_payments")
          .update({ estimated_amount: quarterlyAmount })
          .eq("id", existing.id);
      } else {
        await supabase.from("estimated_tax_payments").insert({
          user_id: user.id,
          year: currentYear,
          quarter: q,
          due_date: dueDates[q],
          estimated_amount: quarterlyAmount,
        });
      }
    }

    toast({ title: "Quarterly estimates calculated", description: `$${quarterlyAmount.toLocaleString()} per quarter` });
    await fetchPayments();
    setCalculating(false);
  };

  const markAsPaid = async (payment: TaxPayment) => {
    const { error } = await supabase
      .from("estimated_tax_payments")
      .update({
        status: "paid",
        paid_amount: payment.estimated_amount,
        paid_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", payment.id);

    if (error) {
      toast({ title: "Error updating payment", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Q${payment.quarter} marked as paid` });
      fetchPayments();
    }
  };

  const totalEstimated = payments.reduce((s, p) => s + Number(p.estimated_amount), 0);
  const totalPaid = payments.reduce((s, p) => s + Number(p.paid_amount || 0), 0);
  const remaining = totalEstimated - totalPaid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Quarterly Estimated Taxes</h1>
        <p className="text-muted-foreground">Calculate and track your quarterly tax payments for {currentYear}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Estimated</p>
                <p className="text-2xl font-bold text-foreground">${totalEstimated.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-foreground">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-foreground">${remaining.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calculator */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Tax Calculator
          </CardTitle>
          <CardDescription>Enter your annual figures to estimate quarterly payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="income">Annual Income ($)</Label>
              <Input
                id="income"
                type="number"
                placeholder="100000"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenses">Annual Expenses ($)</Label>
              <Input
                id="expenses"
                type="number"
                placeholder="20000"
                value={annualExpenses}
                onChange={(e) => setAnnualExpenses(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Tax Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                placeholder="25"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
          </div>
          <Button className="mt-4" onClick={calculateAndCreate} disabled={calculating}>
            {calculating ? "Calculating..." : "Calculate Estimated Tax"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Payment Tracking */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Payment Schedule</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading payments...</p>
        ) : payments.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center text-muted-foreground">
              Use the calculator above to generate your quarterly payment schedule.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payments.map((payment) => {
              const qInfo = QUARTER_LABELS[payment.quarter];
              const daysUntil = differenceInDays(parseISO(payment.due_date), new Date());
              return (
                <Card key={payment.id} className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{qInfo.label} — {qInfo.period}</CardTitle>
                      {getStatusBadge(payment)}
                    </div>
                    <CardDescription>
                      Due: {format(parseISO(payment.due_date), "MMMM d, yyyy")}
                      {payment.status !== "paid" && daysUntil >= 0 && (
                        <span className="ml-2 text-xs">({daysUntil} days left)</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated</p>
                        <p className="text-xl font-bold text-foreground">${Number(payment.estimated_amount).toLocaleString()}</p>
                      </div>
                      {payment.status === "paid" ? (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Paid</p>
                          <p className="text-xl font-bold text-emerald-400">${Number(payment.paid_amount || 0).toLocaleString()}</p>
                          {payment.paid_date && (
                            <p className="text-xs text-muted-foreground">{format(parseISO(payment.paid_date), "MMM d, yyyy")}</p>
                          )}
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => markAsPaid(payment)}>
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

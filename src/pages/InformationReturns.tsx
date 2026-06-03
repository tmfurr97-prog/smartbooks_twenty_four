import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Send, RefreshCw, Plus } from "lucide-react";

type Row = any;

const empty = {
  taxx_year: new Date().getFullYear() - 1,
  payer_name: "",
  payer_ein: "",
  payer_address1: "",
  payer_city: "",
  payer_state: "",
  payer_zip: "",
  recipient_name: "",
  recipient_tin: "",
  recipient_tin_type: "SSN",
  recipient_address1: "",
  recipient_city: "",
  recipient_state: "",
  recipient_zip: "",
  recipient_email: "",
  nonemployee_compensation: 0,
  federal_tax_withheld: 0,
  state_tax_withheld: 0,
  state_code: "",
  state_id: "",
  environment: "sandbox" as "sandbox" | "production",
};

export default function InformationReturns() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("information_returns")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("information_returns").insert({
      ...form,
      user_id: user.id,
      form_type: "1099-NEC",
      status: "draft",
    });
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Draft saved" });
    setForm(empty);
    setOpen(false);
    load();
  };

  const submitToIRS = async (id: string) => {
    setBusy(id);
    const { data, error } = await supabase.functions.invoke("submit-information-return", {
      body: { returnId: id },
    });
    setBusy(null);
    if (error || data?.error) {
      toast({
        title: "Submission failed",
        description: error?.message || JSON.stringify(data?.detail ?? data?.error).slice(0, 300),
        variant: "destructive",
      });
    } else {
      toast({ title: "Submitted to TaxBandits" });
    }
    load();
  };

  const checkStatus = async (id: string) => {
    setBusy(id);
    const { data, error } = await supabase.functions.invoke("check-information-return-status", {
      body: { returnId: id },
    });
    setBusy(null);
    if (error) {
      toast({ title: "Status check failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Status: ${data?.status ?? "unknown"}` });
    }
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Information Returns</h1>
          <p className="text-muted-foreground">File 1099-NEC forms through TaxBandits.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />New 1099-NEC</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New 1099-NEC</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Taxx Year"><Input type="number" value={form.taxx_year} onChange={(e) => set("taxx_year", +e.target.value)} /></Field>
              <Field label="Environment">
                <Select value={form.environment} onValueChange={(v) => set("environment", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox (test)</SelectItem>
                    <SelectItem value="production">Production (live IRS)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <h3 className="col-span-2 font-semibold mt-2">Payer (you)</h3>
              <Field label="Business Name"><Input value={form.payer_name} onChange={(e) => set("payer_name", e.target.value)} /></Field>
              <Field label="EIN"><Input value={form.payer_ein} onChange={(e) => set("payer_ein", e.target.value)} placeholder="12-3456789" /></Field>
              <Field label="Address"><Input value={form.payer_address1} onChange={(e) => set("payer_address1", e.target.value)} /></Field>
              <Field label="City"><Input value={form.payer_city} onChange={(e) => set("payer_city", e.target.value)} /></Field>
              <Field label="State"><Input value={form.payer_state} onChange={(e) => set("payer_state", e.target.value)} maxLength={2} /></Field>
              <Field label="ZIP"><Input value={form.payer_zip} onChange={(e) => set("payer_zip", e.target.value)} /></Field>

              <h3 className="col-span-2 font-semibold mt-2">Recipient (contractor)</h3>
              <Field label="Recipient Name"><Input value={form.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} /></Field>
              <Field label="TIN Type">
                <Select value={form.recipient_tin_type} onValueChange={(v) => set("recipient_tin_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SSN">SSN</SelectItem>
                    <SelectItem value="EIN">EIN</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="TIN"><Input value={form.recipient_tin} onChange={(e) => set("recipient_tin", e.target.value)} /></Field>
              <Field label="Email (optional)"><Input value={form.recipient_email} onChange={(e) => set("recipient_email", e.target.value)} /></Field>
              <Field label="Address"><Input value={form.recipient_address1} onChange={(e) => set("recipient_address1", e.target.value)} /></Field>
              <Field label="City"><Input value={form.recipient_city} onChange={(e) => set("recipient_city", e.target.value)} /></Field>
              <Field label="State"><Input value={form.recipient_state} onChange={(e) => set("recipient_state", e.target.value)} maxLength={2} /></Field>
              <Field label="ZIP"><Input value={form.recipient_zip} onChange={(e) => set("recipient_zip", e.target.value)} /></Field>

              <h3 className="col-span-2 font-semibold mt-2">Amounts</h3>
              <Field label="Nonemployee Compensation ($)"><Input type="number" value={form.nonemployee_compensation} onChange={(e) => set("nonemployee_compensation", +e.target.value)} /></Field>
              <Field label="Federal Taxx Withheld ($)"><Input type="number" value={form.federal_tax_withheld} onChange={(e) => set("federal_tax_withheld", +e.target.value)} /></Field>
              <Field label="State Code (optional)"><Input value={form.state_code} onChange={(e) => set("state_code", e.target.value)} maxLength={2} /></Field>
              <Field label="State Payer ID"><Input value={form.state_id} onChange={(e) => set("state_id", e.target.value)} /></Field>
              <Field label="State Taxx Withheld ($)"><Input type="number" value={form.state_tax_withheld} onChange={(e) => set("state_tax_withheld", +e.target.value)} /></Field>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save Draft</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Filings</CardTitle></CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No filings yet. Create a draft to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Env</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.taxx_year}</TableCell>
                    <TableCell>{r.recipient_name}</TableCell>
                    <TableCell>${Number(r.nonemployee_compensation).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline">{r.environment}</Badge></TableCell>
                    <TableCell><Badge>{r.status}</Badge></TableCell>
                    <TableCell className="flex gap-2">
                      {r.status === "draft" && (
                        <Button size="sm" disabled={busy === r.id} onClick={() => submitToIRS(r.id)}>
                          <Send className="w-3 h-3 mr-1" />Submit
                        </Button>
                      )}
                      {r.submission_id && (
                        <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => checkStatus(r.id)}>
                          <RefreshCw className="w-3 h-3 mr-1" />Status
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ShieldAlert, Save, History, UserCog, Search } from "lucide-react";
import { format } from "date-fns";

interface ClientRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
}

interface TaxProfileRow {
  id: string;
  user_id: string;
  filing_status: string | null;
  income: number | null;
  expenses: number | null;
  mileage: number | null;
  home_office_deduction: number | null;
}

interface Correction {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  preparer_user_id: string;
  created_at: string;
}

const EDITABLE_FIELDS: Array<keyof TaxProfileRow> = [
  "filing_status",
  "income",
  "expenses",
  "mileage",
  "home_office_deduction",
];

const FIELD_LABELS: Record<string, string> = {
  filing_status: "Filing status",
  income: "Income",
  expenses: "Expenses",
  mileage: "Mileage",
  home_office_deduction: "Home office",
};

const FILING_STATUSES = [
  { value: "single", label: "Single" },
  { value: "married_joint", label: "Married, filing jointly" },
  { value: "married_separate", label: "Married, filing separately" },
  { value: "head_of_household", label: "Head of household" },
  { value: "qualifying_widow", label: "Qualifying widow(er)" },
];

export default function AdminConsole() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<TaxProfileRow | null>(null);
  const [draft, setDraft] = useState<Partial<TaxProfileRow>>({});
  const [reason, setReason] = useState("");
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [saving, setSaving] = useState(false);

  // Gate by role.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const roles = (data ?? []).map((r) => r.role as string);
      setAllowed(roles.includes("admin") || roles.includes("preparer"));
    })();
  }, [user?.id]);

  // Load client list.
  useEffect(() => {
    if (!allowed) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id,first_name,last_name")
        .order("first_name", { ascending: true });
      setClients(data ?? []);
    })();
  }, [allowed]);

  const loadClient = async (clientId: string) => {
    setSelectedId(clientId);
    setReason("");
    const [profRes, corrRes] = await Promise.all([
      supabase.from("tax_profiles").select("*").eq("user_id", clientId).maybeSingle(),
      supabase
        .from("admin_corrections")
        .select("*")
        .eq("client_user_id", clientId)
        .order("created_at", { ascending: false })
        .limit(25),
    ]);
    const p = (profRes.data as TaxProfileRow | null) ?? null;
    setProfile(p);
    setDraft(p ? { ...p } : { user_id: clientId });
    setCorrections((corrRes.data as Correction[] | null) ?? []);
  };

  const dirtyFields = EDITABLE_FIELDS.filter((f) => {
    const before = profile?.[f] ?? null;
    const after = draft?.[f] ?? null;
    return String(before ?? "") !== String(after ?? "");
  });

  const handleSave = async () => {
    if (!user || !selectedId || dirtyFields.length === 0) return;
    if (!reason.trim()) {
      toast({ title: "Add a reason", description: "Reason is required for the audit log.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {};
      for (const f of dirtyFields) updates[f] = draft[f] ?? null;

      const { error: upErr } = await supabase
        .from("tax_profiles")
        .upsert({ user_id: selectedId, ...updates }, { onConflict: "user_id" });
      if (upErr) throw upErr;

      const correctionRows = dirtyFields.map((f) => ({
        client_user_id: selectedId,
        preparer_user_id: user.id,
        table_name: "tax_profiles",
        field_name: f,
        old_value: profile?.[f] != null ? String(profile[f]) : null,
        new_value: draft[f] != null ? String(draft[f]) : null,
        reason: reason.trim(),
      }));
      const { error: corrErr } = await supabase.from("admin_corrections").insert(correctionRows);
      if (corrErr) throw corrErr;

      toast({ title: "Corrections saved", description: `${dirtyFields.length} field(s) updated and logged.` });
      await loadClient(selectedId);
    } catch (err) {
      toast({ title: "Save failed", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (allowed === null) {
    return <div className="p-6"><Skeleton className="h-32 w-full" /></div>;
  }
  if (!allowed) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-red-600 mx-auto" />
            <h2 className="font-heading text-xl font-bold text-foreground">Restricted area</h2>
            <p className="text-foreground">
              This console is available only to administrators and credentialed preparers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredClients = clients.filter((c) => {
    const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim().toLowerCase();
    return name.includes(search.toLowerCase()) || c.user_id.includes(search);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-2">
          <UserCog className="w-7 h-7 text-gold" />
          Admin Operations Console
        </h1>
        <p className="text-foreground mt-1">
          Correct a client's taxx numbers when the AI misreads a document. Every change is logged.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client list */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-foreground">Clients</CardTitle>
            <div className="relative mt-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground" />
              <Input
                placeholder="Search by name or ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[60vh] overflow-y-auto">
            {filteredClients.length === 0 && (
              <p className="text-sm text-foreground py-4 text-center">No clients found.</p>
            )}
            {filteredClients.map((c) => {
              const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.user_id.slice(0, 8);
              return (
                <button
                  key={c.user_id}
                  onClick={() => loadClient(c.user_id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedId === c.user_id
                      ? "bg-gold/20 text-foreground font-semibold"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Editor + audit log */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedId && (
            <Card>
              <CardContent className="py-10 text-center text-foreground">
                Select a client to view and edit their taxx profile.
              </CardContent>
            </Card>
          )}

          {selectedId && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg text-foreground">Taxx Profile</CardTitle>
                  <CardDescription className="text-foreground">
                    Edit any value the AI got wrong. Changes are written to <code>tax_profiles</code> and logged.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground">Filing status</Label>
                      <Select
                        value={(draft.filing_status as string) ?? ""}
                        onValueChange={(v) => setDraft({ ...draft, filing_status: v })}
                      >
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {FILING_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {(["income", "expenses", "mileage", "home_office_deduction"] as const).map((f) => (
                      <div key={f}>
                        <Label className="text-foreground">{FIELD_LABELS[f]}</Label>
                        <Input
                          type="number"
                          className="mt-1"
                          value={draft[f] != null ? String(draft[f]) : ""}
                          onChange={(e) =>
                            setDraft({ ...draft, [f]: e.target.value === "" ? null : Number(e.target.value) })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-foreground">Reason for change (required)</Label>
                    <Textarea
                      className="mt-1"
                      placeholder="e.g. AI read $4,210 on the 1099-NEC but the actual amount is $42,100."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="text-sm text-foreground">
                      {dirtyFields.length === 0
                        ? "No pending changes."
                        : `${dirtyFields.length} field${dirtyFields.length === 1 ? "" : "s"} pending: ${dirtyFields
                            .map((f) => FIELD_LABELS[f])
                            .join(", ")}`}
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={saving || dirtyFields.length === 0}
                      className="bg-gold hover:bg-gold/90 text-black gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save & Log"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
                    <History className="w-5 h-5 text-gold" />
                    Correction History
                  </CardTitle>
                  <CardDescription className="text-foreground">
                    Most recent 25 corrections for this client. Visible to the client too.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {corrections.length === 0 ? (
                    <p className="text-sm text-foreground py-4 text-center">No corrections recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {corrections.map((c) => (
                        <div key={c.id} className="border rounded-md p-3 text-sm">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <Badge variant="outline" className="text-foreground">
                              {FIELD_LABELS[c.field_name] ?? c.field_name}
                            </Badge>
                            <span className="text-xs text-foreground">
                              {format(new Date(c.created_at), "PP p")}
                            </span>
                          </div>
                          <p className="mt-2 text-foreground">
                            <span className="line-through text-red-700">{c.old_value ?? "(empty)"}</span>{" "}
                            →{" "}
                            <span className="text-emerald-700 font-semibold">{c.new_value ?? "(empty)"}</span>
                          </p>
                          {c.reason && <p className="mt-1 text-foreground italic">"{c.reason}"</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

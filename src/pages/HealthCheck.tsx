import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CheckStatus = "pending" | "ok" | "warning" | "error";

type CheckResult = {
  label: string;
  status: CheckStatus;
  message: string;
};

const tableChecks = [
  "profiles",
  "transactions",
  "documents",
  "messages",
  "mileage_trips",
  "vehicle_expenses",
  "estimated_tax_payments",
  "tax_professional_access",
  "user_roles",
];

const bucketChecks = ["documents", "receipts"];

const statusVariant: Record<CheckStatus, "default" | "secondary" | "destructive" | "outline"> = {
  ok: "default",
  warning: "secondary",
  error: "destructive",
  pending: "outline",
};

export default function HealthCheck() {
  const { user } = useAuth();
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);

  const runChecks = async () => {
    setRunning(true);
    const nextResults: CheckResult[] = [];

    const addResult = (label: string, status: CheckStatus, message: string) => {
      nextResults.push({ label, status, message });
    };

    // Auth check
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      addResult("Auth session", "error", sessionError.message);
    } else if (!sessionData.session) {
      addResult("Auth session", "warning", "No active session.");
    } else {
      addResult("Auth session", "ok", `Session active for ${sessionData.session.user.email ?? "user"}.`);
    }

    if (user?.id) {
      addResult("Auth user", "ok", `User id: ${user.id.slice(0, 8)}…`);
    } else {
      addResult("Auth user", "warning", "No user loaded.");
    }

    // Table checks
    for (const table of tableChecks) {
      const { error, count } = await (supabase.from(table as any) as any).select("id", { count: "exact", head: true });
      if (error) {
        addResult(`Table: ${table}`, "error", error.message);
      } else {
        addResult(`Table: ${table}`, "ok", `Reachable${typeof count === "number" ? ` (${count} rows)` : ""}`);
      }
    }

    // Bucket checks
    for (const bucket of bucketChecks) {
      const { error } = await supabase.storage.from(bucket).list("", { limit: 1 });
      if (error) {
        addResult(`Bucket: ${bucket}`, "error", error.message);
      } else {
        addResult(`Bucket: ${bucket}`, "ok", "Reachable");
      }
    }

    setResults(nextResults);
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Health Check</h1>
        <p className="text-muted-foreground">Run connectivity checks for your database tables and storage.</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Run Checks</CardTitle>
          <CardDescription>Tests connectivity to database tables and storage buckets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runChecks} disabled={running}>
            {running ? "Running checks…" : "Run Health Checks"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Errors usually indicate missing tables or RLS policies.</CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">No checks run yet.</p>
          ) : (
            <div className="space-y-3">
              {results.map((result, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-md border border-border bg-card px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{result.label}</span>
                    <span className="text-xs text-muted-foreground">{result.message}</span>
                  </div>
                  <Badge variant={statusVariant[result.status]}>{result.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

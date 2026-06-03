import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ConfidenceBadge from "./ConfidenceBadge";
import type { ReturnPreviewResult } from "@/lib/returnPreview";
import { TrendingDown, TrendingUp } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function TopLineCard({ result }: { result: ReturnPreviewResult }) {
  const refund = result.topLine.estimatedRefund;
  const isRefund = refund >= 0;

  return (
    <Card className="overflow-hidden border-gold/30">
      <div className="bg-gradient-to-br from-gold/10 via-background to-background p-6">
        <CardHeader className="p-0 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-foreground font-medium">Your {result.taxYear} Return</p>
              <CardTitle className="font-heading text-4xl mt-1 text-foreground">
                {isRefund ? "Estimated Refund" : "Estimated Owed"}
              </CardTitle>
            </div>
            <div className={`text-5xl font-heading font-bold ${isRefund ? "text-emerald-700" : "text-red-700"}`}>
              {isRefund ? "+" : ""}
              {fmt(refund)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center gap-3 mb-4">
            <Progress value={result.confidenceOverall} className="h-2 flex-1" />
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {result.confidenceOverall}% confidence
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[result.topLine.agi, result.topLine.taxableIncome, result.topLine.totalLiability, result.topLine.withholding].map(
              (line) => (
                <div key={line.label} className="flex items-center justify-between bg-card border rounded-lg p-3">
                  <div>
                    <p className="text-xs text-foreground font-medium">{line.label}</p>
                    <p className="font-heading text-xl font-semibold text-foreground tabular-nums">
                      {fmt(line.amount)}
                    </p>
                  </div>
                  <ConfidenceBadge confidence={line.confidence} />
                </div>
              )
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

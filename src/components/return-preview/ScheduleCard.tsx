import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ConfidenceBadge from "./ConfidenceBadge";
import type { ScheduleSection } from "@/lib/returnPreview";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function ScheduleCard({ schedule }: { schedule: ScheduleSection }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg text-foreground">{schedule.title}</CardTitle>
        <CardDescription className="text-foreground">{schedule.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.lines.map((line) => (
          <div key={line.label} className="flex items-start justify-between gap-3 py-1">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{line.label}</p>
              {line.note && <p className="text-xs text-foreground">{line.note}</p>}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ConfidenceBadge confidence={line.confidence} />
              <span className="font-semibold tabular-nums text-foreground w-24 text-right">{fmt(line.amount)}</span>
            </div>
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between pt-1">
          <p className="font-heading font-semibold text-foreground">{schedule.total.label}</p>
          <p className="font-heading text-xl font-bold tabular-nums text-foreground">{fmt(schedule.total.amount)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

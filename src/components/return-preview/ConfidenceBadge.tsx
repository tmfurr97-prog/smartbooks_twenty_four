import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleDashed, CircleOff } from "lucide-react";
import type { Confidence } from "@/lib/returnPreview";

const STYLES: Record<Confidence, { className: string; label: string; Icon: typeof CheckCircle2 }> = {
  verified: {
    className: "bg-emerald-600/15 text-emerald-700 border border-emerald-600/30",
    label: "Verified",
    Icon: CheckCircle2,
  },
  estimated: {
    className: "bg-amber-500/15 text-amber-700 border border-amber-500/30",
    label: "Estimated",
    Icon: CircleDashed,
  },
  missing: {
    className: "bg-red-500/15 text-red-700 border border-red-500/30",
    label: "Missing",
    Icon: CircleOff,
  },
};

export default function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const { className, label, Icon } = STYLES[confidence];
  return (
    <Badge variant="outline" className={`${className} gap-1 font-medium`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

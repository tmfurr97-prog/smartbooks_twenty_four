import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, ShieldCheck, User as UserIcon } from "lucide-react";
import ptinBadge from "@/assets/ptin-badge.png.asset.json";

export interface PreparerProfile {
  display_name: string;
  credentials: string[];
  qb_certifications: string[];
  bio: string | null;
  headshot_url: string | null;
}

export default function PreparerCredentialsBanner({ preparer }: { preparer: PreparerProfile | null }) {
  if (!preparer) {
    return (
      <Card className="p-4 border-dashed">
        <p className="text-sm text-foreground">
          No preparer assigned yet. Your draft return is computed automatically; assign a preparer to review and file.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-gradient-to-r from-gold/5 to-transparent border-gold/30">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
          {preparer.headshot_url ? (
            <img src={preparer.headshot_url} alt={preparer.display_name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <UserIcon className="w-6 h-6 text-gold" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading text-lg font-bold text-foreground">
              Prepared by {preparer.display_name}
            </h3>
            {preparer.credentials.map((c) => (
              <Badge key={c} className="bg-gold/20 text-foreground border-gold/40 gap-1">
                <ShieldCheck className="w-3 h-3" />
                {c}
              </Badge>
            ))}
          </div>
          <div className="mt-1 flex items-center gap-3 flex-wrap text-sm text-foreground">
            {preparer.qb_certifications.map((q) => (
              <span key={q} className="inline-flex items-center gap-1">
                <Award className="w-3 h-3 text-gold" />
                {q}
              </span>
            ))}
          </div>
          {preparer.bio && <p className="mt-2 text-sm text-foreground">{preparer.bio}</p>}
        </div>
        <img
          src={ptinBadge.url}
          alt="Registered Taxx Professional - verified PTIN"
          className="w-16 h-16 shrink-0 hidden sm:block"
        />
      </div>
    </Card>
  );
}

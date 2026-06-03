import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSignature, ShieldCheck } from "lucide-react";
import { ENGAGEMENT_SCOPE } from "@/lib/engagementLetter";
import type { PreparerProfile } from "./PreparerCredentialsBanner";

interface Props {
  preparer: PreparerProfile | null;
  taxYear: number;
  onAcknowledge: (signatureName: string) => Promise<void>;
  submitting?: boolean;
}

export default function EngagementLetterGate({ preparer, taxYear, onAcknowledge, submitting }: Props) {
  const [signatureName, setSignatureName] = useState("");
  const [agreed, setAgreed] = useState(false);

  const canSign = agreed && signatureName.trim().length >= 3 && !submitting;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-gold" />
            <CardTitle className="font-heading text-2xl text-foreground">
              {ENGAGEMENT_SCOPE.title}
            </CardTitle>
          </div>
          <CardDescription className="text-foreground">
            For taxx year {taxYear}. Please review and acknowledge before we generate your live Return Preview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {preparer && (
            <div className="flex items-start gap-3 bg-gold/5 border border-gold/30 rounded-lg p-3">
              <ShieldCheck className="w-5 h-5 text-gold mt-0.5 shrink-0" />
              <div className="text-sm text-foreground">
                <p className="font-semibold">{preparer.display_name}</p>
                <p>
                  {preparer.credentials.join(", ")}
                </p>
              </div>
            </div>
          )}

          <ScrollArea className="h-72 rounded-lg border p-4 bg-muted/30">
            <div className="space-y-4">
              {ENGAGEMENT_SCOPE.sections.map((s) => (
                <div key={s.heading}>
                  <h4 className="font-heading font-semibold text-foreground">{s.heading}</h4>
                  <p className="text-sm text-foreground mt-1">{s.body}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-start gap-3">
            <Checkbox id="agree" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} className="mt-1" />
            <Label htmlFor="agree" className="text-sm text-foreground leading-relaxed cursor-pointer">
              I have read and agree to the terms above. I authorize SmartBooks and the named preparer to use my uploaded
              records to prepare a draft return for review.
            </Label>
          </div>

          <div>
            <Label htmlFor="signature" className="text-sm font-medium text-foreground">
              Type your full legal name to sign
            </Label>
            <Input
              id="signature"
              className="mt-2 font-heading text-lg"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Your full legal name"
            />
            <p className="mt-1 text-xs text-foreground">
              Version {ENGAGEMENT_SCOPE.version} · timestamped and stored with your account
            </p>
          </div>

          <Button
            disabled={!canSign}
            onClick={() => onAcknowledge(signatureName.trim())}
            className="w-full bg-gold hover:bg-gold/90 text-black"
          >
            {submitting ? "Signing..." : "Sign and Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

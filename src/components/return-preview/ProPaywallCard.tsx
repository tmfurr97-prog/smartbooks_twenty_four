import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Save, SlidersHorizontal } from "lucide-react";

export default function ProPaywallCard() {
  return (
    <Card className="border-gold/40 bg-gradient-to-br from-gold/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold" />
          <CardTitle className="font-heading text-lg text-foreground">What-if scenarios are a Pro feature</CardTitle>
        </div>
        <CardDescription className="text-foreground">
          Model retirement contributions, mileage, and home-office changes against your live return.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3 text-sm text-foreground">
          <div className="flex items-start gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <span>Live SEP IRA, HSA, mileage and home-office sliders</span>
          </div>
          <div className="flex items-start gap-2">
            <Save className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <span>Save named scenarios and compare them side-by-side</span>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <span>See refund impact instantly as you adjust</span>
          </div>
        </div>
        <Button className="bg-gold hover:bg-gold/90 text-black w-full sm:w-auto">
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw } from "lucide-react";
import type { ScenarioInputs } from "@/lib/returnPreview";

interface Props {
  scenario: ScenarioInputs;
  onChange: (s: ScenarioInputs) => void;
  onSave?: (name: string, s: ScenarioInputs) => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function ScenarioPanel({ scenario, onChange, onSave }: Props) {
  const [name, setName] = useState("");

  const update = (patch: Partial<ScenarioInputs>) => onChange({ ...scenario, ...patch });

  return (
    <Card className="border-gold/30">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <CardTitle className="font-heading text-lg text-foreground">What-if Scenarios</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange({})} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
        <CardDescription className="text-foreground">
          Adjust the sliders and watch your return recalculate live.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-foreground">SEP IRA contribution</Label>
            <span className="font-mono text-sm text-foreground">{fmt(scenario.sepContribution ?? 0)}</span>
          </div>
          <Slider
            value={[scenario.sepContribution ?? 0]}
            onValueChange={([v]) => update({ sepContribution: v })}
            min={0}
            max={70000}
            step={500}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-foreground">HSA contribution</Label>
            <span className="font-mono text-sm text-foreground">{fmt(scenario.hsaContribution ?? 0)}</span>
          </div>
          <Slider
            value={[scenario.hsaContribution ?? 0]}
            onValueChange={([v]) => update({ hsaContribution: v })}
            min={0}
            max={8300}
            step={100}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-foreground">Additional business miles</Label>
            <span className="font-mono text-sm text-foreground">{(scenario.additionalMileage ?? 0).toLocaleString()} mi</span>
          </div>
          <Slider
            value={[scenario.additionalMileage ?? 0]}
            onValueChange={([v]) => update({ additionalMileage: v })}
            min={0}
            max={20000}
            step={100}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground">Home office deduction override</Label>
          <Input
            type="number"
            className="mt-2"
            placeholder="Leave blank to use current value"
            value={scenario.homeOfficeOverride ?? ""}
            onChange={(e) =>
              update({ homeOfficeOverride: e.target.value === "" ? undefined : Number(e.target.value) })
            }
          />
        </div>

        {onSave && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Input
              placeholder="Name this scenario (e.g. Max SEP)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              disabled={!name.trim()}
              onClick={() => {
                onSave(name.trim(), scenario);
                setName("");
              }}
              className="bg-gold hover:bg-gold/90 text-black"
            >
              Save
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

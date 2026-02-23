import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockForms = [
  { id: "1", form_type: "1040", tax_year: 2025, status: "ready" },
  { id: "2", form_type: "Schedule C", tax_year: 2025, status: "draft" },
];

const mockFilingHistory = [
  { id: "a", form: "1040", year: 2024, filed: "2025-04-10", status: "accepted", confirmation: "IRS-2025-0041234" },
  { id: "b", form: "Schedule C", year: 2024, filed: "2025-04-10", status: "accepted", confirmation: "IRS-2025-0041235" },
];

export default function EFile() {
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [step, setStep] = useState<"select" | "validate" | "sign" | "review">("select");
  const { toast } = useToast();

  const handleValidate = () => {
    setStep("validate");
    setTimeout(() => setStep("sign"), 1500);
  };

  const handleSign = () => {
    setStep("review");
  };

  const handleSubmit = () => {
    toast({ title: "E-File Submitted", description: "Your return has been submitted to the IRS." });
    setStep("select");
    setSelectedForm("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">IRS E-File</h1>
        <p className="text-muted-foreground">Electronically file your federal and state tax returns</p>
      </div>

      <Tabs defaultValue="file" className="space-y-4">
        <TabsList>
          <TabsTrigger value="file"><Send className="h-4 w-4 mr-2" />File Return</TabsTrigger>
          <TabsTrigger value="status"><CheckCircle className="h-4 w-4 mr-2" />Filing Status</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          {step === "select" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Select Tax Return</CardTitle>
                <CardDescription>Choose the tax return you want to e-file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedForm} onValueChange={setSelectedForm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tax form" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockForms.map((form) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.form_type} — {form.tax_year} ({form.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedForm && (
                  <Button onClick={handleValidate} className="w-full">Continue to Validation</Button>
                )}
              </CardContent>
            </Card>
          )}

          {step === "validate" && (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Clock className="w-10 h-10 mx-auto mb-3 text-primary animate-spin" />
                <p className="text-foreground font-medium">Validating your return…</p>
                <p className="text-sm text-muted-foreground mt-1">Checking for errors and missing fields</p>
              </CardContent>
            </Card>
          )}

          {step === "sign" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Electronic Signature</CardTitle>
                <CardDescription>Sign your return to authorize e-filing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Signature capture will be available when connected to live filing</p>
                </div>
                <Button onClick={handleSign} className="w-full">Sign & Continue</Button>
              </CardContent>
            </Card>
          )}

          {step === "review" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>Final review before submitting to the IRS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4 text-sm text-foreground space-y-2">
                  <p><strong>Form:</strong> {mockForms.find(f => f.id === selectedForm)?.form_type}</p>
                  <p><strong>Tax Year:</strong> 2025</p>
                  <p><strong>Status:</strong> Validated ✓</p>
                  <p><strong>Signature:</strong> Applied ✓</p>
                </div>
                <Button onClick={handleSubmit} className="w-full">Submit E-File</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="status">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Filing History</CardTitle>
              <CardDescription>Track the status of your e-filed returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFilingHistory.map((filing) => (
                  <div key={filing.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{filing.form} — {filing.year}</p>
                      <p className="text-xs text-muted-foreground">Filed {filing.filed} • {filing.confirmation}</p>
                    </div>
                    <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
                      <CheckCircle className="w-3 h-3 mr-1" />{filing.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

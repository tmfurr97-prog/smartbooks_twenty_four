import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function EFile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">IRS E-File</h1>
        <p className="text-muted-foreground">
          Electronic filing will be available after live filing integration is complete.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              Coming Soon
            </Badge>
            <CardTitle>Preparer Review Required</CardTitle>
          </div>
          <CardDescription>
            Returns cannot be submitted directly through SmartBooks yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-600/30 bg-amber-50/10 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-foreground">
                  E-file submission is not live yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your documents and return details can still be organized in SmartBooks, but final filing must be reviewed and submitted by a qualified tax preparer.
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="status" className="space-y-4">
            <TabsList>
              <TabsTrigger value="status">
                <Clock className="h-4 w-4 mr-2" />
                Filing Status
              </TabsTrigger>
              <TabsTrigger value="review">
                <FileText className="h-4 w-4 mr-2" />
                Review Process
              </TabsTrigger>
            </TabsList>

            <TabsContent value="status">
              <Card className="bg-background border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Current Status</CardTitle>
                  <CardDescription>
                    Filing is disabled until live IRS integration is completed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-amber-600/20 text-amber-700 border-amber-600/30">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Awaiting live filing setup
                  </Badge>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review">
              <Card className="bg-background border-border">
                <CardHeader>
                  <CardTitle className="text-lg">How filing will work</CardTitle>
                  <CardDescription>
                    SmartBooks will help organize documents before preparer review.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>1. Upload and organize your tax documents.</p>
                  <p>2. Review your return preview and checklist.</p>
                  <p>3. A preparer reviews your information before filing.</p>
                  <p>4. Live e-file submission will be enabled only after integration and compliance checks are complete.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button disabled className="w-full">
            <Send className="h-4 w-4 mr-2" />
            E-File Coming Soon
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

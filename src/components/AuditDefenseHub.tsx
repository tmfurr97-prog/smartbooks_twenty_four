import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Users, Clock } from "lucide-react";

const mockAuditTrail = [
  { id: 1, action: "Document uploaded", document: "W-2 Form", date: "2026-01-15", user: "You" },
  { id: 2, action: "Category verified", document: "1099-NEC", date: "2026-01-20", user: "AI System" },
  { id: 3, action: "Receipt matched", document: "Office Supplies Receipt", date: "2026-02-01", user: "AI System" },
  { id: 4, action: "Mileage log exported", document: "Q1 Mileage Report", date: "2026-02-10", user: "You" },
];

const mockCorrespondence: any[] = [];

export function AuditDefenseHub() {
  const [activeTab, setActiveTab] = useState("trail");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="trail"><Clock className="w-4 h-4 mr-2" />Audit Trail</TabsTrigger>
        <TabsTrigger value="correspondence"><Mail className="w-4 h-4 mr-2" />IRS Correspondence</TabsTrigger>
        <TabsTrigger value="team"><Users className="w-4 h-4 mr-2" />Defense Team</TabsTrigger>
      </TabsList>

      <TabsContent value="trail">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Complete Audit Trail</CardTitle>
            <CardDescription>Every action is logged for your protection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAuditTrail.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.action}</p>
                      <p className="text-xs text-muted-foreground">{entry.document}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                    <Badge variant="secondary" className="text-xs">{entry.user}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="correspondence">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>IRS Correspondence</CardTitle>
            <CardDescription>Track and respond to IRS letters</CardDescription>
          </CardHeader>
          <CardContent>
            {mockCorrespondence.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No active IRS correspondence — you're in good shape!</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Defense Team</CardTitle>
            <CardDescription>Professionals collaborating on your audit defense</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No audit defense team needed at this time.</p>
              <Button variant="outline" className="mt-4">Add Professional</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

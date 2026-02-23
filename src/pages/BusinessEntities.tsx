import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus, FileText, Users, DollarSign, Calendar, AlertTriangle } from "lucide-react";

const mockEntities = [
  {
    id: "1",
    name: "Acme Consulting LLC",
    type: "LLC",
    ein: "12-3456789",
    state: "California",
    status: "Active",
    formed: "2022-03-15",
    annualRevenue: 185000,
    filingType: "Schedule C",
  },
  {
    id: "2",
    name: "TechVenture Inc.",
    type: "S-Corp",
    ein: "98-7654321",
    state: "Delaware",
    status: "Active",
    formed: "2021-01-10",
    annualRevenue: 420000,
    filingType: "Form 1120-S",
  },
  {
    id: "3",
    name: "Sunrise Properties LP",
    type: "Partnership",
    ein: "55-1234567",
    state: "Texas",
    status: "Inactive",
    formed: "2019-06-22",
    annualRevenue: 0,
    filingType: "Form 1065",
  },
];

const mockFilings = [
  { entity: "Acme Consulting LLC", filing: "Annual Report", due: "2026-04-15", status: "Upcoming" },
  { entity: "TechVenture Inc.", filing: "Franchise Tax", due: "2026-03-01", status: "Due Soon" },
  { entity: "TechVenture Inc.", filing: "Form 1120-S", due: "2026-03-15", status: "Due Soon" },
  { entity: "Acme Consulting LLC", filing: "Schedule C", due: "2026-04-15", status: "Upcoming" },
];

export default function BusinessEntities() {
  const [tab, setTab] = useState("entities");

  const totalRevenue = mockEntities.reduce((s, e) => s + e.annualRevenue, 0);
  const activeCount = mockEntities.filter((e) => e.status === "Active").length;
  const dueSoon = mockFilings.filter((f) => f.status === "Due Soon").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Entities</h1>
          <p className="text-muted-foreground">Manage your business structures, EINs, and compliance filings.</p>
        </div>
        <Button variant="gold">
          <Plus className="w-4 h-4 mr-2" /> Add Entity
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{mockEntities.length}</p>
                <p className="text-xs text-muted-foreground">Total Entities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Combined Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{dueSoon}</p>
                <p className="text-xs text-muted-foreground">Filings Due Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="filings">Compliance Filings</TabsTrigger>
        </TabsList>

        <TabsContent value="entities">
          <Card>
            <CardHeader>
              <CardTitle>Your Entities</CardTitle>
              <CardDescription>All registered business entities linked to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>EIN</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Filing</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEntities.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>{e.type}</TableCell>
                      <TableCell className="font-mono text-xs">{e.ein}</TableCell>
                      <TableCell>{e.state}</TableCell>
                      <TableCell>{e.filingType}</TableCell>
                      <TableCell>
                        <Badge variant={e.status === "Active" ? "default" : "secondary"}>{e.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filings">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Filings</CardTitle>
              <CardDescription>Compliance deadlines for your entities.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Filing</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockFilings.map((f, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{f.entity}</TableCell>
                      <TableCell>{f.filing}</TableCell>
                      <TableCell>{new Date(f.due).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={f.status === "Due Soon" ? "destructive" : "outline"}>{f.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Download, RefreshCw, Database, AlertCircle, FileText } from "lucide-react";

const mockBackups = [
  { id: "1", backup_date: "2026-02-20T09:00:00Z", backup_type: "manual", total_records: 1247, file_size: "2.4 MB", status: "completed" },
  { id: "2", backup_date: "2026-02-13T09:00:00Z", backup_type: "automatic", total_records: 1198, file_size: "2.1 MB", status: "completed" },
  { id: "3", backup_date: "2026-02-06T09:00:00Z", backup_type: "automatic", total_records: 1150, file_size: "2.0 MB", status: "completed" },
];

export default function Backups() {
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      toast({ title: "Backup Created", description: "Successfully backed up 1,247 records" });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-3">
            <Database className="h-7 w-7 text-primary" />
            Database Backups
          </h1>
          <p className="text-muted-foreground mt-1">Export and download your tax data as CSV files</p>
        </div>
        <Button onClick={handleCreate} disabled={creating}>
          <Download className="h-4 w-4 mr-2" />
          {creating ? "Creating..." : "Create Backup"}
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Backups include all your receipts, vehicles, estimated tax payments, and tax forms.
          Files are stored securely and only accessible by you.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {mockBackups.map((backup) => (
          <Card key={backup.id} className="bg-card border-border">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(backup.backup_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {backup.total_records.toLocaleString()} records • {backup.file_size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{backup.backup_type}</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

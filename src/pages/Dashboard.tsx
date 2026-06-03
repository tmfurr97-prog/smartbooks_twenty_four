import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, MessageSquare, FileText, ExternalLink, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DocumentChecklist from "@/components/DocumentChecklist";
import ReturnReadinessCard from "@/components/ReturnReadinessCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const stats = [
  { icon: FileText, label: "Documents", value: "0", desc: "Uploaded" },
  { icon: MessageSquare, label: "Messages", value: "0", desc: "Unread" },
  { icon: Upload, label: "Pending", value: "0", desc: "Awaiting review" },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const greeting = profile?.first_name ? `Welcome, ${profile.first_name}` : "Welcome to the SmartHub";

  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">{greeting}</h1>
      <p className="text-foreground mb-8">Here's an overview of your taxx preparation progress.</p>

      <div className="mb-6">
        <ReturnReadinessCard />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="border-border hover:border-gold/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-foreground">{s.label}</CardTitle>
              <s.icon className="w-5 h-5 text-gold" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-foreground mt-1">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Collapsible className="mb-6">
        <Card className="border-border">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
              <CardTitle className="font-heading text-lg text-foreground text-left">
                Required Documents
              </CardTitle>
              <ChevronDown className="w-5 h-5 text-gold transition-transform data-[state=open]:rotate-180" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <DocumentChecklist />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <a href="https://www.irs.gov/wheres-my-refund" target="_blank" rel="noopener noreferrer" className="block mb-6">
        <Card className="border-border hover:border-gold/30 transition-colors group cursor-pointer">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <ExternalLink className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                Check Your Refund Status
              </p>
              <p className="text-xs text-foreground">
                Visit IRS.gov to track your federal taxx refund in real time.
              </p>
            </div>
          </CardContent>
        </Card>
      </a>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg text-foreground">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground">
          <p>1. Upload your taxx documents — AI will sort and name them</p>
          <p>2. Check the document checklist for missing items</p>
          <p>3. Send a message to your preparer with any questions</p>
          <p>4. Check your refund status anytime via the IRS link above</p>
        </CardContent>
      </Card>
    </div>
  );
}

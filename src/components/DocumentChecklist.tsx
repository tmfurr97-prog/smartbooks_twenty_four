import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";

const REQUIRED_DOCS = [
  { category: "w2", label: "W-2 (Wage Statement)" },
  { category: "1099", label: "1099 (Contract / Freelance Income)" },
  { category: "id", label: "Photo ID (Driver's License / Passport)" },
  { category: "bank_statement", label: "Bank Statement" },
];

export default function DocumentChecklist() {
  const { user } = useAuth();

  const { data: documents = [] } = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("category, ai_category");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const uploadedCategories = new Set(
    documents.map((d: any) => d.ai_category || d.category)
  );

  const missing = REQUIRED_DOCS.filter((d) => !uploadedCategories.has(d.category));
  const completed = REQUIRED_DOCS.filter((d) => uploadedCategories.has(d.category));

  if (REQUIRED_DOCS.length === 0) return null;

  return (
    <Card className="p-5 border-border">
      <h3 className="font-heading text-base font-semibold text-foreground mb-3 flex items-center gap-2">
        {missing.length > 0 && <AlertTriangle className="w-4 h-4 text-accent" />}
        Document Checklist
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {missing.length === 0
          ? "All required documents uploaded!"
          : `${missing.length} document${missing.length > 1 ? "s" : ""} still needed`}
      </p>
      <div className="space-y-2">
        {completed.map((doc) => (
          <div key={doc.category} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span className="text-foreground">{doc.label}</span>
          </div>
        ))}
        {missing.map((doc) => (
          <div key={doc.category} className="flex items-center gap-2 text-sm">
            <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{doc.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

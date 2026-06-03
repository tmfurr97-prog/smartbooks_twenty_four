import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Trash2, Download, Loader2, CloudUpload, Brain, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "w2", label: "W-2" },
  { value: "1099", label: "1099" },
  { value: "receipt", label: "Receipt" },
  { value: "id", label: "ID / License" },
  { value: "expense", label: "Business Expense" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "tax_return", label: "Prior Yr Return(s)" },
  { value: "insurance", label: "Insurance" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" },
];

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function Documents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [category, setCategory] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: { id: string; storage_path: string }) => {
      const { error: storageError } = await supabase.storage.from("documents").remove([doc.storage_path]);
      if (storageError) throw storageError;
      const { error: dbError } = await supabase.from("documents").delete().eq("id", doc.id);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Document deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete document", variant: "destructive" });
    },
  });

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!user) return;
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        if (file.size > MAX_FILE_SIZE) {
          toast({ title: `${file.name} exceeds 20 MB limit`, variant: "destructive" });
          continue;
        }
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast({ title: `${file.name} is not an accepted file type`, variant: "destructive" });
          continue;
        }

        // Step 1: Hash the file for duplicate detection
        setAnalyzing(true);
        let fileHash = "";
        try {
          fileHash = await hashFile(file);
        } catch {
          // continue without hash
        }

        // Step 2: Call AI analysis
        let aiCategory = category;
        let suggestedName = file.name;
        let isDuplicate = false;
        let duplicateOf: string | null = null;

        try {
          const { data: session } = await supabase.auth.getSession();
          const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-document`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
              file_hash: fileHash,
            }),
          });

          if (resp.ok) {
            const analysis = await resp.json();
            aiCategory = analysis.ai_category || category;
            suggestedName = analysis.suggested_name || file.name;
            isDuplicate = analysis.is_duplicate;
            duplicateOf = analysis.duplicate_of;
          }
        } catch {
          // Fallback: upload without AI
        }
        setAnalyzing(false);

        // Step 3: Warn on duplicate
        if (isDuplicate) {
          toast({
            title: "Duplicate detected",
            description: `This file matches "${duplicateOf}". Uploading anyway.`,
            variant: "destructive",
          });
        }

        // Step 4: Upload
        setUploading(true);
        const timestamp = Date.now();
        const storagePath = `${user.id}/${timestamp}_${file.name}`;

        try {
          const { error: uploadError } = await supabase.storage.from("documents").upload(storagePath, file);
          if (uploadError) throw uploadError;

          const { error: dbError } = await supabase.from("documents").insert({
            user_id: user.id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            category: aiCategory,
            storage_path: storagePath,
            file_hash: fileHash || null,
            ai_category: aiCategory,
            suggested_name: suggestedName,
          });
          if (dbError) throw dbError;

          toast({
            title: `${file.name} uploaded`,
            description: `Auto-categorized as ${CATEGORIES.find((c) => c.value === aiCategory)?.label ?? aiCategory}`,
          });
        } catch {
          toast({ title: `Failed to upload ${file.name}`, variant: "destructive" });
        }
      }

      setUploading(false);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    [user, category, toast, queryClient],
  );

  const handleDownload = async (storagePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("documents").download(storagePath);
    if (error || !data) {
      toast({ title: "Download failed", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
    },
    [handleUpload],
  );

  const isProcessing = uploading || analyzing;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Documents</h1>
        <p className="text-muted-foreground">Upload and manage your tax documents — AI handles sorting and naming.</p>
      </div>

      {/* Upload area */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="space-y-1.5 w-full sm:w-48">
            <label className="text-sm font-medium text-foreground">Fallback Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground pb-2">
            <Brain className="w-3.5 h-3.5 inline-block mr-1 text-accent" />
            AI will auto-detect the category for you
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
            dragOver ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
          }`}
          onClick={() => !isProcessing && document.getElementById("file-input")?.click()}
        >
          {analyzing ? (
            <>
              <Brain className="w-10 h-10 text-accent animate-pulse" />
              <p className="text-muted-foreground text-center text-sm">Analyzing document with AI…</p>
            </>
          ) : uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-muted-foreground text-center text-sm">Uploading…</p>
            </>
          ) : (
            <>
              <CloudUpload className="w-10 h-10 text-foreground/70" />
              <p className="text-foreground/70 text-center text-sm">Drag & drop files here, or click to browse</p>
              <p className="text-foreground/50 text-xs">PDF, JPG, PNG, WEBP, Excel, CSV — up to 20 MB</p>
            </>
          )}
          <input
            id="file-input"
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </Card>

      {/* Document list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-12 text-center">
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No documents yet. Upload your first file above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc: any) => (
            <Card key={doc.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{doc.file_name}</p>
                {doc.suggested_name && doc.suggested_name !== doc.file_name && (
                  <p className="text-xs text-accent truncate flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    {doc.suggested_name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {CATEGORIES.find((c) => c.value === (doc.ai_category || doc.category))?.label ?? doc.category} ·{" "}
                  {formatFileSize(doc.file_size)} · {format(new Date(doc.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(doc.storage_path, doc.file_name)}
                  aria-label="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate({ id: doc.id, storage_path: doc.storage_path })}
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

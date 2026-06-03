import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Check, X, Trash2, Loader2, FileText } from "lucide-react";

interface Row {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  read_time: string;
  image: string;
  status: string;
  generated_by_ai: boolean;
  published_at: string | null;
  created_at: string;
}

export default function BlogAdmin() {
  const { roles } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  const canManage = roles.includes("preparer") || roles.includes("admin");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("generate-blog-post", { body: {} });
    setGenerating(false);
    if (error) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Draft created", description: data?.post?.title ?? "" });
    load();
  };

  const save = async () => {
    if (!editing) return;
    const { error } = await supabase
      .from("blog_posts")
      .update({
        title: editing.title,
        slug: editing.slug,
        excerpt: editing.excerpt,
        content: editing.content,
        category: editing.category,
        author: editing.author,
        read_time: editing.read_time,
        image: editing.image,
      })
      .eq("id", editing.id);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: "Saved" });
    setEditing(null);
    load();
  };

  const approve = async (id: string) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast({ title: "Approve failed", description: error.message, variant: "destructive" });
    toast({ title: "Published" });
    load();
  };

  const reject = async (id: string) => {
    const { error } = await supabase.from("blog_posts").update({ status: "rejected" }).eq("id", id);
    if (error) return toast({ title: "Reject failed", description: error.message, variant: "destructive" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    load();
  };

  if (!canManage) {
    return <p className="text-foreground">Preparer or admin access required.</p>;
  }

  const filter = (s: string) => rows.filter((r) => r.status === s);

  const renderList = (list: Row[]) => (
    <div className="space-y-3">
      {list.length === 0 && <p className="text-sm text-foreground">Nothing here yet.</p>}
      {list.map((r) => (
        <Card key={r.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-lg">{r.title}</CardTitle>
                <CardDescription className="mt-1">{r.excerpt}</CardDescription>
              </div>
              <div className="flex gap-2 shrink-0">
                <Badge variant="outline">{r.category}</Badge>
                {r.generated_by_ai && <Badge className="bg-gold/15 text-foreground border-gold/40 gap-1"><Sparkles className="w-3 h-3" />AI</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(r)}><FileText className="w-4 h-4 mr-1" />Review & edit</Button>
            {r.status === "draft" && (
              <>
                <Button size="sm" variant="gold" onClick={() => approve(r.id)}><Check className="w-4 h-4 mr-1" />Approve & publish</Button>
                <Button size="sm" variant="ghost" onClick={() => reject(r.id)}><X className="w-4 h-4 mr-1" />Reject</Button>
              </>
            )}
            {r.status === "published" && (
              <Button size="sm" variant="ghost" onClick={() => reject(r.id)}>Unpublish</Button>
            )}
            {r.status === "rejected" && (
              <Button size="sm" variant="outline" onClick={() => approve(r.id)}>Publish anyway</Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Blog Admin</h1>
          <p className="text-foreground">Review AI-drafted posts before they go live. New drafts are also generated automatically each month.</p>
        </div>
        <Button onClick={generate} disabled={generating} variant="gold">
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate draft now
        </Button>
      </div>

      {editing ? (
        <Card>
          <CardHeader><CardTitle>Edit draft</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
            <div><Label>Excerpt</Label><Input value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
              <div><Label>Read time</Label><Input value={editing.read_time} onChange={(e) => setEditing({ ...editing, read_time: e.target.value })} /></div>
            </div>
            <div><Label>Author</Label><Input value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} /></div>
            <div><Label>Cover image URL</Label><Input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></div>
            <div><Label>Content (markdown)</Label><Textarea rows={16} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
            <div className="flex gap-2">
              <Button onClick={save} variant="gold">Save</Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <p className="text-foreground">Loading...</p>
      ) : (
        <Tabs defaultValue="draft">
          <TabsList>
            <TabsTrigger value="draft">Drafts ({filter("draft").length})</TabsTrigger>
            <TabsTrigger value="published">Published ({filter("published").length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({filter("rejected").length})</TabsTrigger>
          </TabsList>
          <TabsContent value="draft" className="mt-4">{renderList(filter("draft"))}</TabsContent>
          <TabsContent value="published" className="mt-4">{renderList(filter("published"))}</TabsContent>
          <TabsContent value="rejected" className="mt-4">{renderList(filter("rejected"))}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}

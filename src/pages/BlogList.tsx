import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { blogPosts as staticPosts, type BlogPost } from "@/data/blogPosts";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const categories = [
  { value: "all", label: "All Posts" },
  { value: "tax-tips", label: "Tax Tips" },
  { value: "financial-advice", label: "Financial Advice" },
  { value: "platform-updates", label: "Platform Updates" },
];

export default function BlogList() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [posts, setPosts] = useState<BlogPost[]>(staticPosts);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug,title,excerpt,content,category,author,read_time,image,published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (data && data.length) {
        const dbPosts: BlogPost[] = data.map((d) => ({
          slug: d.slug,
          title: d.title,
          excerpt: d.excerpt,
          content: d.content,
          category: d.category,
          author: d.author,
          date: d.published_at ? new Date(d.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
          readTime: d.read_time,
          image: d.image,
        }));
        const seen = new Set(dbPosts.map((p) => p.slug));
        setPosts([...dbPosts, ...staticPosts.filter((p) => !seen.has(p.slug))]);
      }
    })();
  }, []);

  const filteredPosts = selectedCategory === "all"
    ? posts
    : posts.filter((post) => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Blog — Taxx Tips & Platform Updates | SmartBooks"
        description="Taxx tips, financial advice, and SmartBooks platform updates for individuals, gig workers, and small businesses."
        path="/blog"
      />
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">SmartBooks Blog</h1>
          <p className="text-xl text-foreground">Taxx tips, financial advice, and platform updates</p>
        </div>

        <h2 className="sr-only">Filter posts by category</h2>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              variant={selectedCategory === cat.value ? "default" : "outline"}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <h2 className="sr-only">Latest posts</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`}>
              <Card className="h-full bg-card border-border hover:shadow-xl transition-shadow duration-300">
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-t-lg" />
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.category.replace("-", " ")}</Badge>
                    <span className="text-sm text-foreground">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold leading-none tracking-tight text-foreground">{post.title}</h3>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-foreground">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

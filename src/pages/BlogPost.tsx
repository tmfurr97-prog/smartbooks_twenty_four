import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { blogPosts as staticPosts, type BlogPost as BlogPostType } from "@/data/blogPosts";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug,title,excerpt,content,category,author,read_time,image,published_at")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (data) {
        setPost({
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category,
          author: data.author,
          date: data.published_at ? new Date(data.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
          readTime: data.read_time,
          image: data.image,
        });
      } else {
        setPost(staticPosts.find((p) => p.slug === slug) ?? null);
      }
    })();
  }, [slug]);

  if (post === undefined) return <div className="min-h-screen bg-background" />;
  if (post === null) return <Navigate to="/blog" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={`${post.title} | SmartBooks Blog`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: post.image,
          author: { "@type": "Person", name: post.author },
          datePublished: post.date,
          publisher: {
            "@type": "Organization",
            name: "SmartBooks by ReFurrm",
            logo: { "@type": "ImageObject", url: "https://smartbooks24.com/apple-touch-icon.png" },
          },
        }}
      />
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <Link to="/blog">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <article>
          <img src={post.image} alt={post.title} className="w-full h-96 object-cover rounded-lg mb-8" />

          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary">{post.category.replace("-", " ")}</Badge>
            <span className="text-foreground">{post.readTime}</span>
          </div>

          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">{post.title}</h1>

          <div className="flex items-center justify-between text-foreground mb-8 pb-8 border-b border-border">
            <span>By {post.author}</span>
            <span>{post.date}</span>
          </div>

          <div className="prose prose-lg max-w-none">
            {post.content.split("\n\n").map((paragraph, index) => {
              if (paragraph.startsWith("## ")) {
                return <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">{paragraph.replace("## ", "")}</h2>;
              } else if (paragraph.startsWith("# ")) {
                return <h1 key={index} className="text-3xl font-bold text-foreground mt-8 mb-4">{paragraph.replace("# ", "")}</h1>;
              } else if (paragraph.startsWith("- ")) {
                const items = paragraph.split("\n");
                return (
                  <ul key={index} className="list-disc pl-6 mb-4 space-y-2 text-foreground">
                    {items.map((item, i) => <li key={i}>{item.replace("- ", "")}</li>)}
                  </ul>
                );
              } else {
                return <p key={index} className="mb-4 text-foreground leading-relaxed">{paragraph}</p>;
              }
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link to="/blog">
              <Button>View All Posts</Button>
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

import { useParams, Link, Navigate } from "react-router-dom";
import { blogPosts } from "@/data/blogPosts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
            <span className="text-muted-foreground">{post.readTime}</span>
          </div>

          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">{post.title}</h1>

          <div className="flex items-center justify-between text-muted-foreground mb-8 pb-8 border-b border-border">
            <span>By {post.author}</span>
            <span>{post.date}</span>
          </div>

          <div className="prose prose-lg max-w-none">
            {post.content.split("\n\n").map((paragraph, index) => {
              if (paragraph.startsWith("## ")) {
                return <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">{paragraph.replace("## ", "")}</h2>;
              } else if (paragraph.startsWith("- ")) {
                const items = paragraph.split("\n");
                return (
                  <ul key={index} className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground">
                    {items.map((item, i) => <li key={i}>{item.replace("- ", "")}</li>)}
                  </ul>
                );
              } else {
                return <p key={index} className="mb-4 text-muted-foreground leading-relaxed">{paragraph}</p>;
              }
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link to="/blog">
              <Button>View All Posts</Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

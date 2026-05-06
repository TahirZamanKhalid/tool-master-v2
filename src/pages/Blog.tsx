import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { BlogPostCard } from "@/components/BlogPostCard";
import { AdRow } from "@/components/AdRow";
import { blogPosts } from "@/data/blogPosts";
import { BookOpen, Sparkles } from "lucide-react";

const Blog = () => {
  const featured = blogPosts.filter((p) => p.featured).slice(0, 3);
  const others = blogPosts.filter((p) => !featured.find((f) => f.id === p.id));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Blog & Tutorials — Free Online Tools Tips & Guides | ToolMaster Pro"
        description="Step-by-step tutorials, expert tips, and how-to guides for free online tools. Master image editing, PDF processing, AI writing, background removal, and more."
        keywords="online tools blog, tutorials, how to guides, free tools tips, image editing tutorial, PDF tools guide, AI writing tips, background remover tutorial, QR code guide, word counter tutorial, online productivity tips, web tools tutorials"
        canonical="https://toolmaster.cloud/blog"
        breadcrumbs={[
          { name: "Home", url: "https://toolmaster.cloud/" },
          { name: "Blog", url: "https://toolmaster.cloud/blog" },
        ]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            "@id": "https://toolmaster.cloud/blog",
            name: "ToolMaster Pro Blog & Tutorials",
            description: "Step-by-step tutorials, expert tips, and how-to guides for free online tools.",
            url: "https://toolmaster.cloud/blog",
            publisher: { "@id": "https://toolmaster.cloud/#organization" },
            isPartOf: { "@id": "https://toolmaster.cloud/#website" },
            inLanguage: "en-US",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://toolmaster.cloud/" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://toolmaster.cloud/blog" },
            ],
          },
        ]}
      />
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 gradient-hero animate-gradient-xy" />
        <div className="container max-w-5xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            BLOG & TUTORIALS
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-3">
            Master Your <span className="text-gradient">Workflow</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Step-by-step guides, expert tips, and tutorials to help you get the most out of every tool.
          </p>
        </div>
      </section>

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-12">

        {/* Featured */}
        {featured.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl md:text-2xl font-black text-foreground">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Ad */}
        <div className="mb-12">
          <AdRow />
        </div>

        {/* All Posts */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-black text-foreground">All Articles</h2>
            <span className="text-sm text-muted-foreground">{blogPosts.length} posts</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;

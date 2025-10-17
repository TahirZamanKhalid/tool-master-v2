// pages/Blog.tsx - Simplified version
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { BlogPostCard } from "@/components/BlogPostCard";
import { blogPosts } from "@/data/blogPosts";
import { AdRow } from "@/components/AdRow"; // Add this import

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Blog - ToolMaster Pro"
        description="Read articles, tutorials, and tips about using ToolMaster Pro's free online tools."
        keywords="blog, tutorials, tips, guides, online tools"
        canonical="https://toolmaster.cloud/blog"
      />

      <Header />

      <main className="flex-1">
        <div className="container py-12 px-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">ToolMaster Pro Blog</h1>
              <p className="text-xl text-muted-foreground">Tips, tutorials, and insights about our tools</p>
            </div>

            {/* Top Ad */}
            <div className="mb-12">
              <AdRow type="display" count={1} position="top" />
            </div>

            {/* Featured Posts */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Featured Articles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts
                  .filter((post) => post.featured)
                  .slice(0, 3)
                  .map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
              </div>
            </section>

            {/* Three Column Ads */}
            <div className="my-16">
              <AdRow type="display" count={3} position="content" />
            </div>

            {/* All Posts */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">All Articles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            </section>

            {/* Bottom Multiplex Ad */}
            <div className="mt-16">
              <AdRow type="multiplex" count={1} position="bottom" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;

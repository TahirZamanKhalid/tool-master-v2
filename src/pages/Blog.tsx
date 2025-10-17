import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { BlogPostCard } from "@/components/BlogPostCard";
import { blogPosts } from "@/data/blogPosts";
import { LazyAdSpace } from "@/components/LazyAdSpace";

const Blog = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Load AdSense script
    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7382531001943020";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    // Initialize ads after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        // Push ads for each ad unit
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Blog - ToolMaster Pro"
        description="Read articles, tutorials, and tips about using ToolMaster Pro's free online tools effectively. Stay updated with latest features and best practices."
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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog</h1>
            <p className="text-xl text-muted-foreground mb-12">Tips, tutorials, and insights about our tools</p>

            <LazyAdSpace size="leaderboard" className="mb-8" />

            {/* First AdSense Ad - Top of Blog Posts */}
            <div className="my-8 flex justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-format="fluid"
                data-ad-layout-key="-g5-1u+99-a6-k8"
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot="1968211491"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Second AdSense Ad - Bottom of Blog Posts */}
            <div className="my-8 flex justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-format="fluid"
                data-ad-layout-key="-g5-1u+99-a6-k8"
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot="1968211491"
              />
            </div>

            <LazyAdSpace size="leaderboard" className="mt-8" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;

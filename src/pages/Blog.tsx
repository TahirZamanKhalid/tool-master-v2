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

    // Initialize ads after script loads
    script.onload = () => {
      try {
        setTimeout(() => {
          const ads = document.querySelectorAll(".adsbygoogle");
          ads.forEach((ad) => {
            if (!ad.getAttribute("data-adsbygoogle-status")) {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          });
        }, 300);
      } catch (e) {
        console.error("AdSense error:", e);
      }
    };

    return () => {
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
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog</h1>
            <p className="text-xl text-muted-foreground mb-12">Tips, tutorials, and insights about our tools</p>

            <LazyAdSpace size="leaderboard" className="mb-8" />

            {/* Display Ad 2 - Top Banner - Full Width Flexible */}
            <div className="mb-8 w-full flex justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block", width: "100%", maxWidth: "728px" }}
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot="8907016752"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            {/* First Row - Three Flexible Ads */}
            <div className="flex flex-col md:flex-row gap-4 my-8 items-start justify-center">
              {/* Display Ad 1 - Flexible */}
              <div className="flex-1 min-w-0 flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", maxWidth: "400px" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="4402803148"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>

              {/* Display Ad 2 - Flexible */}
              <div className="flex-1 min-w-0 flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", maxWidth: "400px" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="4739066253"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>

              {/* Display Ad 3 - Flexible */}
              <div className="flex-1 min-w-0 flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", maxWidth: "400px" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="1968211491"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(3).map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Second Row - Three More Flexible Ads */}
            <div className="flex flex-col md:flex-row gap-4 my-8 items-start justify-center">
              {/* Additional Ad 1 - Flexible */}
              <div className="flex-1 min-w-0 flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", maxWidth: "400px" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="4402803148"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>

              {/* Additional Ad 2 - Flexible */}
              <div className="flex-1 min-w-0 flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", maxWidth: "400px" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="4739066253"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>

              {/* Additional Ad 3 - Flexible */}
              <div className="flex-1 min-w-0 flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", maxWidth: "400px" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="1968211491"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>
            </div>

            {/* Third Row - Three More Flexible Ads */}
            <div className="flex flex-col md:flex-row gap-4 my-8 items-start justify-center">
              {/* More Ad 1 - Flexible */}
              <div className="flex-1 min-w-0 flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", maxWidth: "400px" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="4402803148"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>

              {/* More Ad 2 - Flexible */}
              <div className="flex-1 min-w-0 flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", maxWidth: "400px" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="4739066253"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>

              {/* More Ad 3 - Flexible */}
              <div className="flex-1 min-w-0 flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", maxWidth: "400px" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="1968211491"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>
            </div>

            {/* Multiplex Ad - Native content recommendation grid */}
            <div className="mt-8">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-format="autorelaxed"
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot="2127993591"
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

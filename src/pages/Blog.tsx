import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { BlogPostCard } from "@/components/BlogPostCard";
import { blogPosts } from "@/data/blogPosts";

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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog</h1>
            <p className="text-xl text-muted-foreground mb-12">Tips, tutorials, and insights about our tools</p>

            {/* Top Banner Ad - Full Width */}
            <div className="mb-8 w-full flex justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot="2918331088"
                data-ad-format="leaderboard"
                data-ad-width="728"
                data-ad-height="90"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Three Display Ads in a row - Images/Videos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
              {/* Display Ad 1 - Rectangle for Images/Videos */}
              <div className="min-h-[280px] flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="4402803148"
                  data-ad-format="rectangle"
                  data-ad-width="300"
                  data-ad-height="250"
                />
              </div>

              {/* Display Ad 2 - Rectangle for Images/Videos */}
              <div className="min-h-[280px] flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="4739066253"
                  data-ad-format="rectangle"
                  data-ad-width="300"
                  data-ad-height="250"
                />
              </div>

              {/* Display Ad 3 - Rectangle for Images/Videos */}
              <div className="min-h-[280px] flex justify-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="1968211491"
                  data-ad-format="rectangle"
                  data-ad-width="300"
                  data-ad-height="250"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(3).map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
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

            {/* Bottom Banner Ad - Full Width */}
            <div className="mt-8 w-full flex justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot="2918331088"
                data-ad-format="banner"
                data-ad-width="728"
                data-ad-height="90"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;

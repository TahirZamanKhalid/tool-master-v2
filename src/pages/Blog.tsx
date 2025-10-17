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
    // Load AdSense script only once
    if (!document.querySelector('script[src*="googlesyndication.com"]')) {
      const script = document.createElement("script");
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7382531001943020";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Initialize ads with better timing
    const initializeAds = () => {
      try {
        if (window.adsbygoogle) {
          // Initialize all ads on the page
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } else {
          // Retry if AdSense not loaded yet
          setTimeout(initializeAds, 500);
        }
      } catch (error) {
        console.error("AdSense initialization error:", error);
      }
    };

    // Wait for page to load before initializing ads
    if (document.readyState === "complete") {
      setTimeout(initializeAds, 1000);
    } else {
      window.addEventListener("load", () => {
        setTimeout(initializeAds, 1000);
      });
    }

    // Cleanup
    return () => {
      // No need to remove the script as it's needed for other pages
    };
  }, []);

  // Function to manually refresh a specific ad
  const refreshAd = (adSlot: string) => {
    try {
      const adElement = document.querySelector(`[data-ad-slot="${adSlot}"]`);
      if (adElement && !adElement.getAttribute("data-adsbygoogle-status")) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("Error refreshing ad:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Blog - ToolMaster Pro"
        description="Read articles, tutorials, and tips about using ToolMaster Pro's free online tools effectively. Stay updated with latest features and best practices."
        keywords="blog, tutorials, tips, guides, online tools, ToolMaster Pro, how-to articles"
        canonical="https://toolmaster.cloud/blog"
      />

      <Header />

      <main className="flex-1">
        <div className="container py-12 px-4">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ToolMaster Pro Blog
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover tips, tutorials, and insights to get the most out of our free online tools
              </p>
            </div>

            {/* Top Leaderboard Ad */}
            <div className="mb-12 text-center">
              <LazyAdSpace type="display" slot="display_ad_slot_1" position="top" className="max-w-4xl mx-auto" />
            </div>

            {/* Top Banner Ad */}
            <div className="mb-12 max-w-4xl mx-auto">
              <div className="bg-muted/20 rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground text-center mb-2">Advertisement</p>
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", height: "90px" }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="2918331088"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>
            </div>

            {/* Featured Posts Section */}
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

            {/* Three Column Display Ads */}
            <div className="my-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Display Ad */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Advertisement</p>
                  <div className="bg-muted/20 rounded-lg p-4 border min-h-[250px] flex items-center justify-center">
                    <ins
                      className="adsbygoogle"
                      style={{ display: "block", width: "100%", height: "250px" }}
                      data-ad-client="ca-pub-7382531001943020"
                      data-ad-slot="4402803148"
                      data-ad-format="auto"
                      data-full-width-responsive="true"
                    />
                  </div>
                </div>

                {/* Center In-feed Ad */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Sponsored Content</p>
                  <div className="bg-muted/20 rounded-lg p-4 border min-h-[250px] flex items-center justify-center">
                    <ins
                      className="adsbygoogle"
                      style={{ display: "block" }}
                      data-ad-format="fluid"
                      data-ad-layout-key="-gk-24+14-4r+ke"
                      data-ad-client="ca-pub-7382531001943020"
                      data-ad-slot="4739066253"
                    />
                  </div>
                </div>

                {/* Right Display Ad */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Advertisement</p>
                  <div className="bg-muted/20 rounded-lg p-4 border min-h-[250px] flex items-center justify-center">
                    <ins
                      className="adsbygoogle"
                      style={{ display: "block", width: "100%", height: "250px" }}
                      data-ad-client="ca-pub-7382531001943020"
                      data-ad-slot="1968211491"
                      data-ad-format="auto"
                      data-full-width-responsive="true"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* All Blog Posts Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">All Articles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            </section>

            {/* Multiplex Ad - Native Content Recommendations */}
            <div className="my-16 text-center">
              <p className="text-sm text-muted-foreground mb-4">Recommended for You</p>
              <div className="bg-muted/20 rounded-lg p-6 border">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block" }}
                  data-ad-format="autorelaxed"
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="2127993591"
                />
              </div>
            </div>

            {/* Newsletter Signup Section */}
            <section className="my-16 text-center">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
                <p className="text-muted-foreground mb-6">
                  Get the latest articles, tool updates, and tips delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
                  />
                  <Button className="bg-primary hover:bg-primary/90">Subscribe</Button>
                </div>
              </div>
            </section>

            {/* Bottom Leaderboard Ad */}
            <div className="mt-16 text-center">
              <LazyAdSpace type="display" slot="display_ad_slot_2" position="bottom" className="max-w-4xl mx-auto" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;

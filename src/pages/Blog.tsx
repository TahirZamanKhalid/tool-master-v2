import { useEffect, useRef } from "react";
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
  const adsInitialized = useRef(false);

  useEffect(() => {
    const loadAdSense = async () => {
      try {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Create and load AdSense script
        const script = document.createElement("script");
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7382531001943020";
        script.async = true;
        script.crossOrigin = "anonymous";

        // Use a Promise to handle script loading
        const scriptLoaded = new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });

        document.head.appendChild(script);

        // Wait for script to load
        await scriptLoaded;

        // Initialize ads after script loads successfully
        setTimeout(() => {
          if (!adsInitialized.current) {
            initializeAds();
            adsInitialized.current = true;
          }
        }, 1000);
      } catch (error) {
        console.error("Failed to load AdSense script:", error);
        // Fallback: try to initialize anyway in case script was already loaded
        setTimeout(() => {
          if (window.adsbygoogle && !adsInitialized.current) {
            initializeAds();
            adsInitialized.current = true;
          }
        }, 2000);
      }
    };

    const initializeAds = () => {
      try {
        const ads = document.querySelectorAll(".adsbygoogle");
        console.log("Initializing ads, found:", ads.length);

        ads.forEach((ad, index) => {
          try {
            if (!ad.getAttribute("data-adsbygoogle-status")) {
              console.log("Pushing ad", index + 1);
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          } catch (adError) {
            console.error(`Error initializing ad ${index + 1}:`, adError);
          }
        });
      } catch (error) {
        console.error("Error in initializeAds:", error);
      }
    };

    loadAdSense();

    // Cleanup
    return () => {
      adsInitialized.current = false;
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Three Display Ads in a Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              {/* Side bar Ads1 */}
              <div className="min-h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
                <ins
                  className="adsbygoogle"
                  style={{
                    display: "block",
                    width: "100%",
                    minHeight: "280px",
                  }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="5628599414"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>

              {/* Display Ad 2 */}
              <div className="min-h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
                <ins
                  className="adsbygoogle"
                  style={{
                    display: "block",
                    width: "100%",
                    minHeight: "280px",
                  }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="2918331088"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>

              {/* Display ad 3 */}
              <div className="min-h-[300px] bg-gray-50 rounded-lg flex items-center justify-center">
                <ins
                  className="adsbygoogle"
                  style={{
                    display: "block",
                    width: "100%",
                    minHeight: "280px",
                  }}
                  data-ad-client="ca-pub-7382531001943020"
                  data-ad-slot="4402803148"
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

            {/* In-feed Ad - Full width feed ad */}
            <div className="my-8 max-w-2xl mx-auto">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-format="fluid"
                data-ad-layout-key="-g5-1u+99-a6-k8"
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot="1968211491"
              />
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

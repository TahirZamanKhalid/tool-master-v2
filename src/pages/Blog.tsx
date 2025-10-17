import { useEffect, useRef } from "react";
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
  const adsInitialized = useRef(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    const loadAdSense = async () => {
      // Prevent multiple script loads
      if (scriptLoaded.current) return;

      try {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
        if (existingScript) {
          scriptLoaded.current = true;
          initializeAds();
          return;
        }

        // Create and load AdSense script
        const script = document.createElement("script");
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7382531001943020";
        script.async = true;
        script.crossOrigin = "anonymous";

        const scriptLoadPromise = new Promise((resolve, reject) => {
          script.onload = () => {
            scriptLoaded.current = true;
            resolve();
          };
          script.onerror = reject;
        });

        document.head.appendChild(script);
        await scriptLoadPromise;

        // Initialize ads after script loads
        setTimeout(initializeAds, 1000);
      } catch (error) {
        console.error("Failed to load AdSense script:", error);
      }
    };

    const initializeAds = () => {
      // Prevent multiple initializations
      if (adsInitialized.current) return;

      try {
        const ads = document.querySelectorAll(".adsbygoogle");
        console.log("Initializing ads, found:", ads.length);

        ads.forEach((ad, index) => {
          try {
            // Only initialize ads that haven't been processed
            if (!ad.getAttribute("data-adsbygoogle-status")) {
              console.log("Pushing ad", index + 1);
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          } catch (adError) {
            console.error(`Error initializing ad ${index + 1}:`, adError);
          }
        });

        adsInitialized.current = true;
      } catch (error) {
        console.error("Error in initializeAds:", error);
      }
    };

    loadAdSense();

    // Cleanup
    return () => {
      // Don't reset on cleanup to prevent re-initialization
    };
  }, []); // Empty dependency array

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

            {/* Top Banner Ad */}
            <div className="mb-8 max-w-3xl mx-auto min-h-[100px] bg-gray-50 rounded-lg flex items-center justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot="2918331088"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Three Display Ads in a Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              {/* Side bar Ads1 */}
              <div className="min-h-[300px] bg-gray-50 rounded-lg flex items-center justify-center p-4">
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
              <div className="min-h-[300px] bg-gray-50 rounded-lg flex items-center justify-center p-4">
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
              <div className="min-h-[300px] bg-gray-50 rounded-lg flex items-center justify-center p-4">
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

            {/* Bottom Banner Ad */}
            <div className="mt-8 max-w-3xl mx-auto min-h-[100px] bg-gray-50 rounded-lg flex items-center justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot="5628599414"
                data-ad-format="auto"
                data-full-width-responsive="true"
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

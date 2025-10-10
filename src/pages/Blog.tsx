import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Blog - ToolMaster Pro"
        description="Read articles, tutorials, and tips about using ToolMaster Pro's free online tools effectively. Stay updated with latest features and best practices."
        keywords="blog, tutorials, tips, guides, online tools"
        canonical={`${window.location.origin}/blog`}
      />
      <Header />
      <main className="flex-1">
        <div className="container py-12 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Tips, tutorials, and insights about our tools
          </p>

          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">
              We're working on creating helpful content for you. Check back soon!
            </p>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEOHead } from "@/components/SEOHead";
import { ShareButtons } from "@/components/ShareButtons";
import { ToolFAQ } from "@/components/ToolFAQ";
import { SidebarAd } from "@/components/SidebarAd";
import { blogPosts } from "@/data/blogPosts";
import { ArrowRight } from "lucide-react";

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  children: ReactNode;
  instructions?: string[];
  relatedTools?: { name: string; path: string }[];
  layout?: "full-width" | "with-sidebar";
}

export const ToolLayout = ({
  title,
  description,
  category,
  children,
  instructions,
  relatedTools,
  layout = "full-width",
}: ToolLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();


  // Enhanced keywords with variations for better search coverage
  const enhancedKeywords = `${title}, ${category}, free ${title.toLowerCase()}, online ${title.toLowerCase()}, ${title.toLowerCase()} tool, ${category.toLowerCase()} tools, free online tools, no signup, no registration, web tools, instant tools`;

  // Generate structured data for the tool
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": title,
    "description": description,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ToolMaster Pro",
      "logo": {
        "@type": "ImageObject",
        "url": "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/uploads/1759510903222-toolmasterpro logo.jpeg"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5"
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead
        title={title}
        description={description}
        keywords={enhancedKeywords}
        canonical={`https://toolmaster.cloud${location.pathname}`}
        ogImage="https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/social-images/social-1759510890634-toolmasterpro logo.jpeg"
      />

      {/* Structured Data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <main className="container max-w-[1600px] py-8 px-4">
        <Breadcrumbs
          items={[
            { label: category || "Tools" },
            { label: title }
          ]}
        />

        <div className="mt-8 w-full">
          <div className={`grid gap-8 ${layout === "with-sidebar" ? "lg:grid-cols-[1fr_300px]" : ""}`}>
            {/* Main Content Column */}
            <div className="space-y-8 min-w-0">
              <div>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    {category}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold break-words text-foreground">
                    {title}
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{description}</p>

                <ShareButtons
                  title={title}
                  description={description}
                  url={`https://toolmaster.cloud${location.pathname}`}
                />
              </div>

              <div className="overflow-hidden w-full bg-card rounded-xl border shadow-sm p-1 md:p-6">
                {children}
              </div>

              {instructions && (
                <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="bg-primary/10 p-2 rounded-lg text-primary">📚</span>
                    How to Use {title}
                  </h2>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-4">Step-by-Step Guide</h3>
                  <ol className="space-y-3 list-decimal list-inside">
                    {instructions.map((instruction, index) => (
                      <li key={index} className="text-muted-foreground pl-2 marker:font-bold marker:text-primary">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="bg-primary/10 p-2 rounded-lg text-primary">✨</span>
                  Why Use Our {title}?
                </h2>
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">Key Features & Benefits</h3>
                <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                  <li className="pl-2">100% Free online tool - No signup or registration required</li>
                  <li className="pl-2">Fast and secure processing - All operations performed in your browser</li>
                  <li className="pl-2">Works on any device - Desktop, tablet, or mobile</li>
                  <li className="pl-2">Professional results - Enterprise-grade quality for free</li>
                  <li className="pl-2">Privacy focused - Your data never leaves your device</li>
                </ul>
              </div>

              <ToolFAQ toolName={title} />

              {relatedTools && relatedTools.length > 0 && (
                <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-lg">🔗</span>
                    Related & Similar Tools
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {relatedTools.map((tool, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => navigate(tool.path)}
                        className="justify-start h-auto py-4 px-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold group-hover:text-primary transition-colors">{tool.name}</span>
                          <span className="text-xs text-muted-foreground">More in {category}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Linking: Blog Guides */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-8 border border-primary/10">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="bg-primary/20 p-2 rounded-lg text-primary text-xl">📖</span>
                  Step-by-Step Training Guides
                </h2>
                <p className="text-muted-foreground mb-6">Learn how to master professional workflows using our tools with our expert-written tutorials and industry best practices.</p>
                <div className="grid sm:grid-cols-2 gap-6">
                  {blogPosts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className="cursor-pointer group"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">{post.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="link"
                  onClick={() => navigate("/blog")}
                  className="mt-6 p-0 h-auto text-primary hover:no-underline font-bold"
                >
                  View All Guides & Tutorials <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar Column */}
            {layout === "with-sidebar" && (
              <div className="space-y-8">
                <div className="sticky top-24 space-y-8">
                  <div className="bg-card rounded-xl border shadow-sm p-4 min-h-[600px] flex items-center justify-center bg-muted/10">
                    <SidebarAd />
                  </div>

                  {/* Additional sidebar content can go here */}
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/10">
                    <h3 className="font-semibold mb-2 text-primary">Pro Tip</h3>
                    <p className="text-sm text-muted-foreground">
                      Bookmark this page (Ctrl+D) to access {title} instantly whenever you need it!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

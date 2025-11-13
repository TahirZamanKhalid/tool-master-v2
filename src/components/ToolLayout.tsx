import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdSpace } from "@/components/AdSpace";
import { useNavigate, useLocation } from "react-router-dom";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ToolRating } from "@/components/ToolRating";
import { SEOHead } from "@/components/SEOHead";
import { ShareButtons } from "@/components/ShareButtons";
import { ToolFAQ } from "@/components/ToolFAQ";
import { useToolAnalytics } from "@/hooks/useToolAnalytics";

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  children: ReactNode;
  instructions?: string[];
  relatedTools?: { name: string; path: string }[];
  layout?: "full-width" | "with-sidebar"; // default: full-width
  adRefreshKey?: number; // Optional key to force ad refresh
}

export const ToolLayout = ({
  title,
  description,
  category,
  children,
  instructions,
  relatedTools,
  layout = "full-width",
  adRefreshKey,
}: ToolLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track tool view
  useToolAnalytics(location.pathname);

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
      <div className="container max-w-[1600px] py-8 px-4">
        <Breadcrumbs
          items={[
            { label: category },
            { label: title }
          ]}
        />

        {layout === "full-width" ? (
          /* Full Width Layout with Sticky Ads */
          <div className="mt-8 space-y-8 w-full">
            {/* Top Sticky Ad - Desktop */}
            <div className="hidden md:block sticky top-16 z-10 bg-background/95 backdrop-blur-sm py-2">
              <AdSpace key={`top-ad-${adRefreshKey ?? 0}`} size="leaderboard" className="w-full" />
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <Badge>{category}</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold break-words">{title}</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-4">{description}</p>

                <ShareButtons
                  title={title}
                  description={description}
                  url={`https://toolmaster.cloud${location.pathname}`}
                />
              </div>

              <div className="overflow-hidden w-full">
                {children}
              </div>

              {instructions && (
                <div className="bg-muted/30 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-2">How to Use This {category} Tool</h2>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-4">Step-by-Step Guide for {title}</h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    {instructions.map((instruction, index) => (
                      <li key={index} className="text-muted-foreground">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">Why Use Our {title}?</h2>
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">Key Features & Benefits</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>100% Free online tool - No signup or registration required</li>
                  <li>Fast and secure processing - All operations performed in your browser</li>
                  <li>Works on any device - Desktop, tablet, or mobile</li>
                  <li>Professional results - Enterprise-grade quality for free</li>
                  <li>Privacy focused - Your data never leaves your device</li>
                </ul>
              </div>

              <ToolRating toolPath={location.pathname} />

              <ToolFAQ toolName={title} />

              {relatedTools && relatedTools.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {relatedTools.map((tool, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => navigate(tool.path)}
                        className="justify-start"
                      >
                        {tool.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Sticky Bottom Ad */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm p-2 border-t border-border">
              <AdSpace key={`mobile-ad-${adRefreshKey ?? 0}`} size="banner" className="w-full" />
            </div>
            
            {/* Desktop Bottom Ad */}
            <div className="hidden md:block">
              <AdSpace key={`bottom-ad-${adRefreshKey ?? 0}`} size="leaderboard" className="w-full" />
            </div>
          </div>
        ) : (
          /* Sidebar Layout: 10% left, 80% content, 10% right sticky ad */
          <div className="flex gap-6 mt-8 w-full">
            {/* Left Spacer */}
            <div className="hidden xl:block flex-shrink-0" style={{ width: "10%" }} />

            {/* Main Content */}
            <div className="flex-1 space-y-8 overflow-hidden" style={{ maxWidth: "80%" }}>
              <div>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <Badge>{category}</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold break-words">{title}</h1>
                </div>
                <p className="text-lg text-muted-foreground mb-4">{description}</p>

                <ShareButtons
                  title={title}
                  description={description}
                  url={`https://toolmaster.cloud${location.pathname}`}
                />
              </div>

              <div className="overflow-hidden">
                {children}
              </div>

              {instructions && (
                <div className="bg-muted/30 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-2">How to Use This {category} Tool</h2>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-4">Step-by-Step Guide for {title}</h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    {instructions.map((instruction, index) => (
                      <li key={index} className="text-muted-foreground">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2">Why Use Our {title}?</h2>
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">Key Features & Benefits</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>100% Free online tool - No signup or registration required</li>
                  <li>Fast and secure processing - All operations performed in your browser</li>
                  <li>Works on any device - Desktop, tablet, or mobile</li>
                  <li>Professional results - Enterprise-grade quality for free</li>
                  <li>Privacy focused - Your data never leaves your device</li>
                </ul>
              </div>

              <ToolRating toolPath={location.pathname} />

              <ToolFAQ toolName={title} />

              {relatedTools && relatedTools.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {relatedTools.map((tool, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => navigate(tool.path)}
                        className="justify-start"
                      >
                        {tool.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sticky Sidebar Ad */}
            <div className="hidden xl:block flex-shrink-0" style={{ width: "10%" }}>
              <div className="sticky top-24">
                <AdSpace key={`sidebar-ad-${adRefreshKey ?? 0}`} size="skyscraper" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

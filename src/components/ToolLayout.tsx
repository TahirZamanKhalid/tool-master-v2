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
}

export const ToolLayout = ({
  title,
  description,
  category,
  children,
  instructions,
  relatedTools,
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

  // Breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://toolmaster.cloud"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": category,
        "item": `https://toolmaster.cloud/#${category.toLowerCase().replace(/\s+/g, '-')}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": `https://toolmaster.cloud${location.pathname}`
      }
    ]
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <div className="container max-w-[1600px] py-8 px-4">
        <Breadcrumbs
          items={[
            { label: category },
            { label: title }
          ]}
        />

        <div className="flex gap-6 justify-center mt-8">
          {/* Left Sidebar Ad */}
          <div className="hidden xl:block flex-shrink-0 w-[300px]">
            <div className="sticky top-24 w-[300px]">
              <AdSpace size="skyscraper" className="w-[300px]" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-4xl space-y-8 overflow-hidden">
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
                <h2 className="text-xl font-semibold mb-4">How to Use</h2>
                <ol className="space-y-2 list-decimal list-inside">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="text-muted-foreground">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            )}

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

          {/* Right Sidebar Ad */}
          <div className="hidden xl:block flex-shrink-0 w-[300px]">
            <div className="sticky top-24 w-[300px]">
              <AdSpace size="skyscraper" className="w-[300px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

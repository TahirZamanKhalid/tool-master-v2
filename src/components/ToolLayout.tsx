import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdSpace } from "@/components/AdSpace";
import { useNavigate, useLocation } from "react-router-dom";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ToolRating } from "@/components/ToolRating";
import { SEOHead } from "@/components/SEOHead";
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

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead 
        title={title}
        description={description}
        keywords={`${title}, ${category}, free online tool, no signup required`}
        canonical={`https://yourdomain.com${location.pathname}`}
      />
      <div className="container max-w-[1600px] py-8 px-4">
        <Breadcrumbs 
          items={[
            { label: category },
            { label: title }
          ]}
        />

        {/* Top Banner Ad */}
        <div className="flex justify-center mb-8 overflow-hidden">
          <AdSpace size="banner" />
        </div>

        <div className="flex gap-6 justify-center">
          {/* Left Sidebar Ad */}
          <div className="hidden xl:block flex-shrink-0">
            <div className="sticky top-24">
              <AdSpace size="skyscraper" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-4xl space-y-8 overflow-hidden">
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Badge>{category}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold break-words">{title}</h1>
              </div>
              <p className="text-lg text-muted-foreground">{description}</p>
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

            <div className="flex justify-center overflow-hidden">
              <AdSpace size="leaderboard" />
            </div>

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
          <div className="hidden xl:block flex-shrink-0">
            <div className="sticky top-24">
              <AdSpace size="skyscraper" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

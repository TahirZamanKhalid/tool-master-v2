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
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={title}
        description={description}
        keywords={`${title}, ${category}, free online tool, no signup required`}
        canonical={`https://yourdomain.com${location.pathname}`}
      />
      <div className="container py-8">
        <Breadcrumbs 
          items={[
            { label: category },
            { label: title }
          ]}
        />

        {/* Top Banner Ad */}
        <AdSpace size="banner" className="mb-8" />

        <div className="grid lg:grid-cols-[300px_1fr_300px] gap-6">
          {/* Left Sidebar Ad */}
          <div className="hidden lg:block">
            <AdSpace size="skyscraper" className="sticky top-24" />
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge>{category}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
              </div>
              <p className="text-lg text-muted-foreground">{description}</p>
            </div>

            {children}

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

            <AdSpace size="leaderboard" />

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
          <div className="hidden lg:block">
            <AdSpace size="skyscraper" className="sticky top-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface SidebarAdProps {
  position: "left" | "right";
  className?: string;
}

export const SidebarAd = ({ position, className = "" }: SidebarAdProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show ads after a short delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed ${
        position === "left" ? "left-4" : "right-4"
      } top-24 hidden xl:block ${className}`}
      style={{ width: "160px", maxWidth: "160px" }}
    >
      <Card className="p-2 bg-muted/50 border-2 border-dashed border-muted-foreground/20">
        <div className="space-y-4" style={{ maxHeight: "600px", overflow: "hidden" }}>
          {/* Skyscraper Ad (160x600) - enforced max dimensions */}
          <div 
            className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center text-center p-4" 
            style={{ height: "600px", maxHeight: "600px", maxWidth: "160px" }}
          >
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold mb-2">Ad Space</p>
              <p>160x600</p>
              <p className="mt-2 text-[10px]">Sidebar Ad</p>
            </div>
          </div>

          {/* Wide Skyscraper Ad (160x600) - Second slot with enforced max dimensions */}
          <div 
            className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg flex items-center justify-center text-center p-4" 
            style={{ height: "600px", maxHeight: "600px", maxWidth: "160px" }}
          >
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold mb-2">Ad Space</p>
              <p>160x600</p>
              <p className="mt-2 text-[10px]">Sidebar Ad #2</p>
            </div>
          </div>
        </div>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Ads help keep tools free
      </p>
    </div>
  );
};

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
      } top-32 hidden xl:block ${className} max-h-[calc(100vh-140px)] overflow-y-auto`}
      style={{ width: "300px" }}
    >
      <div className="space-y-6 sticky top-32">
        <Card className="p-3 bg-muted/50 border-2">
          <div className="text-[10px] text-muted-foreground text-center mb-2">Advertisement</div>
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center text-center p-4" style={{ minHeight: "250px" }}>
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold mb-2">Ad Space</p>
              <p>300x250</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-muted/50 border-2">
          <div className="text-[10px] text-muted-foreground text-center mb-2">Advertisement</div>
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg flex items-center justify-center text-center p-4" style={{ minHeight: "600px" }}>
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold mb-2">Ad Space</p>
              <p>300x600</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-muted/50 border-2">
          <div className="text-[10px] text-muted-foreground text-center mb-2">Advertisement</div>
          <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg flex items-center justify-center text-center p-4" style={{ minHeight: "250px" }}>
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold mb-2">Ad Space</p>
              <p>300x250</p>
            </div>
          </div>
        </Card>

        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Ads help keep tools free
        </p>
      </div>
    </div>
  );
};

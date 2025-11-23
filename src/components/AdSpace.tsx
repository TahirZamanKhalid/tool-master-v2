import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Card } from "./ui/card";
import { Zap } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export interface AdSpaceProps {
  type?: string;
  slot?: string;
  position?: string;
  layoutKey?: string;
  size?: "leaderboard" | "banner" | "skyscraper" | string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: any;
}

export const AdSpace = ({ className, style, size = "leaderboard", slot }: AdSpaceProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const [showFallback, setShowFallback] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log("AdSense generic ad initialized");
          
          // Hide fallback after 3 seconds
          setTimeout(() => setShowFallback(false), 3000);
        }
      } catch (error) {
        console.error("AdSense generic ad error:", error);
        setShowFallback(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  let width = "728px";
  let height = "90px";
  if (size === "skyscraper") {
    width = "300px";
    height = "600px";
  } else if (size === "banner") {
    width = "468px";
    height = "60px";
  }

  const adSlot = slot || "4838473293";

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Fallback content */}
      {showFallback && (
        <Card className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20">
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center space-y-2">
              <Zap className="h-8 w-8 text-accent mx-auto opacity-50" />
              <p className="text-sm font-medium">ToolMaster Pro</p>
              <p className="text-xs text-muted-foreground">100+ Free Online Tools</p>
            </div>
          </div>
        </Card>
      )}
      
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width, height }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

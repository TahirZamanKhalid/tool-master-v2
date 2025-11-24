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
    <div className={`relative ${className}`} style={{ ...style, minHeight: height, minWidth: width }}>
      {/* Fallback content */}
      {showFallback && (
        <Card className="w-full h-full bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 overflow-hidden" style={{ minHeight: height }}>
          <div className="h-full flex items-center justify-center px-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-accent opacity-50 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold leading-none mb-1">ToolMaster Pro</p>
                <p className="text-[10px] text-muted-foreground leading-none">100+ Free Online Tools</p>
              </div>
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

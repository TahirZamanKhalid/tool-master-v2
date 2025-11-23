import { useEffect, useRef, useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import type { AdSpaceProps } from "./AdSpace";
import { Card } from "./ui/card";
import { ExternalLink } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export interface LazyAdSpaceProps extends AdSpaceProps {
  children?: ReactNode;
  [key: string]: any;
}

export const LazyAdSpace = ({ className = "", style, format = "auto", slot }: LazyAdSpaceProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log("AdSense lazy ad initialized");
          setAdLoaded(true);
          
          // Hide fallback after 3 seconds if ad loads
          setTimeout(() => setShowFallback(false), 3000);
        }
      } catch (error) {
        console.error("AdSense lazy ad error:", error);
        setShowFallback(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const height = format === "horizontal" ? "90px" : format === "vertical" ? "600px" : "250px";
  const width = format === "vertical" ? "300px" : "100%";
  const maxWidth = format === "vertical" ? "300px" : "600px";

  const adSlot = slot || "4838473293";

  return (
    <div className={`relative ${className}`} style={{ ...style }}>
      {/* Fallback content when ad isn't loaded */}
      {showFallback && (
        <Card className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <div className="h-full p-4 flex flex-col justify-center items-center text-center space-y-2">
            <ExternalLink className="h-8 w-8 text-primary opacity-50" />
            <h3 className="font-semibold text-sm">Discover More Tools</h3>
            <p className="text-xs text-muted-foreground">
              Explore our collection of PDF, image, and text tools
            </p>
          </div>
        </Card>
      )}
      
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width,
          maxWidth,
          height,
        }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot={adSlot}
        data-ad-format={format === "horizontal" ? "horizontal" : "auto"}
        data-full-width-responsive="true"
      />
    </div>
  );
};

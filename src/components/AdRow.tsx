import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Sparkles } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdRowProps {
  className?: string;
}

export const AdRow = ({ className = "" }: AdRowProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const [showFallback, setShowFallback] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log("AdSense row ad initialized");

          // Hide fallback after 3 seconds if ad loads
          setTimeout(() => setShowFallback(false), 3000);
        }
      } catch (error) {
        console.error("AdSense row ad error:", error);
        setShowFallback(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full flex justify-center my-8 ${className}`}>
      <div className="max-w-[600px] w-full">
        {/* Fallback content */}
        {showFallback && (
          <Card className="w-full h-[200px] bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20 mb-4">
            <div className="h-full flex items-center justify-center text-center p-6">
              <div className="space-y-2">
                <Sparkles className="h-10 w-10 text-primary mx-auto opacity-50" />
                <h3 className="font-bold text-lg">Explore More Tools</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Access 100+ free tools for PDF editing, image processing, text formatting & more
                </p>
              </div>
            </div>
          </Card>
        )}

        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: "block",
            minWidth: "300px",
            maxWidth: "600px",
            width: "100%",
            height: "200px",
          }}
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot="4838473293"
          data-ad-format="horizontal"
          data-full-width-responsive="false"
        />
      </div>
    </div>
  );
};

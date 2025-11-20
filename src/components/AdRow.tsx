import { useEffect, useRef, useState } from "react";

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
  const [adLoaded, setAdLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          // Push to adsbygoogle array to initialize the ad
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log("AdSense ad initialized");
          setAdLoaded(true);
          
          // Hide placeholder after 2 seconds if ad loads
          setTimeout(() => setShowPlaceholder(false), 2000);
        }
      } catch (error) {
        console.error("AdSense initialization error:", error);
        setShowPlaceholder(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full flex justify-center py-4 ${className}`}>
      <div className="max-w-[600px] w-full min-h-[200px] relative">
        {/* Placeholder background */}
        {showPlaceholder && (
          <div className="absolute inset-0 bg-muted/30 border border-border rounded flex items-center justify-center">
            <div className="text-center text-muted-foreground text-sm">
              <div className="mb-2">📢 Advertisement</div>
              <div className="text-xs">Loading ad content...</div>
            </div>
          </div>
        )}
        
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ 
            display: "block",
            minWidth: "300px",
            maxWidth: "600px",
            width: "100%",
            height: "200px"
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

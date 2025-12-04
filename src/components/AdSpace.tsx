import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

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
  const [adStatus, setAdStatus] = useState<string>("initializing");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          const adElement = adRef.current;
          
          // Debug logging
          console.log("[AdSpace Debug] Attempting to push ad...", { size, slot });
          console.log("[AdSpace Debug] adsbygoogle available:", typeof window.adsbygoogle);
          console.log("[AdSpace Debug] Ad element dimensions:", {
            width: adElement.offsetWidth,
            height: adElement.offsetHeight,
          });
          console.log("[AdSpace Debug] Ad element visible:", adElement.offsetParent !== null);
          
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdStatus("pushed");
          console.log("[AdSpace Debug] Ad push successful");
          
          // Check ad status after a delay
          setTimeout(() => {
            const computedStyle = window.getComputedStyle(adElement);
            console.log("[AdSpace Debug] Post-push status:", {
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              height: computedStyle.height,
              dataAdStatus: adElement.getAttribute("data-ad-status"),
            });
          }, 2000);
        } else {
          console.log("[AdSpace Debug] Ad ref is null");
          setAdStatus("ref-null");
        }
      } catch (error) {
        console.error("[AdSpace Debug] AdSense error:", error);
        setAdStatus("error");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  let width = "600px";
  let height = "300px";
  if (size === "skyscraper") {
    width = "300px";
    height = "600px";
  } else if (size === "banner") {
    width = "468px";
    height = "60px";
  }

  const adSlot = slot || "2931558314";

  return (
    <div className={`${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "inline-block", width, height }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot={adSlot}
      />
    </div>
  );
};

import { useEffect, useRef, useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import type { AdSpaceProps } from "./AdSpace";

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
  const [adStatus, setAdStatus] = useState<string>("initializing");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          const adElement = adRef.current;
          
          // Debug logging
          console.log("[LazyAdSpace Debug] Attempting to push ad...", { format, slot });
          console.log("[LazyAdSpace Debug] adsbygoogle available:", typeof window.adsbygoogle);
          console.log("[LazyAdSpace Debug] Ad element dimensions:", {
            width: adElement.offsetWidth,
            height: adElement.offsetHeight,
          });
          console.log("[LazyAdSpace Debug] Ad element visible:", adElement.offsetParent !== null);
          
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdStatus("pushed");
          console.log("[LazyAdSpace Debug] Ad push successful");
          
          // Check ad status after a delay
          setTimeout(() => {
            const computedStyle = window.getComputedStyle(adElement);
            console.log("[LazyAdSpace Debug] Post-push status:", {
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              height: computedStyle.height,
              dataAdStatus: adElement.getAttribute("data-ad-status"),
            });
          }, 2000);
        } else {
          console.log("[LazyAdSpace Debug] Ad ref is null");
          setAdStatus("ref-null");
        }
      } catch (error) {
        console.error("[LazyAdSpace Debug] AdSense error:", error);
        setAdStatus("error");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const height = format === "horizontal" ? "300px" : format === "vertical" ? "600px" : "300px";
  const width = format === "vertical" ? "300px" : "600px";

  const adSlot = slot || "2931558314";

  return (
    <div className={`${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "inline-block",
          width,
          height,
        }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot={adSlot}
      />
    </div>
  );
};

import { useEffect, useRef } from "react";
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

// Ad slots by format
const AD_SLOTS = {
  horizontal: "9769564871", // Display ad for horizontal
  vertical: "1212397554", // Sidebar Display ad
  auto: "9769564871", // Default display
};

export const LazyAdSpace = ({ className = "", style, format = "auto", slot }: LazyAdSpaceProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error("AdSense lazy ad error:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const height = format === "horizontal" ? "300px" : format === "vertical" ? "600px" : "300px";
  const width = format === "vertical" ? "300px" : "600px";

  const adSlot = slot || AD_SLOTS[format as keyof typeof AD_SLOTS] || AD_SLOTS.auto;

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

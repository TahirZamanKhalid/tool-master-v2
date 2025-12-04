import { useEffect, useRef } from "react";
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

// Ad slots by type
const AD_SLOTS = {
  leaderboard: "9769564871", // testing adsssss - Display (600x300)
  banner: "1575962277", // Display ad 10 (468x60)
  skyscraper: "1212397554", // Side bar for both mobile and desktop (300x600)
  sidebar: "5628599414", // Side bar Ads1 (300x600)
};

export const AdSpace = ({ className, style, size = "leaderboard", slot }: AdSpaceProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error("AdSense generic ad error:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  let width = "600px";
  let height = "300px";
  if (size === "skyscraper" || size === "sidebar") {
    width = "300px";
    height = "600px";
  } else if (size === "banner") {
    width = "468px";
    height = "60px";
  }

  // Use provided slot or get from AD_SLOTS based on size
  const adSlot = slot || AD_SLOTS[size as keyof typeof AD_SLOTS] || AD_SLOTS.leaderboard;

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

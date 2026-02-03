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
  size?: "leaderboard" | "banner" | "skyscraper" | "sidebar" | "sidebar-alt" | "square-300" | "medium-rect" | "custom";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: any;
}

// Ad slots by type - Updated with all provided AdSense slots
const AD_SLOTS = {
  // Display Ads - Various sizes
  leaderboard: "9769564871", // testing adsssss - Display (600x300)
  banner: "1575962277", // Display ad 10 (468x60)
  skyscraper: "1212397554", // Side bar for both mobile and desktop (300x600)
  sidebar: "5628599414", // Side bar Ads1 (300x600)
  "sidebar-alt": "7110517063", // code beautifer 300x600
  "square-300": "4153181237", // Code Beautifier 300x300
  "medium-rect": "7713152297", // Code beautifer 300x250
  "video-1": "8364314011", // video trimer 1
  "video-2": "5105501959", // video trimmer 2
  "display-2": "2918331088", // Display Ad 2
  "display-3": "4402803148", // Display ad 3
  "display-6": "9239216915", // Display ad 6
  "display-7": "8923135106", // Display ad 7
  "display-8": "4202125614", // Display ad 8
  "display-9": "2889043946", // Display ad 9
  "blog-ad": "8907016752", // blog page ad 1
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
        console.error("AdSense error:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Determine dimensions based on size
  let width = "600px";
  let height = "300px";

  if (size === "skyscraper" || size === "sidebar" || size === "sidebar-alt") {
    width = "300px";
    height = "600px";
  } else if (size === "banner") {
    width = "468px";
    height = "60px";
  } else if (size === "square-300") {
    width = "300px";
    height = "300px";
  } else if (size === "medium-rect") {
    width = "300px";
    height = "250px";
  } else if (size === "custom" && slot) {
    // For custom sizes, let CSS handle it
    width = "100%";
    height = "auto";
  }

  // Use provided slot or get from AD_SLOTS based on size
  const adSlot = slot || AD_SLOTS[size as keyof typeof AD_SLOTS] || AD_SLOTS.leaderboard;

  return (
    <div className={`ad-container ${className || ""}`} style={style}>
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

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

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
  size?:
  | "leaderboard"
  | "banner"
  | "skyscraper"
  | "sidebar"
  | "sidebar-alt"
  | "square-300"
  | "medium-rect"
  | "custom";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: any;
}

const AD_SLOTS = {
  leaderboard: "9769564871",
  banner: "1575962277",
  skyscraper: "1212397554",
  sidebar: "5628599414",
  "sidebar-alt": "7110517063",
  "square-300": "4153181237",
  "medium-rect": "7713152297",
  "video-1": "8364314011",
  "video-2": "5105501959",
  "display-2": "2918331088",
  "display-3": "4402803148",
  "display-6": "9239216915",
  "display-7": "8923135106",
  "display-8": "4202125614",
  "display-9": "2889043946",
  "blog-ad": "8907016752",
};

// Size configurations
const SIZE_CONFIG: Record<string, { width: string; height: string; minWidth: string; minHeight: string }> = {
  leaderboard: { width: "100%", height: "auto", minWidth: "320px", minHeight: "100px" },
  banner: { width: "100%", height: "auto", minWidth: "320px", minHeight: "60px" },
  skyscraper: { width: "300px", height: "600px", minWidth: "160px", minHeight: "600px" },
  sidebar: { width: "300px", height: "600px", minWidth: "160px", minHeight: "250px" },
  "sidebar-alt": { width: "300px", height: "600px", minWidth: "160px", minHeight: "250px" },
  "square-300": { width: "300px", height: "300px", minWidth: "250px", minHeight: "250px" },
  "medium-rect": { width: "300px", height: "250px", minWidth: "250px", minHeight: "250px" },
  custom: { width: "100%", height: "auto", minWidth: "250px", minHeight: "100px" },
};

export const AdSpace = ({ className, style, size = "leaderboard", slot }: AdSpaceProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adFailed, setAdFailed] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    let observer: ResizeObserver | null = null;
    let timer: ReturnType<typeof setTimeout>;

    const pushAd = () => {
      try {
        if (adRef.current && containerRef.current) {
          const containerWidth = containerRef.current.offsetWidth;

          // Only push ad if container has actual width
          if (containerWidth > 0) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("AdSense error:", error);
        setAdFailed(true);
        return true; // Stop retrying on error
      }
    };

    // Try pushing ad after a short delay
    timer = setTimeout(() => {
      if (!pushAd()) {
        // If container has no width yet, observe for resize
        observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect.width > 0) {
              pushAd();
              observer?.disconnect();
            }
          }
        });

        if (containerRef.current) {
          observer.observe(containerRef.current);
        }

        // Fallback: try again after 2 seconds
        setTimeout(() => {
          if (!adLoaded) {
            pushAd();
            observer?.disconnect();
          }
        }, 2000);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, []);

  const config = SIZE_CONFIG[size] || SIZE_CONFIG.leaderboard;
  const adSlot = slot || AD_SLOTS[size as keyof typeof AD_SLOTS] || AD_SLOTS.leaderboard;

  return (
    <div
      ref={containerRef}
      className={`ad-container w-full ${className || ""}`}
      style={{
        minWidth: config.minWidth,
        minHeight: config.minHeight,
        overflow: "hidden",
        ...style,
      }}
    >
      {adFailed ? (
        <div
          className="flex items-center justify-center bg-muted/20 rounded-lg border border-dashed border-border/40 text-muted-foreground text-xs"
          style={{ width: "100%", height: config.minHeight }}
        >
          Advertisement
        </div>
      ) : (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: "block",
            width: config.width,
            height: config.height,
            minWidth: config.minWidth,
            minHeight: config.minHeight,
          }}
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
};
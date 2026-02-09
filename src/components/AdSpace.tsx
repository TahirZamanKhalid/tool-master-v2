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
  const [adPushed, setAdPushed] = useState(false);

  useEffect(() => {
    if (adPushed) return;

    let observer: ResizeObserver | null = null;
    let retryTimer: ReturnType<typeof setTimeout>;

    const pushAd = (): boolean => {
      try {
        if (adRef.current && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          console.log(`[AdSpace] slot=${slot || size}, width=${rect.width}, height=${rect.height}`);

          if (rect.width > 0) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdPushed(true);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("AdSense error:", error);
        setAdFailed(true);
        return true;
      }
    };

    const initialTimer = setTimeout(() => {
      if (!pushAd()) {
        // Observe for width changes
        observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect.width > 0 && !adPushed) {
              if (pushAd()) {
                observer?.disconnect();
              }
            }
          }
        });

        if (containerRef.current) {
          observer.observe(containerRef.current);
        }

        // Final retry
        retryTimer = setTimeout(() => {
          if (!adPushed) {
            if (!pushAd()) {
              console.warn(`[AdSpace] Still 0 width after 3s: slot=${slot || size}`);
              setAdFailed(true);
            }
          }
          observer?.disconnect();
        }, 3000);
      }
    }, 300);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(retryTimer);
      observer?.disconnect();
    };
  }, [slot, size, adPushed]);

  const config = SIZE_CONFIG[size] || SIZE_CONFIG.leaderboard;
  const adSlot = slot || AD_SLOTS[size as keyof typeof AD_SLOTS] || AD_SLOTS.leaderboard;

  // For sidebar sizes, use fixed width; for others, use 100%
  const isSidebarSize = ["skyscraper", "sidebar", "sidebar-alt", "square-300", "medium-rect"].includes(size);
  const containerWidth = isSidebarSize ? config.width : "100%";

  return (
    <div
      ref={containerRef}
      className={`ad-container ${className || ""}`}
      style={{
        display: "block",
        width: containerWidth,
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
            width: isSidebarSize ? config.width : "100%",
            height: isSidebarSize ? config.height : "auto",
            minWidth: config.minWidth,
            minHeight: config.minHeight,
          }}
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot={adSlot}
          data-ad-format={isSidebarSize ? "vertical" : "auto"}
          data-full-width-responsive={isSidebarSize ? "false" : "true"}
        />
      )}
    </div>
  );
};
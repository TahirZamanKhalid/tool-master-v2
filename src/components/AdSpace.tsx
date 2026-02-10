import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ensureAdSenseLoaded } from "@/utils/adsense";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export interface AdSpaceProps {
  size?:
  | "leaderboard"
  | "banner"
  | "skyscraper"
  | "sidebar"
  | "sidebar-alt"
  | "square-300"
  | "medium-rect"
  | "custom";
  slot?: string;
  className?: string;
  style?: CSSProperties;
  lazy?: boolean;
}

const AD_SLOTS = {
  leaderboard: "9769564871",
  banner: "1575962277",
  skyscraper: "1212397554",
  sidebar: "5628599414",
  "sidebar-alt": "7110517063",
  "square-300": "4153181237",
  "medium-rect": "7713152297",
};

const SIZE_CONFIG: Record<
  string,
  { width: string; height: string; minWidth: string; minHeight: string }
> = {
  leaderboard: { width: "100%", height: "auto", minWidth: "320px", minHeight: "100px" },
  banner: { width: "100%", height: "auto", minWidth: "320px", minHeight: "60px" },
  skyscraper: { width: "300px", height: "600px", minWidth: "160px", minHeight: "600px" },
  sidebar: { width: "300px", height: "600px", minWidth: "160px", minHeight: "250px" },
  "sidebar-alt": { width: "300px", height: "600px", minWidth: "160px", minHeight: "250px" },
  "square-300": { width: "300px", height: "300px", minWidth: "250px", minHeight: "250px" },
  "medium-rect": { width: "300px", height: "250px", minWidth: "250px", minHeight: "250px" },
  custom: { width: "100%", height: "auto", minWidth: "250px", minHeight: "100px" },
};

export const AdSpace = ({
  size = "leaderboard",
  slot,
  className,
  style,
  lazy = true,
}: AdSpaceProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const isPushedRef = useRef(false);

  const config = SIZE_CONFIG[size] || SIZE_CONFIG.leaderboard;
  const adSlot = slot || AD_SLOTS[size as keyof typeof AD_SLOTS] || AD_SLOTS.leaderboard;
  const isSidebarSize = ["skyscraper", "sidebar", "sidebar-alt", "square-300", "medium-rect"].includes(size);

  useEffect(() => {
    ensureAdSenseLoaded();
  }, []);

  useEffect(() => {
    if (!lazy || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px", threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isVisible]);

  useEffect(() => {
    if (!isVisible || isPushedRef.current) return;

    const pushAd = () => {
      if (isPushedRef.current) return;

      try {
        ensureAdSenseLoaded();

        if (!adRef.current || !containerRef.current) {
          setTimeout(pushAd, 300);
          return;
        }

        const width = containerRef.current.offsetWidth;

        if (width < 10) {
          console.warn(`[AdSpace] Container width: ${width}px - retrying...`);
          setTimeout(pushAd, 500);
          return;
        }

        isPushedRef.current = true;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log(`[AdSpace] ✅ Pushed slot ${adSlot} (${size}), width: ${width}px`);

      } catch (error) {
        console.error(`[AdSpace] Error:`, error);
        isPushedRef.current = true;
      }
    };

    const timer = setTimeout(pushAd, 800);
    return () => clearTimeout(timer);
  }, [isVisible, adSlot, size]);

  const containerWidth = isSidebarSize ? config.width : "100%";

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: "block",
        width: containerWidth,
        minWidth: config.minWidth,
        minHeight: config.minHeight,
        margin: "0 auto",
        ...style,
      }}
    >
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
    </div>
  );
};
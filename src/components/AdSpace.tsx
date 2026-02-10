import { useEffect, useRef, useState, memo } from "react";
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
  lazy?: boolean; // Enable lazy loading
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
  className,
  style,
  size = "leaderboard",
  slot,
  lazy = true, // Default to lazy loading
}: AdSpaceProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adFailed, setAdFailed] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy); // Immediately visible if not lazy
  const isPushedRef = useRef(false); // ✅ Use ref instead of state to prevent race conditions

  // Get config and slot early for use in effects
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.leaderboard;
  const adSlot = slot || AD_SLOTS[size as keyof typeof AD_SLOTS] || AD_SLOTS.leaderboard;
  const isSidebarSize = ["skyscraper", "sidebar", "sidebar-alt", "square-300", "medium-rect"].includes(size);

  // ✅ Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log(`[AdSpace] Ad slot ${adSlot} (${size}) became visible`);
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Load 200px before visible
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, isVisible, adSlot, size]);

  // ✅ Push ad when visible and container has width
  useEffect(() => {
    // Don't proceed if not visible or already pushed
    if (!isVisible || isPushedRef.current) return;

    let pushAttemptTimer: ReturnType<typeof setTimeout>;
    let retryTimer: ReturnType<typeof setTimeout>;

    const pushAd = (): boolean => {
      // Double-check to prevent duplicate pushes
      if (isPushedRef.current) {
        console.warn(`[AdSpace] Ad already pushed for slot ${adSlot}`);
        return true;
      }

      try {
        if (!adRef.current || !containerRef.current) {
          console.log(`[AdSpace] Refs not ready for slot ${adSlot}`);
          return false;
        }

        const rect = containerRef.current.getBoundingClientRect();
        console.log(`[AdSpace] Attempting push for slot ${adSlot} (${size}), width: ${rect.width}px`);

        if (rect.width < 10) {
          console.log(`[AdSpace] Container too narrow (${rect.width}px) for slot ${adSlot}`);
          return false;
        }

        // ✅ Mark as pushed BEFORE the actual push to prevent race conditions
        isPushedRef.current = true;

        // Push the ad
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log(`[AdSpace] ✅ Successfully pushed ad for slot ${adSlot} (${size})`);

        return true;
      } catch (error) {
        console.error(`[AdSpace] Error pushing ad for slot ${adSlot}:`, error);
        setAdFailed(true);
        isPushedRef.current = true; // ✅ Prevent retry on error
        return false;
      }
    };

    // Initial attempt after a short delay for DOM to settle
    pushAttemptTimer = setTimeout(() => {
      if (!pushAd()) {
        // If first attempt failed due to width, retry once after delay
        console.log(`[AdSpace] First attempt failed for slot ${adSlot}, scheduling retry...`);

        retryTimer = setTimeout(() => {
          if (!isPushedRef.current) {
            if (!pushAd()) {
              console.warn(`[AdSpace] Failed to load ad for slot ${adSlot} after retry`);
              setAdFailed(true);
            }
          }
        }, 2000); // Retry after 2 seconds
      }
    }, 100); // Small initial delay

    // Cleanup timers
    return () => {
      clearTimeout(pushAttemptTimer);
      clearTimeout(retryTimer);
    };
  }, [isVisible, adSlot, size]);

  // Container width calculation
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
        backgroundColor: "transparent",
        ...style,
      }}
      data-ad-slot={adSlot} // For debugging
      data-ad-size={size}
    >
      {adFailed ? (
        // ✅ Error/fallback state
        <div
          className="flex items-center justify-center bg-muted/20 rounded-lg border border-dashed border-border/40 text-muted-foreground text-xs"
          style={{
            width: "100%",
            minHeight: config.minHeight,
            padding: "20px",
          }}
        >
          <span>Advertisement space</span>
        </div>
      ) : isVisible ? (
        // ✅ Ad is visible, render the ins element
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
      ) : (
        // ✅ Loading placeholder (before lazy load triggers)
        <div
          className="flex items-center justify-center bg-muted/10 rounded-lg animate-pulse"
          style={{
            width: "100%",
            minHeight: config.minHeight,
          }}
        >
          <span className="text-muted-foreground text-xs">Loading ad...</span>
        </div>
      )}
    </div>
  );
};

// ✅ Memoized version to prevent unnecessary re-renders
export const MemoizedAdSpace = memo(AdSpace, (prevProps, nextProps) => {
  return (
    prevProps.slot === nextProps.slot &&
    prevProps.size === nextProps.size &&
    prevProps.lazy === nextProps.lazy
  );
});
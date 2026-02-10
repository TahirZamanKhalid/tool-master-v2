import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export interface AdRowProps {
  slot?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  lazy?: boolean; // Optional: Enable lazy loading
  format?: "auto" | "autorelaxed" | "fluid"; // Ad format type
}

const MULTIPLEX_SLOTS = {
  "dice-roller": "4974734897",
  "json-validator": "2931558314",
  watermark: "4838473293",
  "multiplex-1": "2127993591",
  "multiplex-2": "4356563508",
  "multiplex-3": "7202218695",
};

export const AdRow = ({
  className,
  style,
  slot,
  lazy = true, // Enable lazy loading by default
  format = "auto" // Use 'auto' instead of 'autorelaxed' to reduce data usage
}: AdRowProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adFailed, setAdFailed] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy); // If not lazy, immediately visible
  const isPushedRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          console.log(`[AdRow] Ad slot ${slot} became visible`);
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '200px', // Load 200px before visible
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, slot, isVisible]);

  // Push ad when visible and container has width
  useEffect(() => {
    // Don't proceed if not visible or already pushed
    if (!isVisible || isPushedRef.current) return;

    let pushAttemptTimer: ReturnType<typeof setTimeout>;
    let retryTimer: ReturnType<typeof setTimeout>;

    const pushAd = (): boolean => {
      // Double-check to prevent duplicate pushes
      if (isPushedRef.current) {
        console.warn(`[AdRow] Ad already pushed for slot ${slot}`);
        return true;
      }

      try {
        if (!adRef.current || !containerRef.current) {
          console.log(`[AdRow] Refs not ready for slot ${slot}`);
          return false;
        }

        const containerWidth = containerRef.current.getBoundingClientRect().width;
        console.log(`[AdRow] Attempting push for slot ${slot}, width: ${containerWidth}px`);

        if (containerWidth < 10) {
          console.log(`[AdRow] Container too narrow (${containerWidth}px) for slot ${slot}`);
          return false;
        }

        // Mark as pushed BEFORE the actual push to prevent race conditions
        isPushedRef.current = true;

        // Push the ad
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log(`[AdRow] ✅ Successfully pushed ad for slot ${slot}`);

        return true;
      } catch (error) {
        console.error(`[AdRow] Error pushing ad for slot ${slot}:`, error);
        setAdFailed(true);
        // Keep isPushedRef true to prevent retries after error
        isPushedRef.current = true;
        return false;
      }
    };

    // Initial attempt after a short delay for DOM to settle
    pushAttemptTimer = setTimeout(() => {
      if (!pushAd()) {
        // If first attempt failed due to width, retry once after delay
        console.log(`[AdRow] First attempt failed for slot ${slot}, scheduling retry...`);

        retryTimer = setTimeout(() => {
          if (!isPushedRef.current) {
            if (!pushAd()) {
              console.warn(`[AdRow] Failed to load ad for slot ${slot} after retry`);
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
  }, [isVisible, slot]);

  // Get the ad slot ID
  const adSlot = slot || MULTIPLEX_SLOTS["multiplex-1"];

  return (
    <div
      ref={containerRef}
      className={`ad-row-container ${className || ""}`}
      style={{
        display: "block",
        width: "100%",
        minWidth: "300px",
        minHeight: "250px", // Reduced from 280px to standard banner height
        backgroundColor: "transparent",
        ...style,
      }}
      data-ad-slot={adSlot} // For debugging
    >
      {adFailed ? (
        <div
          className="flex items-center justify-center bg-muted/20 rounded-lg border border-dashed border-border/40 text-muted-foreground text-xs"
          style={{
            width: "100%",
            minHeight: "250px",
            padding: "20px"
          }}
        >
          <span>Advertisement space</span>
        </div>
      ) : isVisible ? (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            minWidth: "300px",
            minHeight: "250px",
          }}
          data-ad-format={format}
          data-full-width-responsive="true"
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot={adSlot}
        />
      ) : (
        // Placeholder while loading
        <div
          className="flex items-center justify-center bg-muted/10 rounded-lg animate-pulse"
          style={{
            width: "100%",
            minHeight: "250px"
          }}
        >
          <span className="text-muted-foreground text-xs">Loading ad...</span>
        </div>
      )}
    </div>
  );
};

// Optional: Export a memoized version for better performance
import { memo } from "react";

export const MemoizedAdRow = memo(AdRow, (prevProps, nextProps) => {
  // Only re-render if slot changes
  return prevProps.slot === nextProps.slot;
});
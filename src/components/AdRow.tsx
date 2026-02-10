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
  lazy?: boolean;
  format?: "auto" | "autorelaxed" | "fluid";
  isMultiplex?: boolean;
}

const MULTIPLEX_SLOTS = {
  "dice-roller": "4974734897",
  "json-validator": "2931558314",
  watermark: "4838473293",
  "multiplex-1": "2127993591",
  "multiplex-2": "4356563508",
  "multiplex-3": "7202218695",
};

// Global Set to track pushed slots
const pushedSlots = new Set<string>();

export const AdRow = ({
  className,
  style,
  slot,
  lazy = true,
  format = "auto",
  isMultiplex = false,
}: AdRowProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const isPushedRef = useRef(false);

  const slotId = slot || MULTIPLEX_SLOTS["multiplex-1"];
  const isMultiplexAd = isMultiplex || Object.values(MULTIPLEX_SLOTS).includes(slotId);
  const adFormat = isMultiplexAd ? "autorelaxed" : format;

  // Lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px', threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isVisible]);

  // Push ad when visible
  useEffect(() => {
    if (!isVisible || isPushedRef.current) return;

    const pushAd = () => {
      if (isPushedRef.current) return;

      // Check if this slot was already pushed globally
      if (pushedSlots.has(slotId)) {
        console.warn(`[AdRow] Slot ${slotId} already pushed globally, skipping`);
        isPushedRef.current = true;
        return;
      }

      try {
        // Check if AdSense is available
        if (typeof window === 'undefined' || !window.adsbygoogle) {
          console.log('[AdRow] AdSense not ready yet, retrying...');
          setTimeout(pushAd, 1000);
          return;
        }

        if (!adRef.current || !containerRef.current) {
          setTimeout(pushAd, 500);
          return;
        }

        const width = containerRef.current.offsetWidth;

        if (width < 10) {
          console.warn(`[AdRow] Container width: ${width}px - retrying...`);
          setTimeout(pushAd, 500);
          return;
        }

        // Mark as pushed BEFORE the actual push
        isPushedRef.current = true;
        pushedSlots.add(slotId);

        // Push the ad
        console.log(`[AdRow] Pushing ad for slot ${slotId}, width: ${width}px`);
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log(`[AdRow] ✅ Pushed slot ${slotId}, total pushed: ${window.adsbygoogle.length}`);

        // Verify after push
        setTimeout(() => {
          if (adRef.current) {
            const status = adRef.current.getAttribute('data-ad-status');
            const hasContent = adRef.current.innerHTML.length > 10;
            console.log(`[AdRow] Verification - Slot: ${slotId}, Status: ${status}, HasContent: ${hasContent}`);
          }
        }, 3000);

      } catch (error) {
        console.error(`[AdRow] Error pushing ad:`, error);
        isPushedRef.current = true;
        pushedSlots.add(slotId);
      }
    };

    // Wait for page to be ready
    const timer = setTimeout(pushAd, 1500);
    return () => clearTimeout(timer);
  }, [isVisible, slotId]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: "block",
        width: "100%",
        minWidth: "300px",
        minHeight: isMultiplexAd ? "280px" : "250px",
        margin: "0 auto",
        ...style,
      }}
      data-ad-container-slot={slotId}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          minWidth: "300px",
          minHeight: isMultiplexAd ? "280px" : "250px",
        }}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot={slotId}
      />
    </div>
  );
};
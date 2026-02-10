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
  isMultiplex?: boolean; // Add this to identify multiplex ads
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
  lazy = true,
  format = "auto",
  isMultiplex = false, // Default to false
}: AdRowProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const isPushedRef = useRef(false);

  // Auto-detect if slot is multiplex
  const slotId = slot || MULTIPLEX_SLOTS["multiplex-1"];
  const isMultiplexAd = isMultiplex || Object.values(MULTIPLEX_SLOTS).includes(slotId);
  const adFormat = isMultiplexAd ? "autorelaxed" : format;

  // Lazy loading
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log(`[AdRow] Slot ${slotId} visible`);
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, slotId]);

  // Push ad
  useEffect(() => {
    if (!isVisible || isPushedRef.current) return;

    const pushAd = () => {
      if (isPushedRef.current) return;

      try {
        if (!adRef.current || !containerRef.current) {
          console.log('[AdRow] Refs not ready');
          return;
        }

        const width = containerRef.current.getBoundingClientRect().width;
        console.log(`[AdRow] Pushing ad - Slot: ${slotId}, Width: ${width}px, Format: ${adFormat}`);

        if (width < 10) {
          console.warn(`[AdRow] Container too narrow: ${width}px`);
          setTimeout(pushAd, 500);
          return;
        }

        isPushedRef.current = true;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log(`[AdRow] ✅ Ad pushed for slot ${slotId}`);

        // Debug after 3 seconds
        setTimeout(() => {
          if (adRef.current) {
            const hasIframe = adRef.current.querySelector('iframe') !== null;
            const status = adRef.current.getAttribute('data-ad-status');
            console.log(`[AdRow] Ad status - Slot: ${slotId}, HasIframe: ${hasIframe}, Status: ${status}`);
          }
        }, 3000);

      } catch (error) {
        console.error(`[AdRow] Error:`, error);
        isPushedRef.current = true;
      }
    };

    const timer = setTimeout(pushAd, 100);
    return () => clearTimeout(timer);
  }, [isVisible, slotId, adFormat]);

  return (
    <div
      ref={containerRef}
      className={`ad-row-container ${className || ""}`}
      style={{
        display: "block",
        width: "100%",
        minWidth: "300px",
        minHeight: isMultiplexAd ? "280px" : "250px",
        margin: "0 auto",
        backgroundColor: "transparent",
        ...style,
      }}
      data-ad-slot={slotId}
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
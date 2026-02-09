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
}

const MULTIPLEX_SLOTS = {
  "dice-roller": "4974734897",
  "json-validator": "2931558314",
  watermark: "4838473293",
  "multiplex-1": "2127993591",
  "multiplex-2": "4356563508",
  "multiplex-3": "7202218695",
};

export const AdRow = ({ className, style, slot }: AdRowProps) => {
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

          if (containerWidth > 0) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("AdSense multiplex error:", error);
        setAdFailed(true);
        return true;
      }
    };

    timer = setTimeout(() => {
      if (!pushAd()) {
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

  const adSlot = slot || MULTIPLEX_SLOTS["multiplex-1"];

  return (
    <div
      ref={containerRef}
      className={`ad-row-container w-full ${className || ""}`}
      style={{
        minWidth: "300px",
        minHeight: "250px",
        overflow: "hidden",
        ...style,
      }}
    >
      {adFailed ? (
        <div className="flex items-center justify-center bg-muted/20 rounded-lg border border-dashed border-border/40 text-muted-foreground text-xs w-full min-h-[250px]">
          Advertisement
        </div>
      ) : (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            minWidth: "300px",
            minHeight: "250px",
          }}
          data-ad-format="autorelaxed"
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot={adSlot}
        />
      )}
    </div>
  );
};
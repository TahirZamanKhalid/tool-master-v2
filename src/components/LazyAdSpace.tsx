import { useEffect, useRef, useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import type { AdSpaceProps } from "./AdSpace";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export interface LazyAdSpaceProps extends AdSpaceProps {
  children?: ReactNode;
  format?: "horizontal" | "vertical" | "auto";
  [key: string]: any;
}

const AD_SLOTS = {
  horizontal: "9769564871",
  vertical: "1212397554",
  auto: "9769564871",
};

const FORMAT_CONFIG = {
  horizontal: { width: "100%", height: "auto", minWidth: "320px", minHeight: "100px" },
  vertical: { width: "300px", height: "auto", minWidth: "160px", minHeight: "250px" },
  auto: { width: "100%", height: "auto", minWidth: "320px", minHeight: "100px" },
};

export const LazyAdSpace = ({
  className = "",
  style,
  format = "auto",
  slot,
}: LazyAdSpaceProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adFailed, setAdFailed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Lazy load: only load when visible in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Push ad when visible and container has width
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      try {
        if (adRef.current && containerRef.current) {
          const width = containerRef.current.offsetWidth;
          if (width > 0) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } else {
            setAdFailed(true);
          }
        }
      } catch (error) {
        console.error("AdSense lazy ad error:", error);
        setAdFailed(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isVisible]);

  const config = FORMAT_CONFIG[format];
  const adSlot = slot || AD_SLOTS[format] || AD_SLOTS.auto;

  return (
    <div
      ref={containerRef}
      className={`lazy-ad-container ${className}`}
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
      ) : isVisible ? (
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
      ) : (
        <div
          className="flex items-center justify-center bg-muted/10 rounded-lg text-muted-foreground text-xs"
          style={{ width: "100%", height: config.minHeight }}
        >
          Loading ad...
        </div>
      )}
    </div>
  );
};
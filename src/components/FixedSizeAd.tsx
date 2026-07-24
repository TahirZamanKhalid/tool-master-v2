import { useRef } from "react";
import { ADSENSE_CLIENT, useAdSenseUnit } from "@/hooks/useAdSenseUnit";
import { useInlineAdsAllowed } from "@/hooks/useInlineAdsAllowed";

interface FixedSizeAdProps {
  slot: string;
  width: number;
  height: number;
  className?: string;
}

export const FixedSizeAd = ({
  slot,
  width,
  height,
  className = "",
}: FixedSizeAdProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inlineAdsAllowed = useInlineAdsAllowed();

  useAdSenseUnit({
    adRef,
    containerRef,
    enabled: inlineAdsAllowed,
    lazy: true,
    minWidth: Math.min(width, 100),
    rootMargin: "250px",
  });

  if (!inlineAdsAllowed) return null;

  return (
    <div
      ref={containerRef}
      aria-label="Advertisement"
      className={`flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card ${className}`}
      style={{ minHeight: `${height + 30}px` }}
      data-ad-container-slot={slot}
    >
      <div className="mb-2 w-full border-b border-border/40 bg-muted/30 py-1.5 text-center text-[10px] uppercase text-muted-foreground">
        Advertisement
      </div>
      <div style={{ width: `${width}px`, height: `${height}px`, overflow: "hidden" }}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "inline-block", width: `${width}px`, height: `${height}px` }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
        />
      </div>
    </div>
  );
};

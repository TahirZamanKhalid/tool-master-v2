import { useRef, useState } from "react";
import type { AdSenseSlotStatus } from "@/hooks/useAdSenseUnit";
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
  const [slotStatus, setSlotStatus] = useState<AdSenseSlotStatus>("idle");
  const inlineAdsAllowed = useInlineAdsAllowed();
  const isCollapsedSlot = slotStatus === "unfilled" || slotStatus === "blocked";
  const shouldReserveSpace =
    slotStatus === "requested" ||
    slotStatus === "filled" ||
    slotStatus === "unfill-optimized";
  const isVisible = shouldReserveSpace && !isCollapsedSlot;
  const collapsedHeight = isCollapsedSlot ? "0px" : "1px";

  useAdSenseUnit({
    adRef,
    containerRef,
    enabled: inlineAdsAllowed,
    lazy: true,
    minWidth: Math.min(width, 100),
    rootMargin: "250px",
    onStatusChange: setSlotStatus,
  });

  if (!inlineAdsAllowed) return null;

  return (
    <div
      ref={containerRef}
      aria-label="Advertisement"
      aria-hidden={!isVisible}
      className={`flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card ${className}`}
      style={{
        minHeight: isVisible ? `${height + 30}px` : collapsedHeight,
        height: isVisible ? undefined : collapsedHeight,
        margin: isVisible ? undefined : 0,
        borderWidth: isVisible ? undefined : 0,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? undefined : "none",
      }}
      data-ad-container-slot={slot}
      data-ad-slot-status={slotStatus}
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

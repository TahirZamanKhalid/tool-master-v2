import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { AdSenseSlotStatus } from "@/hooks/useAdSenseUnit";
import { ADSENSE_CLIENT, useAdSenseUnit } from "@/hooks/useAdSenseUnit";
import { useInlineAdsAllowed } from "@/hooks/useInlineAdsAllowed";

export interface InFeedAdProps {
  slot?: string;
  className?: string;
  style?: CSSProperties;
  layout?: "desktop" | "mobile";
}

const IN_FEED_SLOTS = {
  desktop: "4739066253",
  mobile: "1968211491",
};

export const InFeedAd = ({
  className,
  style,
  slot,
  layout = "desktop",
}: InFeedAdProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [slotStatus, setSlotStatus] = useState<AdSenseSlotStatus>("idle");
  const inlineAdsAllowed = useInlineAdsAllowed();
  const adSlot = slot || IN_FEED_SLOTS[layout];
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
    minWidth: 100,
    rootMargin: "250px",
    onStatusChange: setSlotStatus,
  });

  if (!inlineAdsAllowed) return null;

  return (
    <div
      ref={containerRef}
      aria-label="Advertisement"
      aria-hidden={!isVisible}
      className={`my-4 w-full overflow-hidden rounded-xl border border-border/60 bg-card ${className || ""}`}
      style={{
        ...style,
        minWidth: "250px",
        minHeight: isVisible ? "130px" : collapsedHeight,
        height: isVisible ? undefined : collapsedHeight,
        margin: isVisible ? style?.margin : 0,
        borderWidth: isVisible ? undefined : 0,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? undefined : "none",
      }}
      data-ad-container-slot={adSlot}
      data-ad-slot-status={slotStatus}
    >
      <div className="border-b border-border/40 bg-muted/30 py-1.5 text-center text-[10px] uppercase text-muted-foreground">
        Advertisement
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          minHeight: isVisible ? "100px" : collapsedHeight,
        }}
        data-ad-format="fluid"
        data-ad-layout-key="-6t+ed+2i-1n-4w"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adSlot}
      />
    </div>
  );
};

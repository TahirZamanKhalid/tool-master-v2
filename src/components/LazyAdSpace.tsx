import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AdSpaceProps } from "./AdSpace";
import type { AdSenseSlotStatus } from "@/hooks/useAdSenseUnit";
import { ADSENSE_CLIENT, useAdSenseUnit } from "@/hooks/useAdSenseUnit";
import { useInlineAdsAllowed } from "@/hooks/useInlineAdsAllowed";

export interface LazyAdSpaceProps extends AdSpaceProps {
  children?: ReactNode;
  format?: "horizontal" | "vertical" | "auto";
  [key: string]: unknown;
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
  const [slotStatus, setSlotStatus] = useState<AdSenseSlotStatus>("idle");
  const inlineAdsAllowed = useInlineAdsAllowed();
  const config = FORMAT_CONFIG[format];
  const adSlot = slot || AD_SLOTS[format];
  const adAllowed = inlineAdsAllowed || format === "vertical";
  const canCollapse = format !== "vertical";
  const isCollapsedSlot = slotStatus === "unfilled" || slotStatus === "blocked";
  const shouldReserveSpace =
    !canCollapse ||
    slotStatus === "requested" ||
    slotStatus === "filled" ||
    slotStatus === "unfill-optimized";
  const isVisible = shouldReserveSpace && !(canCollapse && isCollapsedSlot);
  const collapsedHeight = isCollapsedSlot ? "0px" : "1px";

  useAdSenseUnit({
    adRef,
    containerRef,
    enabled: adAllowed,
    lazy: true,
    minWidth: 10,
    rootMargin: "250px",
    onStatusChange: setSlotStatus,
  });

  if (!adAllowed) return null;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      aria-hidden={canCollapse && !isVisible}
      style={{
        ...style,
        minWidth: config.minWidth,
        minHeight: isVisible ? config.minHeight : collapsedHeight,
        height: isVisible ? undefined : collapsedHeight,
        margin: isVisible ? style?.margin : 0,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? undefined : "none",
      }}
      data-ad-container-slot={adSlot}
      data-ad-slot-status={slotStatus}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width: config.width,
          height: config.height,
          minWidth: config.minWidth,
          minHeight: isVisible ? config.minHeight : collapsedHeight,
        }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

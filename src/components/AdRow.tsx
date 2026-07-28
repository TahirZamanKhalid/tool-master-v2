import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { AdSenseSlotStatus } from "@/hooks/useAdSenseUnit";
import { ADSENSE_CLIENT, useAdSenseUnit } from "@/hooks/useAdSenseUnit";
import { useInlineAdsAllowed } from "@/hooks/useInlineAdsAllowed";

export interface AdRowProps {
  slot?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  lazy?: boolean;
  format?: "auto" | "autorelaxed" | "fluid" | "horizontal" | "rectangle" | "vertical";
  isMultiplex?: boolean;
  minHeight?: number;
  allowOnToolRoutes?: boolean;
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
  isMultiplex = false,
  minHeight,
  allowOnToolRoutes = false,
}: AdRowProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [slotStatus, setSlotStatus] = useState<AdSenseSlotStatus>("idle");
  const inlineAdsAllowed = useInlineAdsAllowed();
  const adAllowed = inlineAdsAllowed || allowOnToolRoutes;

  const slotId = slot || MULTIPLEX_SLOTS["multiplex-1"];
  const isMultiplexAd = isMultiplex || Object.values(MULTIPLEX_SLOTS).includes(slotId);
  const adFormat = isMultiplexAd ? "autorelaxed" : format;
  const reservedHeight = minHeight ?? (isMultiplexAd ? 280 : 250);
  const isCollapsedSlot = slotStatus === "unfilled" || slotStatus === "blocked";
  const shouldReserveSpace =
    !lazy ||
    slotStatus === "requested" ||
    slotStatus === "filled" ||
    slotStatus === "unfill-optimized";
  const isVisible = shouldReserveSpace && !isCollapsedSlot;
  const collapsedHeight = isCollapsedSlot ? "0px" : "1px";

  useAdSenseUnit({
    adRef,
    containerRef,
    enabled: adAllowed,
    lazy,
    minWidth: 10,
    rootMargin: "300px",
    onStatusChange: setSlotStatus,
  });

  if (!adAllowed) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden={!isVisible}
      style={{
        ...style,
        display: "block",
        width: "100%",
        minWidth: "300px",
        minHeight: isVisible ? `${reservedHeight}px` : collapsedHeight,
        height: isVisible ? undefined : collapsedHeight,
        margin: "0 auto",
        overflow: "hidden",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? undefined : "none",
      }}
      data-ad-container-slot={slotId}
      data-ad-slot-status={slotStatus}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          minWidth: "300px",
          minHeight: isVisible ? `${reservedHeight}px` : collapsedHeight,
        }}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
      />
    </div>
  );
};

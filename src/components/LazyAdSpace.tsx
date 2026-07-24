import { useRef } from "react";
import type { ReactNode } from "react";
import type { AdSpaceProps } from "./AdSpace";
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
  const inlineAdsAllowed = useInlineAdsAllowed();
  const config = FORMAT_CONFIG[format];
  const adSlot = slot || AD_SLOTS[format];
  const adAllowed = inlineAdsAllowed || format === "vertical";

  useAdSenseUnit({
    adRef,
    containerRef,
    enabled: adAllowed,
    lazy: true,
    minWidth: 10,
    rootMargin: "250px",
  });

  if (!adAllowed) return null;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      style={{
        minWidth: config.minWidth,
        minHeight: config.minHeight,
        ...style,
      }}
      data-ad-container-slot={adSlot}
    >
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
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
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
}: AdRowProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inlineAdsAllowed = useInlineAdsAllowed();

  const slotId = slot || MULTIPLEX_SLOTS["multiplex-1"];
  const isMultiplexAd = isMultiplex || Object.values(MULTIPLEX_SLOTS).includes(slotId);
  const adFormat = isMultiplexAd ? "autorelaxed" : format;
  const reservedHeight = minHeight ?? (isMultiplexAd ? 280 : 250);

  useAdSenseUnit({
    adRef,
    containerRef,
    enabled: inlineAdsAllowed,
    lazy,
    minWidth: 10,
    rootMargin: "300px",
  });

  if (!inlineAdsAllowed) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: "block",
        width: "100%",
        minWidth: "300px",
        minHeight: `${reservedHeight}px`,
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
          minHeight: `${reservedHeight}px`,
        }}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
      />
    </div>
  );
};

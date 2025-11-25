// LazyAdSpace component – wrapper around GoogleAd with format-based sizing
import { GoogleAd } from "./AdRow";
import type { AdSpaceProps } from "./AdSpace";

export interface LazyAdSpaceProps extends Omit<AdSpaceProps, 'size'> {
  /**
   * Ad format determines default dimensions.
   * "auto" – uses generic 300x250 fallback.
   * "horizontal" – leaderboard (728×90).
   * "vertical" – skyscraper (160×600).
   * "rectangle" – medium rectangle (300×250).
   * "fluid" – responsive fluid size.
   */
  format?: "auto" | "horizontal" | "vertical" | "rectangle" | "fluid";
}

export const LazyAdSpace = ({
  className = "",
  style,
  format = "auto",
  slot = "2931558314",
  width,
  height,
  responsive = true,
  debug = false,
}: LazyAdSpaceProps) => {
  // Determine dimensions based on format with sensible fallbacks
  let adWidth: number | string = width;
  let adHeight: number | string = height;
  let adFormat: "auto" | "rectangle" | "vertical" | "horizontal" | "fluid" = "auto";

  if (format === "horizontal") {
    adWidth = width || 728;
    adHeight = height || 90;
    adFormat = "horizontal";
  } else if (format === "vertical") {
    adWidth = width || 160;
    adHeight = height || 600;
    adFormat = "vertical";
  } else if (format === "rectangle") {
    adWidth = width || 300;
    adHeight = height || 250;
    adFormat = "rectangle";
  } else if (format === "fluid") {
    adWidth = width || "100%";
    adHeight = height || "auto";
    adFormat = "fluid";
  } else {
    // "auto" fallback – generic banner
    adWidth = width || 300;
    adHeight = height || 250;
    adFormat = "auto";
  }

  // Ensure the container never collapses to zero size (helps AdSense sizing)
  const containerStyle = {
    minWidth: typeof adWidth === "number" ? `${adWidth}px` : adWidth,
    minHeight: typeof adHeight === "number" ? `${adHeight}px` : adHeight,
    ...style,
  };

  return (
    <GoogleAd
      width={adWidth}
      height={adHeight}
      adSlot={slot}
      adFormat={adFormat}
      className={className}
      style={containerStyle}
      responsive={responsive}
      debug={debug}
    />
  );
};

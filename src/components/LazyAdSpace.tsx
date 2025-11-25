import { GoogleAd } from "./AdRow";
import type { AdSpaceProps } from "./AdSpace";

export interface LazyAdSpaceProps extends Omit<AdSpaceProps, 'size'> {
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
  debug = false
}: LazyAdSpaceProps) => {
  // Define dimensions based on format
  let adWidth: number | string = width || 728;
  let adHeight: number | string = height || 90;
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
  }

  return (
    <GoogleAd
      width={adWidth}
      height={adHeight}
      adSlot={slot}
      adFormat={adFormat}
      className={className}
      style={style}
      responsive={responsive}
      debug={debug}
    />
  );
};

import { GoogleAd } from "./AdRow";

export interface AdSpaceProps {
  type?: string;
  slot?: string;
  position?: string;
  layoutKey?: string;
  size?: "leaderboard" | "banner" | "skyscraper" | "medium-rectangle" | "large-rectangle" | string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  responsive?: boolean;
  debug?: boolean;
}

export const AdSpace = ({
  className = "",
  style,
  size = "leaderboard",
  slot = "2931558314",
  width,
  height,
  responsive = true,
  debug = false
}: AdSpaceProps) => {
  // Define standard ad sizes based on the size prop
  let adWidth: number | string = width || 728;
  let adHeight: number | string = height || 90;

  if (size === "skyscraper") {
    adWidth = width || 160;
    adHeight = height || 600;
  } else if (size === "banner") {
    adWidth = width || 468;
    adHeight = height || 60;
  } else if (size === "medium-rectangle") {
    adWidth = width || 300;
    adHeight = height || 250;
  } else if (size === "large-rectangle") {
    adWidth = width || 336;
    adHeight = height || 280;
  } else if (size === "leaderboard") {
    adWidth = width || 728;
    adHeight = height || 90;
  }

  return (
    <GoogleAd
      width={adWidth}
      height={adHeight}
      adSlot={slot}
      adFormat="auto"
      className={className}
      style={style}
      responsive={responsive}
      debug={debug}
    />
  );
};

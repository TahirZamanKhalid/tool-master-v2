import { GoogleAd } from "./AdRow";

export interface SidebarAdProps {
  className?: string;
  style?: React.CSSProperties;
  slot?: string;
  width?: number | string;
  height?: number | string;
  responsive?: boolean;
  debug?: boolean;
}

export const SidebarAd = ({
  className = "",
  style,
  slot = "2931558314",
  width = 160,
  height = 600,
  responsive = true,
  debug = false
}: SidebarAdProps) => {
  return (
    <GoogleAd
      width={width}
      height={height}
      adSlot={slot}
      adFormat="vertical"
      className={className}
      style={style}
      responsive={responsive}
      debug={debug}
    />
  );
};

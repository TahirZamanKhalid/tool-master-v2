import { GoogleAd } from "./AdRow";

export interface ContentAdBreakProps {
  className?: string;
  style?: React.CSSProperties;
  slot?: string;
  width?: number | string;
  height?: number | string;
  responsive?: boolean;
  debug?: boolean;
}

export const ContentAdBreak = ({
  className = "",
  style,
  slot = "2931558314",
  width = 728,
  height = 90,
  responsive = true,
  debug = false
}: ContentAdBreakProps) => {
  return (
    <div className={className} style={style}>
      <GoogleAd
        width={width}
        height={height}
        adSlot={slot}
        adFormat="horizontal"
        responsive={responsive}
        debug={debug}
      />
    </div>
  );
};

import type { ReactNode, CSSProperties } from "react";

export interface AdSpaceProps {
  type?: string;
  slot?: string;
  position?: string;
  layoutKey?: string;
  size?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: any;
}

export const AdSpace = ({ className, style }: AdSpaceProps) => {
  // No-op placeholder to keep layout without loading any ads
  return <div className={className} style={style} />;
};

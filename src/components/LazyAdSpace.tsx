import type { ReactNode, CSSProperties } from "react";
import type { AdSpaceProps } from "./AdSpace";

export interface LazyAdSpaceProps extends AdSpaceProps {
  children?: ReactNode;
  [key: string]: any;
}

export const LazyAdSpace = ({ className, style }: LazyAdSpaceProps) => {
  // No-op placeholder that renders an empty container
  return <div className={className} style={style} />;
};

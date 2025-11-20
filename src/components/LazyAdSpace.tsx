import type { ReactNode, CSSProperties } from "react";
import type { AdSpaceProps } from "./AdSpace";

export interface LazyAdSpaceProps extends AdSpaceProps {
  children?: ReactNode;
  [key: string]: any;
}

export const LazyAdSpace = ({ className, style, format = "auto" }: LazyAdSpaceProps) => {
  // Visible placeholder for ad space
  const height = format === "horizontal" ? "90px" : format === "vertical" ? "600px" : "250px";
  
  return (
    <div 
      className={`flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg bg-muted/30 ${className}`} 
      style={{ minHeight: height, ...style }}
    >
      <p className="text-muted-foreground text-sm">Ad Space</p>
    </div>
  );
};

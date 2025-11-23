import { useEffect, useRef } from "react";
import type { ReactNode, CSSProperties } from "react";
import type { AdSpaceProps } from "./AdSpace";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export interface LazyAdSpaceProps extends AdSpaceProps {
  children?: ReactNode;
  [key: string]: any;
}

export const LazyAdSpace = ({ className = "", style, format = "auto", slot }: LazyAdSpaceProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log("AdSense lazy ad initialized");
        }
      } catch (error) {
        console.error("AdSense lazy ad error:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const height = format === "horizontal" ? "90px" : format === "vertical" ? "600px" : "250px";
  const width = format === "vertical" ? "300px" : "100%";
  const maxWidth = format === "vertical" ? "300px" : "600px";

  const adSlot = slot || "4838473293";

  return (
    <div className={className} style={{ ...style }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width,
          maxWidth,
          height,
        }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot={adSlot}
        data-ad-format={format === "horizontal" ? "horizontal" : "auto"}
        data-full-width-responsive="true"
      />
    </div>
  );
};

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export interface AdRowProps {
  slot?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

// Multiplex ad slots for row/grid layouts
const MULTIPLEX_SLOTS = {
  "dice-roller": "4974734897", // Dice roller row add 1
  "json-validator": "2931558314", // jason validator add 1
  "watermark": "4838473293", // Water marktool row 1
  "multiplex-1": "2127993591", // Multiplex add 1
  "multiplex-2": "4356563508", // Multiplex ad 2
  "multiplex-3": "7202218695", // Multiplex ad 3
};

export const AdRow = ({ className, style, slot }: AdRowProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error("AdSense multiplex error:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Use provided slot or default to multiplex-1
  const adSlot = slot || MULTIPLEX_SLOTS["multiplex-1"];

  return (
    <div className={`ad-row-container ${className || ""}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="autorelaxed"
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot={adSlot}
      />
    </div>
  );
};

import { useEffect, useMemo } from "react";
import { getDisplayAdSlot, getAdIndex } from "@/utils/adSlotRotation";

type AdSpacePropsNew = {
  type: "display" | "infeed" | "multiplex";
  slot: string;
  layoutKey?: string;
  className?: string;
  position?: 'top' | 'bottom' | 'sidebar-left' | 'sidebar-right' | 'content';
};

type AdSpacePropsOld = {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
  position?: 'top' | 'bottom' | 'sidebar-left' | 'sidebar-right' | 'content';
};

type AdSpaceProps = AdSpacePropsNew | AdSpacePropsOld;

export const AdSpace = (props: AdSpaceProps) => {
  const { className = "", position = 'top' } = props;
  
  // Handle backward compatibility - convert old size API to new type/slot API
  const adConfig = useMemo(() => {
    let type: "display" | "infeed" | "multiplex";
    let slot: string;
    let layoutKey: string | undefined;
    
    if ("size" in props) {
      // Old API - use rotation based on position
      const index = getAdIndex(position);
      slot = getDisplayAdSlot(index);
      type = "display";
    } else {
      // New API
      type = props.type;
      slot = props.slot;
      layoutKey = props.layoutKey;
    }
    
    return { type, slot, layoutKey };
  }, [props, position]);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        if (window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [adConfig]);

  const { type, slot, layoutKey } = adConfig;

  if (type === "infeed") {
    return (
      <div className={`flex items-center justify-center w-full ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", maxWidth: "400px", minHeight: "200px" }}
          data-ad-format="fluid"
          data-ad-layout-key={layoutKey}
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot={slot}
        />
      </div>
    );
  }

  if (type === "multiplex") {
    return (
      <div className={`flex items-center justify-center w-full ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", maxWidth: "400px", minHeight: "200px" }}
          data-ad-format="autorelaxed"
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot={slot}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", maxWidth: "400px", minHeight: "200px" }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

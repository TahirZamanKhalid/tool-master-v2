import { useEffect } from "react";

type AdSpacePropsNew = {
  type: "display" | "infeed" | "multiplex";
  slot: string;
  layoutKey?: string;
  className?: string;
};

type AdSpacePropsOld = {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
};

type AdSpaceProps = AdSpacePropsNew | AdSpacePropsOld;

export const AdSpace = (props: AdSpaceProps) => {
  const { className = "" } = props;
  
  // Handle backward compatibility - convert old size API to new type/slot API
  let type: "display" | "infeed" | "multiplex";
  let slot: string;
  let layoutKey: string | undefined;
  
  if ("size" in props) {
    // Old API - map to new slots
    const sizeMap = {
      leaderboard: { type: "display" as const, slot: "4402803148" },
      banner: { type: "display" as const, slot: "4402803148" },
      rectangle: { type: "display" as const, slot: "2918331088" },
      skyscraper: { type: "display" as const, slot: "2918331088" },
    };
    const config = sizeMap[props.size];
    type = config.type;
    slot = config.slot;
  } else {
    // New API
    type = props.type;
    slot = props.slot;
    layoutKey = props.layoutKey;
  }
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
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (type === "infeed") {
    return (
      <div className={`flex items-center justify-center w-full ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
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
          style={{ display: "block" }}
          data-ad-format="autorelaxed"
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot={slot}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center w-full min-h-[90px] ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

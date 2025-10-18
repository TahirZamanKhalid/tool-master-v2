// components/AdSpace.tsx
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

type AdSpacePropsNew = {
  type: "display" | "infeed" | "multiplex";
  slot: string;
  layoutKey?: string;
  className?: string;
  position?: "top" | "bottom" | "sidebar-left" | "sidebar-right" | "content";
};

type AdSpacePropsOld = {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
  position?: "top" | "bottom" | "sidebar-left" | "sidebar-right" | "content";
};

export type AdSpaceProps = AdSpacePropsNew | AdSpacePropsOld;

// Map slot IDs to your actual AdSense slots (for backward compatibility)
const slotConfig: Record<string, string> = {
  display_ad_slot_1: "1212397554", // Sidebar 
  display_ad_slot_2: "2918331088", // Display Ad 2
  display_ad_slot_3: "4402803148", // Display ad 3
  infeed_ad_slot_1: "4739066253", // In-feed ad
  multiplex_ad_slot_1: "2127993591", // Multiplex ad
};

export const AdSpace = (props: AdSpaceProps) => {
  const adRef = useRef<any>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const adClient = "ca-pub-7382531001943020";
  
  // Handle both old and new prop formats
  const isNewFormat = 'type' in props;
  const type = isNewFormat ? props.type : 'display';
  const slot = isNewFormat ? props.slot : 'display_ad_slot_1';
  const layoutKey = isNewFormat ? props.layoutKey : undefined;
  const className = props.className || '';
  const position = props.position;
  
  const actualSlot = slotConfig[slot] || slot;

  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="googlesyndication.com"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    const initializeAd = () => {
      if (window.adsbygoogle && adRef.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        } catch (error) {
          console.error("AdSense error:", error);
          setAdError(true);
        }
      } else {
        // Retry if not ready
        setTimeout(initializeAd, 500);
      }
    };

    // Wait a bit for the script to load
    const timer = setTimeout(initializeAd, 1000);

    return () => clearTimeout(timer);
  }, [actualSlot, adClient]);

  // Don't show fallback - just hide if error
  if (adError) {
    return null;
  }

  const getAdStyle = () => {
    switch (type) {
      case "display":
        return { display: "block", minHeight: "200px", maxWidth: "400px", width: "100%" };
      case "multiplex":
        return { display: "block", minHeight: "200px", maxWidth: "400px", width: "100%" };
      case "infeed":
        return { display: "block", minHeight: "120px", maxWidth: "400px", width: "100%" };
      default:
        return { display: "block", minHeight: "200px", maxWidth: "400px", width: "100%" };
    }
  };

  return (
    <div className={`ad-container ${className}`}>
      {!adLoaded && !adError && (
        <div className="animate-pulse bg-gray-200 rounded-lg flex items-center justify-center" style={getAdStyle()}>
          <span className="text-gray-500 text-sm">Loading ad...</span>
        </div>
      )}

      <ins
        ref={adRef}
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client={adClient}
        data-ad-slot={actualSlot}
        data-ad-format={type === "infeed" ? "fluid" : "auto"}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive="true"
      />
    </div>
  );
};

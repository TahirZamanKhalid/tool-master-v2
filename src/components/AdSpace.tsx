// components/AdSpace.tsx
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

type AdSpaceProps = {
  type: "display" | "infeed" | "multiplex";
  slot: string;
  layoutKey?: string;
  className?: string;
  position?: string;
  size?: string;
};

// Map your AdSense slots
const adSlots: Record<string, string> = {
  // Display ads
  display_ad_slot_1: "5628599414", // Side bar Ads1
  display_ad_slot_2: "2918331088", // Display Ad 2
  display_ad_slot_3: "4402803148", // Display ad 3

  // Multiplex ads (you can reuse slots or create new ones)
  multiplex_ad_slot_1: "5628599414",
  multiplex_ad_slot_2: "2918331088",
  multiplex_ad_slot_3: "4402803148",

  // Infeed ads
  infeed_ad_slot_1: "5628599414",
  infeed_ad_slot_2: "2918331088",
  infeed_ad_slot_3: "4402803148",
};

export const AdSpace = ({ type, slot, layoutKey, className = "", position }: AdSpaceProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const adClient = "ca-pub-7382531001943020";
  const adSlot = adSlots[slot] || adSlots["display_ad_slot_1"];

  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="googlesyndication.com"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7382531001943020";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Initialize ad
    const loadAd = () => {
      if (window.adsbygoogle && adRef.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.error("AdSense error:", error);
        }
      }
    };

    // Small delay to ensure script is loaded
    const timer = setTimeout(loadAd, 100);
    return () => clearTimeout(timer);
  }, [adSlot, adClient]);

  // Different ad formats based on type
  const getAdStyle = () => {
    switch (type) {
      case "display":
        return {
          display: "block",
          minHeight: "250px",
        };
      case "multiplex":
        return {
          display: "block",
          minHeight: "200px",
        };
      case "infeed":
        return {
          display: "block",
          minHeight: "120px",
        };
      default:
        return {
          display: "block",
          minHeight: "250px",
        };
    }
  };

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

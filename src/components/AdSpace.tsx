// components/AdSpace.tsx
import { useEffect, useRef, useState } from "react";

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
  position?: "top" | "bottom" | "sidebar-left" | "sidebar-right" | "content";
  size?: string; // For backward compatibility
};

// Map slot IDs to your actual AdSense slots
const slotConfig: Record<string, string> = {
  // Your actual AdSense slots
  display_ad_slot_1: "5628599414", // Side bar Ads1
  display_ad_slot_2: "2918331088", // Display Ad 2
  display_ad_slot_3: "4402803148", // Display ad 3
  infeed_ad_slot_1: "4739066253", // In-feed ad
  multiplex_ad_slot_1: "2127993591", // Multiplex ad
};

export const AdSpace = ({ type, slot, layoutKey, className = "", position }: AdSpaceProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const adClient = "ca-pub-7382531001943020";
  const actualSlot = slotConfig[slot] || slotConfig["display_ad_slot_1"];

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

  // Show fallback for errors or during loading
  if (adError) {
    return (
      <div
        className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 p-4 text-center ${className}`}
      >
        <div className="text-xs text-blue-600 font-medium mb-1">Featured Tool</div>
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Image Compressor</h3>
        <p className="text-xs text-gray-600 mb-2">Reduce image size without quality loss</p>
        <button
          onClick={() => (window.location.href = "/tools/image-compressor")}
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors"
        >
          Try Now
        </button>
      </div>
    );
  }

  const getAdStyle = () => {
    switch (type) {
      case "display":
        return { display: "block", minHeight: "250px", width: "100%" };
      case "multiplex":
        return { display: "block", minHeight: "200px", width: "100%" };
      case "infeed":
        return { display: "block", minHeight: "120px", width: "100%" };
      default:
        return { display: "block", minHeight: "250px", width: "100%" };
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

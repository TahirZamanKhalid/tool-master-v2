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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const adClient = "ca-pub-7382531001943020";
  
  // Handle both old and new prop formats
  const isNewFormat = 'type' in props;
  const type = isNewFormat ? props.type : 'display';
  const slot = isNewFormat ? props.slot : 'display_ad_slot_1';
  const layoutKey = isNewFormat ? props.layoutKey : undefined;
  const className = props.className || '';
  const position = props.position;
  
  const actualSlot = slotConfig[slot] || slot;
  const isTestMode = typeof window !== "undefined" && (
    window.location.hostname.includes("localhost") ||
    window.location.hostname.endsWith(".lovable.app")
  );

  // Observe container width to prevent "No slot size for availableWidth" errors
  useEffect(() => {
    if (!wrapperRef.current) return;
    const element = wrapperRef.current;
    // Initial measure
    setContainerWidth(element.clientWidth || 0);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cw = Math.floor(entry.contentRect.width);
        setContainerWidth(cw);
      }
    });
    ro.observe(element);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    const minWidth = (() => {
      // Mobile-optimized minimum widths for better ad serving
      if (type === "infeed") return 300;
      if (type === "multiplex") return 250;
      return 250; // Standard minimum for display ads
    })();

    const initializeAd = () => {
      if (adLoaded || adError) return;
      if (!adRef.current || containerWidth < minWidth) {
        // Retry until container is ready
        setTimeout(initializeAd, 100);
        return;
      }
      if (window.adsbygoogle) {
        try {
          console.log("[AdSense] push", { type, slot: actualSlot, containerWidth, minWidth, isTestMode });
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          // Mark as loaded after push
          setTimeout(() => {
            setAdLoaded(true);
            console.log("[AdSense] marked loaded", { slot: actualSlot });
          }, 500);
        } catch (error) {
          console.error("[AdSense] error on push:", error);
          setAdError(true);
        }
      } else {
        // Retry if script not ready
        setTimeout(initializeAd, 100);
      }
    };

    // Start initialization
    const timer = setTimeout(initializeAd, 100);

    return () => clearTimeout(timer);
  }, [actualSlot, adClient, containerWidth, type, adLoaded, adError]);

  // Don't show fallback - just hide if error
  if (adError) {
    return null;
  }

  const getAdStyle = () => {
    switch (type) {
      case "display":
        return { display: "block", width: "100%", minHeight: "90px" };
      case "multiplex":
        return { display: "block", width: "100%", minHeight: "250px" };
      case "infeed":
        return { display: "block", width: "100%", minHeight: "280px" };
      default:
        return { display: "block", width: "100%", minHeight: "90px" };
    }
  };

  return (
    <div className={`ad-container ${className}`} ref={wrapperRef} style={{ minWidth: "250px" }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ ...getAdStyle(), visibility: adLoaded ? "visible" : "hidden" }}
        data-ad-client={adClient}
        data-ad-slot={actualSlot}
        data-ad-format={type === "infeed" ? "fluid" : "auto"}
        data-ad-layout-key={type === "infeed" ? layoutKey : undefined}
        data-full-width-responsive="true"
        data-adtest={isTestMode ? "on" : undefined}
      />
    </div>
  );
};

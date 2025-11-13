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
  // Code Beautifier specific slots
  code_beautifier_300x250: "7713152297", // Code beautifier 300x250
  code_beautifier_300x600: "7110517063", // Code beautifier 300x600
  code_beautifier_300x300: "4153181237", // Code Beautifier 300x300
};

export const AdSpace = (props: AdSpaceProps) => {
  const adRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const adClient = "ca-pub-7382531001943020";

  // Handle both old and new prop formats
  const isNewFormat = 'type' in props;
  const type = isNewFormat ? props.type : 'display';
  const slot = isNewFormat ? props.slot : 'display_ad_slot_1';
  const layoutKey = isNewFormat ? props.layoutKey : undefined;
  const className = props.className || '';
  const position = props.position;

  const actualSlot = slotConfig[slot] || slot;
  // Always use production mode for real ads
  const isTestMode = false;

  useEffect(() => {
    // Prevent double initialization
    if (isInitialized) return;

    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    const initializeAd = () => {
      if (!adRef.current || isInitialized) return;

      try {
        // Make sure window.adsbygoogle exists
        if (typeof window !== "undefined" && window.adsbygoogle) {
          console.log("[AdSense] Initializing ad:", { type, slot: actualSlot, position });
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsInitialized(true);
          // Hide loading animation after ad initializes
          setTimeout(() => setIsLoading(false), 1000);
        } else {
          // Retry if adsbygoogle not ready yet
          setTimeout(initializeAd, 200);
        }
      } catch (error) {
        console.error("[AdSense] Error initializing ad:", error);
        // Don't retry on error, but keep the container visible
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    // Delay initialization slightly to ensure DOM is ready
    const timer = setTimeout(initializeAd, 100);

    return () => clearTimeout(timer);
  }, [actualSlot, adClient, type, position, isInitialized]);

  const getAdStyle = () => {
    // Get max dimensions for fixed-size ads
    const getMaxDimensions = () => {
      if (slot.includes("300x250") || actualSlot === "7713152297") {
        return { maxWidth: "300px", maxHeight: "250px" };
      }
      if (slot.includes("300x600") || actualSlot === "7110517063") {
        return { maxWidth: "300px", maxHeight: "600px" };
      }
      if (slot.includes("300x300") || actualSlot === "4153181237") {
        return { maxWidth: "300px", maxHeight: "300px" };
      }
      return {};
    };

    const maxDimensions = getMaxDimensions();

    switch (type) {
      case "display":
        return { display: "block", width: "100%", minHeight: "90px", ...maxDimensions };
      case "multiplex":
        return { display: "block", width: "100%", minHeight: "250px", ...maxDimensions };
      case "infeed":
        return { display: "block", width: "100%", minHeight: "280px", ...maxDimensions };
      default:
        return { display: "block", width: "100%", minHeight: "90px", ...maxDimensions };
    }
  };

  // Always render the ad container - don't hide or remove it
  return (
    <div className={`ad-container relative ${className}`} style={{ minWidth: "250px" }}>
      {/* Loading animation */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-muted/5 rounded-lg animate-pulse"
          style={getAdStyle()}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs text-muted-foreground/50">Loading ad...</div>
          </div>
        </div>
      )}
      
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          ...getAdStyle(),
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s ease-in-out"
        }}
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

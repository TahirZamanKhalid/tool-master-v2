import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdProps {
  width?: number | string;
  height?: number | string;
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal" | "fluid";
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
  adClient?: string; // Optional override
  debug?: boolean;
}

/**
 * Core Google Ad component handling loading, retries and UI states.
 */
export const GoogleAd: React.FC<GoogleAdProps> = ({
  width = 300,
  height = 250,
  adSlot,
  adFormat = "auto",
  className = "",
  style = {},
  responsive = true,
  adClient = "ca-pub-7382531001943020",
  debug = false,
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Helper to convert dimensions to pixel strings
  const getDimension = (dim: number | string): string =>
    typeof dim === "number" ? `${dim}px` : dim;

  const adDimensions = {
    width: getDimension(width),
    height: getDimension(height),
  };

  // Validate size against common ad sizes (used only for a warning UI)
  const commonAdSizes = [
    { width: 300, height: 250 },
    { width: 336, height: 280 },
    { width: 728, height: 90 },
    { width: 970, height: 90 },
    { width: 970, height: 250 },
    { width: 300, height: 600 },
    { width: 160, height: 600 },
    { width: 120, height: 600 },
    { width: 320, height: 100 },
    { width: 320, height: 50 },
    { width: 468, height: 60 },
  ];
  const isValidAdSize = commonAdSizes.some(
    (size) =>
      (typeof width === "number" && size.width === width) ||
      (typeof height === "number" && size.height === height)
  );

  // Load the ad – includes retry logic for transient failures
  useEffect(() => {
    if (!adSlot) {
      setAdError("Ad slot is required");
      return;
    }
    let isMounted = true;
    let hasLoaded = false;

    const loadAd = () => {
      if (!isMounted || hasLoaded) return;
      if (!adRef.current) {
        debug && console.log("❌ Ad element not found");
        return;
      }
      const status = adRef.current.getAttribute("data-adsbygoogle-status");
      if (status === "done" || status === "filled") {
        debug && console.log("⚠️ Ad already loaded, skipping");
        setAdLoaded(true);
        hasLoaded = true;
        return;
      }
      if (typeof window.adsbygoogle === "undefined") {
        debug && console.log("🔄 AdSense not loaded yet, retrying...");
        if (retryCount < 3 && isMounted) {
          setTimeout(loadAd, 1000 * (retryCount + 1));
          setRetryCount((c) => c + 1);
        } else {
          isMounted && setAdError("AdSense failed to load after retries");
        }
        return;
      }
      try {
        debug && console.log("📤 Loading ad", { adSlot, width, height, adFormat });
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        hasLoaded = true;
        if (isMounted) {
          setAdLoaded(true);
          setAdError(null);
        }
        debug && console.log("✅ Ad loaded successfully");
      } catch (e: any) {
        const msg = e.message || "";
        const benign =
          msg.includes("already have ads in them") ||
          msg.includes("No slot size") ||
          msg.includes("availableWidth=0");
        if (benign) {
          debug && console.log("⚠️ Benign ad error suppressed", msg);
          isMounted && setAdLoaded(true);
          isMounted && setAdError(null);
        } else {
          isMounted && setAdError(msg);
          if (retryCount < 2 && isMounted) {
            setTimeout(loadAd, 2000);
            setRetryCount((c) => c + 1);
          }
        }
      }
    };

    const timer = setTimeout(loadAd, 500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [adSlot, adFormat, width, height, retryCount, debug]);

  // UI helpers
  const loadingSpinner = (
    <div className="loading-spinner" style={{
      width: "24px",
      height: "24px",
      border: "2px solid #dee2e6",
      borderTop: "2px solid #007bff",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: "8px",
    }} />
  );

  return (
    <div
      className={className}
      style={{ position: "relative", ...style }}
    >
      {/* Loading state */}
      {!adLoaded && !adError && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            color: "#6c757d",
            fontSize: "14px",
            zIndex: 1,
          }}
        >
          {loadingSpinner}
          <span>Loading Advertisement</span>
        </div>
      )}

      {/* Error state */}
      {adError && (
        <div
          className="ad-error-state"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            color: "#856404",
            fontSize: "12px",
            textAlign: "center",
            padding: "10px",
            zIndex: 2,
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Ad Not Available</div>
          <div style={{ fontSize: "10px", opacity: 0.7 }}>{adError}</div>
          {retryCount < 2 && (
            <button
              onClick={() => {
                setAdError(null);
                setRetryCount(0);
              }}
              style={{
                marginTop: "8px",
                padding: "4px 8px",
                fontSize: "10px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Debug overlay */}
      {debug && (
        <div
          className="ad-debug-info"
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            fontSize: "10px",
            padding: "2px 4px",
            borderRadius: "2px",
            zIndex: 3,
          }}
        >
          {width}×{height}
        </div>
      )}

      {/* Size warning for non‑standard dimensions */}
      {debug && !isValidAdSize && (
        <div
          className="ad-size-warning"
          style={{
            position: "absolute",
            bottom: "2px",
            left: "2px",
            background: "rgba(255,193,7,0.9)",
            color: "#856404",
            fontSize: "8px",
            padding: "1px 3px",
            borderRadius: "2px",
            zIndex: 3,
          }}
        >
          Non‑standard size
        </div>
      )}

      {/* The actual AdSense <ins> element */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: adLoaded ? "block" : "none",
          ...(responsive && adFormat === "fluid" ? {} : adDimensions),
          maxWidth: "100%",
          margin: "0 auto",
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
        data-ad-region={`ad-${adSlot}`}
      />
    </div>
  );
};

// Inject spinner keyframes once
const spinnerStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.google-ad-container { min-height: 50px; min-width: 120px; }
`;
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerText = spinnerStyles;
  document.head.appendChild(styleEl);
}

/**
 * Convenience wrapper for a horizontal ad row.
 */
export interface AdRowProps {
  className?: string;
  style?: React.CSSProperties;
  slot?: string;
  width?: number | string;
  height?: number | string;
  responsive?: boolean;
  debug?: boolean;
}

export const AdRow: React.FC<AdRowProps> = ({
  className = "",
  style,
  slot = "2931558314",
  width = 728,
  height = 90,
  responsive = true,
  debug = false,
}) => (
  <GoogleAd
    width={width}
    height={height}
    adSlot={slot}
    adFormat="horizontal"
    className={className}
    style={style}
    responsive={responsive}
    debug={debug}
  />
);

export default GoogleAd;

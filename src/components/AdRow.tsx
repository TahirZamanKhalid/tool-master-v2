import { useEffect, useRef, useState } from "react";

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
  adClient?: string; // Optional: override default ad client
  debug?: boolean;
}

export const GoogleAd = ({
  width = 300,
  height = 250,
  adSlot,
  adFormat = "auto",
  className = "",
  style = {},
  responsive = true,
  adClient = "ca-pub-7382531001943020", // Your default ad client
  debug = false
}: GoogleAdProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Convert numeric dimensions to pixel values
  const getDimension = (dim: number | string): string => {
    if (typeof dim === 'number') return `${dim}px`;
    return dim;
  };

  const adDimensions = {
    width: getDimension(width),
    height: getDimension(height)
  };

  // Common ad sizes mapping for validation
  const commonAdSizes = [
    { width: 300, height: 250 },   // Medium Rectangle
    { width: 336, height: 280 },   // Large Rectangle
    { width: 728, height: 90 },    // Leaderboard
    { width: 970, height: 90 },    // Large Leaderboard
    { width: 970, height: 250 },   // Billboard
    { width: 300, height: 600 },   // Half Page
    { width: 160, height: 600 },   // Wide Skyscraper
    { width: 120, height: 600 },   // Skyscraper
    { width: 320, height: 100 },   // Large Mobile Banner
    { width: 320, height: 50 },    // Mobile Banner
    { width: 468, height: 60 },    // Banner
  ];

  // Validate if the requested size matches common ad sizes
  const isValidAdSize = commonAdSizes.some(
    size =>
      (typeof width === 'number' && size.width === width) ||
      (typeof height === 'number' && size.height === height)
  );


  useEffect(() => {
    if (!adSlot) {
      setAdError('Ad slot is required');
      return;
    }

    let isMounted = true;
    let hasLoaded = false;

    const loadAd = () => {
      if (!isMounted || hasLoaded) return;

      if (!adRef.current) {
        if (debug) console.log('❌ Ad element not found');
        return;
      }

      // Check if this ad element already has the data-adsbygoogle-status attribute
      const adStatus = adRef.current.getAttribute('data-adsbygoogle-status');
      if (adStatus === 'done' || adStatus === 'filled') {
        if (debug) console.log('⚠️ Ad already loaded, skipping');
        setAdLoaded(true);
        hasLoaded = true;
        return;
      }

      // Check if AdSense is loaded
      if (typeof window.adsbygoogle === 'undefined') {
        if (debug) console.log('🔄 AdSense not loaded yet, retrying...');
        if (retryCount < 3 && isMounted) {
          setTimeout(loadAd, 1000 * (retryCount + 1));
          setRetryCount(prev => prev + 1);
        } else {
          if (isMounted) setAdError('AdSense failed to load after retries');
        }
        return;
      }

      try {
        if (debug) console.log('📤 Loading ad:', { adSlot, width, height, adFormat });

        // Push ad to AdSense only if not already loaded
        (window.adsbygoogle = window.adsbygoogle || []).push({});

        hasLoaded = true;
        if (isMounted) {
          setAdLoaded(true);
          setAdError(null);
        }
        if (debug) console.log('✅ Ad loaded successfully');

      } catch (error: any) {
        console.error('❌ Ad load error:', error);

        const errorMsg = error.message || '';

        // Don't show error messages for these common benign AdSense errors
        const isBenignError = errorMsg.includes('already have ads in them') ||
          errorMsg.includes('No slot size') ||
          errorMsg.includes('availableWidth=0');

        if (isBenignError) {
          // Just mark as loaded and don't show error to user
          if (debug) console.log('⚠️ Benign ad error, suppressing:', errorMsg);
          if (isMounted) {
            setAdLoaded(true);
            setAdError(null);
          }
        } else {
          // Show actual errors
          if (isMounted) {
            setAdError(error.message);
          }

          // Retry on error
          if (retryCount < 2 && isMounted) {
            setTimeout(loadAd, 2000);
            setRetryCount(prev => prev + 1);
          }
        }
      }
    };

    // Initial load with delay to ensure DOM readiness
    const timer = setTimeout(loadAd, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [adSlot, adFormat, retryCount, debug]);

  // Reset error state when props change
  useEffect(() => {
    setAdError(null);
    setRetryCount(0);
    style = {{
      position: 'absolute',
        top: 0,
          left: 0,
            right: 0,
              bottom: 0,
                display: 'flex',
                  flexDirection: 'column',
                    justifyContent: 'center',
                      alignItems: 'center',
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          color: '#6c757d',
                            fontSize: '14px',
                              zIndex: 1
    }
  }
        >
          <div className="loading-spinner" style={{
            width: '24px',
            height: '24px',
            border: '2px solid #dee2e6',
            borderTop: '2px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '8px'
          }} />
          <span>Loading Advertisement</span>
        </div >
      )}

{/* Error State */ }
{
  adError && (
    <div
      className="ad-error-state"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        color: '#856404',
        fontSize: '12px',
        textAlign: 'center',
        padding: '10px',
        zIndex: 2
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        Ad Not Available
      </div>
      <div style={{ fontSize: '10px', opacity: 0.7 }}>
        {adError}
      </div>
      {retryCount < 2 && (
        <button
          onClick={() => {
            setAdError(null);
            setRetryCount(0);
          }}
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            fontSize: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      )}
    </div>
  )
}

{/* Debug Info */ }
{
  debug && (
    <div
      className="ad-debug-info"
      style={{
        position: 'absolute',
        top: '2px',
        right: '2px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        fontSize: '10px',
        padding: '2px 4px',
        borderRadius: '2px',
        zIndex: 3
      }}
    >
      {width}×{height}
    </div>
  )
}

{/* Size Warning */ }
{
  debug && !isValidAdSize && (
    <div
      className="ad-size-warning"
      style={{
        position: 'absolute',
        bottom: '2px',
        left: '2px',
        background: 'rgba(255,193,7,0.9)',
        color: '#856404',
        fontSize: '8px',
        padding: '1px 3px',
        borderRadius: '2px',
        zIndex: 3
      }}
    >
      Non-standard size
    </div>
  )
}

{/* Actual AdSense Ad */ }
<ins
  ref={adRef}
  className="adsbygoogle"
  style={{
    display: adLoaded ? 'block' : 'none',
    // Apply dimensions only when not using responsive fluid ads
    ...(responsive && adFormat === 'fluid'
      ? {}
      : adDimensions),
    maxWidth: '100%',
    margin: '0 auto'
  }}
  data-ad-client={adClient}
  data-ad-slot={adSlot}
  data-ad-format={adFormat}
  data-full-width-responsive={responsive ? "true" : "false"}
  data-ad-region={`ad-${adSlot}`}
/>
    </div >
  );
};

// CSS for spinner animation
const spinnerStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.google-ad-container {
  min-height: 50px;
  min-width: 120px;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = spinnerStyles;
  document.head.appendChild(styleSheet);
}

// AdRow component - Horizontal ad for use in rows/sections
export interface AdRowProps {
  className?: string;
  style?: React.CSSProperties;
  slot?: string;
  width?: number | string;
  height?: number | string;
  responsive?: boolean;
  debug?: boolean;
}

export const AdRow = ({
  className = "",
  style,
  slot = "2931558314",
  width = 728,
  height = 90,
  responsive = true,
  debug = false
}: AdRowProps) => {
  return (
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
};

export default GoogleAd;


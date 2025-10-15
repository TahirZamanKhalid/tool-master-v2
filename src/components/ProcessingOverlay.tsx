import { Loader2 } from "lucide-react";
import { AdSpace } from "./AdSpace";
import { useEffect, useState, useRef } from "react";

interface ProcessingOverlayProps {
  message?: string;
  progress?: number;
  onSkip?: () => void;
  showSkip?: boolean;
  minAdViewTime?: number; // Minimum time in seconds
  onAdComplete?: () => void;
}

export const ProcessingOverlay = ({
  message = "Processing your request...",
  progress,
  onSkip,
  showSkip = false,
  minAdViewTime = 5, // Minimum 5 seconds to ensure ad loads
  onAdComplete,
}: ProcessingOverlayProps) => {
  const [adTimer, setAdTimer] = useState(minAdViewTime);
  const [adViewed, setAdViewed] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const adCheckInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if AdSense ad has loaded
    const checkAdLoaded = () => {
      const adElements = document.querySelectorAll('.adsbygoogle');
      for (const ad of adElements) {
        const iframe = ad.querySelector('iframe');
        if (iframe && iframe.getAttribute('data-ad-status') === 'filled') {
          setAdLoaded(true);
          return true;
        }
      }
      return false;
    };

    // Start checking for ad load
    adCheckInterval.current = setInterval(() => {
      if (checkAdLoaded()) {
        clearInterval(adCheckInterval.current);
      }
    }, 500);

    return () => {
      if (adCheckInterval.current) {
        clearInterval(adCheckInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (minAdViewTime > 0 && !adViewed) {
      const interval = setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            setAdViewed(true);
            onAdComplete?.();
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [minAdViewTime, adViewed, onAdComplete]);
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border shadow-card-hover rounded-lg p-8 max-w-md w-full mx-4 space-y-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
          <h3 className="text-lg font-semibold mb-2">{message}</h3>
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{progress}% complete</p>
            </div>
          )}
        </div>

        {/* Ad Display Area */}
        <div className="space-y-3">
          <div className="min-h-[250px] flex items-center justify-center">
            <AdSpace size="rectangle" />
          </div>
          {minAdViewTime > 0 && !adViewed && (
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                Please wait {adTimer}s to continue...
              </p>
              {!adLoaded && (
                <p className="text-xs text-muted-foreground/70">
                  Loading advertisement...
                </p>
              )}
            </div>
          )}
        </div>

        {showSkip && onSkip && adViewed && (
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground underline w-full text-center"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

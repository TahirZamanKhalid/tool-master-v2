import { Loader2 } from "lucide-react";
import { AdSpace } from "./AdSpace";
import { useEffect, useState } from "react";

interface ProcessingOverlayProps {
  message?: string;
  progress?: number;
  onSkip?: () => void;
  showSkip?: boolean;
  adViewTime?: number; // Time in seconds user must view ad
  onAdComplete?: () => void;
}

export const ProcessingOverlay = ({
  message = "Processing your request...",
  progress,
  onSkip,
  showSkip = false,
  adViewTime = 10,
  onAdComplete,
}: ProcessingOverlayProps) => {
  const [adTimer, setAdTimer] = useState(adViewTime);
  const [adViewed, setAdViewed] = useState(false);

  useEffect(() => {
    if (adViewTime > 0 && !adViewed) {
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
  }, [adViewTime, adViewed, onAdComplete]);
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
          <AdSpace size="rectangle" />
          {adViewTime > 0 && !adViewed && (
            <p className="text-center text-sm text-muted-foreground">
              Please wait {adTimer}s to continue...
            </p>
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

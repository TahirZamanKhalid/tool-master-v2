// components/ProcessingOverlayWithAd.tsx
import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Shield } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface ProcessingOverlayProps {
  message: string;
  progress: number;
  isOpen?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  adSlot?: string;
}

// Track pushed slots to prevent duplicate pushes
const processingAdPushed = { current: false };

export const ProcessingOverlay = ({
  message,
  progress,
  isOpen = true,
  showSkip,
  onSkip,
  adSlot = "4159501466", // Default processing ad slot
}: ProcessingOverlayProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      processingAdPushed.current = false;
      setAdLoaded(false);
      return;
    }

    const pushAd = () => {
      if (processingAdPushed.current) return;

      try {
        if (typeof window === "undefined" || !window.adsbygoogle) {
          setTimeout(pushAd, 500);
          return;
        }

        if (!adRef.current || !containerRef.current) {
          setTimeout(pushAd, 300);
          return;
        }

        const width = containerRef.current.offsetWidth;
        if (width < 10) {
          setTimeout(pushAd, 300);
          return;
        }

        processingAdPushed.current = true;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
        console.log("[ProcessingAd] Video ad pushed successfully");
      } catch (error) {
        console.error("[ProcessingAd] Error:", error);
        processingAdPushed.current = true;
      }
    };

    const timer = setTimeout(pushAd, 500);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-purple-600 p-6 text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin" />
              <Sparkles className="h-5 w-5 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-center">
            Processing Your File
          </h3>
          <p className="text-white/80 text-center text-sm mt-1">{message}</p>
        </div>

        {/* Progress Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Preparing file...</span>
              <span>
                {progress < 30
                  ? "Reading file"
                  : progress < 60
                    ? "Processing pages"
                    : progress < 90
                      ? "Optimizing result"
                      : "Finalizing"}
              </span>
            </div>
          </div>

          {/* Animated Steps */}
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${progress >= step * 25
                  ? "bg-primary scale-110"
                  : "bg-gray-200 dark:bg-gray-700"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative px-6">
          <div className="absolute inset-0 flex items-center px-6">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-gray-900 px-3 text-xs text-gray-500 uppercase tracking-wider">
              Sponsored
            </span>
          </div>
        </div>

        {/* Video Ad Container */}
        <div className="p-6">
          <div
            ref={containerRef}
            className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden"
            style={{ minHeight: "250px", width: "100%" }}
          >
            <ins
              ref={adRef}
              className="adsbygoogle"
              style={{
                display: "block",
                width: "100%",
                minHeight: "250px",
              }}
              data-ad-client="ca-pub-7382531001943020"
              data-ad-slot={adSlot}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>

        {/* Privacy Notice and Skip Button */}
        <div className="px-6 pb-6 space-y-3">
          {showSkip && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
              className="w-full text-xs text-gray-500 hover:text-primary transition-colors"
            >
              Skip Processing (Experimental)
            </Button>
          )}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Your file is processed locally - 100% private and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

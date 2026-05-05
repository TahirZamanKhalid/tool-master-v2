import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface AdWatchModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onAdComplete?: () => void;
  onAdWatched?: () => void;
  title?: string;
  description?: string;
}

export const AdWatchModal = ({
  isOpen,
  open,
  onClose,
  onOpenChange,
  onAdComplete,
  onAdWatched,
  title = "Watch ad to continue",
  description = "Please watch this short ad to continue.",
}: AdWatchModalProps) => {
  const [countdown, setCountdown] = useState(5);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const modalOpen = isOpen ?? open ?? false;
  const handleClose = onClose || (() => onOpenChange?.(false));
  const handleComplete = onAdComplete || onAdWatched || (() => { });

  useEffect(() => {
    if (modalOpen) {
      setCountdown(15);
      setAdLoaded(false);
      setAdFailed(false);

      // Wait for dialog to render and have dimensions
      const timer = setTimeout(() => {
        try {
          if (adRef.current && containerRef.current) {
            const width = containerRef.current.offsetWidth;
            if (width > 0) {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              setAdLoaded(true);
            } else {
              // Retry after another delay
              setTimeout(() => {
                try {
                  (window.adsbygoogle = window.adsbygoogle || []).push({});
                  setAdLoaded(true);
                } catch (err) {
                  console.error("AdSense retry error:", err);
                  setAdFailed(true);
                }
              }, 500);
            }
          }
        } catch (err) {
          console.error("AdSense error:", err);
          setAdFailed(true);
          setAdLoaded(true);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [modalOpen]);

  useEffect(() => {
    if (modalOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [modalOpen, countdown]);

  const handleContinue = () => {
    handleComplete();
    handleClose();
  };

  const progress = ((5 - countdown) / 5) * 100;

  return (
    <Dialog open={modalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ad Container - with guaranteed dimensions */}
          <div
            ref={containerRef}
            className="flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border/50"
            style={{
              width: "100%",
              minWidth: "300px",
              minHeight: "280px",
              overflow: "hidden",
            }}
          >
            {adFailed ? (
              <div className="text-muted-foreground text-sm">
                Advertisement
              </div>
            ) : (
              <ins
                ref={adRef}
                className="adsbygoogle"
                style={{
                  display: "block",
                  width: "100%",
                  minWidth: "300px",
                  height: "250px",
                }}
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot="4838473293"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            )}
          </div>

          {/* Countdown and Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {countdown > 0
                    ? `Please wait ${countdown} seconds...`
                    : "Ready to continue!"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              disabled={countdown > 0}
              className="min-w-32"
            >
              {countdown > 0 ? `Wait ${countdown}s` : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
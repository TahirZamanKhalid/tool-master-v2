import { useEffect, useState } from "react";
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
  const [countdown, setCountdown] = useState(15);
  const [adLoaded, setAdLoaded] = useState(false);

  const modalOpen = isOpen ?? open ?? false;
  const handleClose = onClose || (() => onOpenChange?.(false));
  const handleComplete = onAdComplete || onAdWatched || (() => {});

  useEffect(() => {
    if (modalOpen) {
      setCountdown(15);
      setAdLoaded(false);
      
      // Initialize AdSense ad
      const timer = setTimeout(() => {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        } catch (err) {
          console.error("AdSense error:", err);
          setAdLoaded(true);
        }
      }, 100);

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

  const progress = ((15 - countdown) / 15) * 100;

  return (
    <Dialog open={modalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ad Container */}
          <div className="flex items-center justify-center min-h-[280px] bg-muted/30 rounded-lg border-2 border-dashed border-border/50">
            <ins
              className="adsbygoogle"
              style={{
                display: "block",
                width: "728px",
                height: "250px",
              }}
              data-ad-client="ca-pub-7382531001943020"
              data-ad-slot="4838473293"
            />
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

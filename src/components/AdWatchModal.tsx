import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { Clock } from "lucide-react";

interface AdWatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdWatched: () => void;
  title?: string;
  description?: string;
  adDuration?: number;
}

const AD_REOPEN_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds

export const AdWatchModal = ({
  open,
  onOpenChange,
  onAdWatched,
  title = "Watch Ad to Continue",
  description = "Please watch this short ad to unlock this premium feature",
  adDuration = 12, // Changed from 5 to 12 seconds (10-15 sec range)
}: AdWatchModalProps) => {
  const [countdown, setCountdown] = useState(adDuration);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    if (open) {
      setCountdown(adDuration);
      setCanProceed(false);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanProceed(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open, adDuration]);

  // Track when modal is closed and set up 2-minute reopen timer
  useEffect(() => {
    if (!open) {
      // Store the close time
      const closeTime = Date.now();
      
      // Set up timer to reopen after 2 minutes
      const reopenTimer = setTimeout(() => {
        onOpenChange(true);
      }, AD_REOPEN_INTERVAL);

      return () => clearTimeout(reopenTimer);
    }
  }, [open, onOpenChange]);

  const handleProceed = () => {
    onAdWatched();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ad Display Area */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <AdSpace size="rectangle" />
          </div>

          {/* Countdown and Action */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {canProceed ? (
                  "You can now proceed"
                ) : (
                  <>Wait {countdown} seconds...</>
                )}
              </span>
            </div>
            <Button
              onClick={handleProceed}
              disabled={!canProceed}
              size="sm"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

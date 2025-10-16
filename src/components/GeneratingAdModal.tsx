import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { LazyAdSpace } from "./LazyAdSpace";

interface GeneratingAdModalProps {
  open: boolean;
  onComplete: () => void;
  adDuration?: number; // in seconds
}

export const GeneratingAdModal = ({ 
  open, 
  onComplete,
  adDuration = 30 
}: GeneratingAdModalProps) => {
  const [countdown, setCountdown] = useState(adDuration);

  useEffect(() => {
    if (!open) {
      setCountdown(adDuration);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, adDuration, onComplete]);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Advertisement</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generating your content... Please wait while this advertisement is displayed.
            </p>
            <div className="text-2xl font-bold text-primary mb-4">
              {countdown}s
            </div>
          </div>
          
          <LazyAdSpace size="rectangle" className="mx-auto" />
          
          <div className="text-xs text-center text-muted-foreground">
            This ad will close automatically in {countdown} seconds
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

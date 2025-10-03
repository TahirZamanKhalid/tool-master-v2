import { Loader2 } from "lucide-react";
import { AdSpace } from "./AdSpace";

interface ProcessingOverlayProps {
  message?: string;
  progress?: number;
  onSkip?: () => void;
  showSkip?: boolean;
}

export const ProcessingOverlay = ({
  message = "Processing your request...",
  progress,
  onSkip,
  showSkip = false,
}: ProcessingOverlayProps) => {
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
        <AdSpace size="rectangle" />

        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground underline w-full text-center"
          >
            Skip ad
          </button>
        )}
      </div>
    </div>
  );
};

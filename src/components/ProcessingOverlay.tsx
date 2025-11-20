import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ProcessingOverlayProps {
  message: string;
  progress: number;
  showSkip?: boolean;
  onSkip?: () => void;
}

export const ProcessingOverlay = ({ 
  message, 
  progress, 
  showSkip = false, 
  onSkip 
}: ProcessingOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="p-8 max-w-md w-full mx-4 space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <h3 className="text-lg font-semibold">Processing...</h3>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{message}</p>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
        </div>

        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        )}
      </Card>
    </div>
  );
};

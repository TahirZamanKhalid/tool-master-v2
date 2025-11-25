import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { AdSpace } from "@/components/AdSpace";

const ScreenDetector = () => {
  const [screenInfo, setScreenInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ToolLayout
      title="Screen Size Detector"
      description="Display your current screen dimensions"
      category="Utilities"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded text-center">
              <p className="text-sm text-muted-foreground mb-2">Window Width</p>
              <p className="text-3xl font-bold text-primary">{screenInfo.width}px</p>
            </div>
            <div className="p-4 bg-muted rounded text-center">
              <p className="text-sm text-muted-foreground mb-2">Window Height</p>
              <p className="text-3xl font-bold text-primary">{screenInfo.height}px</p>
            </div>
            <div className="p-4 bg-muted rounded text-center">
              <p className="text-sm text-muted-foreground mb-2">Screen Width</p>
              <p className="text-3xl font-bold text-primary">{screenInfo.availWidth}px</p>
            </div>
            <div className="p-4 bg-muted rounded text-center">
              <p className="text-sm text-muted-foreground mb-2">Screen Height</p>
              <p className="text-3xl font-bold text-primary">{screenInfo.availHeight}px</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default ScreenDetector;

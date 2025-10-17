import { useEffect, useState } from "react";
import { LazyAdSpace } from "./LazyAdSpace";
import { getInfeedAdConfig } from "@/utils/adSlotRotation";

interface ContentAdBreakProps {
  index: number;
}

export const ContentAdBreak = ({ index }: ContentAdBreakProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const adConfig = getInfeedAdConfig(index);

  useEffect(() => {
    // Auto-close ad after 30 seconds (Google AdSense typical policy)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }


  return (
    <div className="my-8 relative">
      <div className="text-xs text-muted-foreground text-center mb-2">
        Advertisement
      </div>
      <LazyAdSpace 
        type="infeed" 
        slot={adConfig.slot}
        layoutKey={adConfig.layoutKey}
        className="mx-auto" 
      />
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-0 right-0 text-xs text-muted-foreground hover:text-foreground px-2 py-1"
        aria-label="Close advertisement"
      >
        ✕
      </button>
    </div>
  );
};

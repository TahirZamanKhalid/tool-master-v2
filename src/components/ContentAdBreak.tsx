import { useEffect, useState } from "react";
import { LazyAdSpace } from "./LazyAdSpace";
import { getInfeedAdConfig } from "@/utils/adSlotRotation";

interface ContentAdBreakProps {
  index: number;
}

export const ContentAdBreak = ({ index }: ContentAdBreakProps) => {
  const adConfig = getInfeedAdConfig(index);

  return (
    <div className="my-8">
      <div className="text-xs text-muted-foreground text-center mb-2">
        Advertisement
      </div>
      <LazyAdSpace 
        type="infeed" 
        slot={adConfig.slot}
        layoutKey={adConfig.layoutKey}
        className="mx-auto" 
      />
    </div>
  );
};

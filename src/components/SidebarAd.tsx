import { useEffect, useState } from "react";
import { LazyAdSpace } from "./LazyAdSpace";
import { getDisplayAdSlot, getAdIndex } from "@/utils/adSlotRotation";

interface SidebarAdProps {
  position: "left" | "right";
  className?: string;
}

export const SidebarAd = ({ position, className = "" }: SidebarAdProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const posKey = position === "left" ? "sidebar-left" : "sidebar-right" as const;

  return (
    <div className={`hidden xl:block ${className}`} style={{ width: "160px", maxWidth: "160px" }}>
      <div style={{ maxHeight: "600px", overflow: "hidden" }}>
        <LazyAdSpace
          type="display"
          slot={getDisplayAdSlot(getAdIndex(posKey))}
          position={posKey}
          className="w-full"
        />
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Ads help keep tools free
      </p>
    </div>
  );
};

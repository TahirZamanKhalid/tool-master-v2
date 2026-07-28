import { useRef, useState } from "react";
import type { AdSenseSlotStatus } from "@/hooks/useAdSenseUnit";
import { ADSENSE_CLIENT, useAdSenseUnit } from "@/hooks/useAdSenseUnit";

interface SidebarAdProps {
  slot?: string;
  position?: "left" | "right";
  index?: number;
  className?: string;
  width?: number;
  height?: number;
  collapseWhenEmpty?: boolean;
}

export const SidebarAd = ({
  slot,
  position = "left",
  index = 1,
  className = "",
  width = 200,
  height = 600,
  collapseWhenEmpty = false,
}: SidebarAdProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [slotStatus, setSlotStatus] = useState<AdSenseSlotStatus>("idle");
  const isCollapsedSlot =
    collapseWhenEmpty && (slotStatus === "unfilled" || slotStatus === "blocked");
  const shouldReserveSpace =
    !collapseWhenEmpty ||
    slotStatus === "requested" ||
    slotStatus === "filled" ||
    slotStatus === "unfill-optimized";
  const isVisible = shouldReserveSpace && !isCollapsedSlot;
  const collapsedHeight = isCollapsedSlot ? "0px" : "1px";

  useAdSenseUnit({
    adRef,
    containerRef,
    enabled: Boolean(slot),
    lazy: true,
    minWidth: 10,
    rootMargin: "250px",
    onStatusChange: setSlotStatus,
  });

  if (!slot) return null;

  return (
    <div
      ref={containerRef}
      aria-label={`${position === "left" ? "Left" : "Right"} advertisement ${index}`}
      aria-hidden={collapseWhenEmpty && !isVisible}
      className={`overflow-hidden rounded-xl border border-border/60 bg-card ${className}`}
      style={{
        width: `${width}px`,
        minHeight: isVisible ? `${height + 25}px` : collapsedHeight,
        height: isVisible ? undefined : collapsedHeight,
        borderWidth: isVisible ? undefined : 0,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? undefined : "none",
      }}
      data-ad-container-slot={slot}
      data-ad-slot-status={slotStatus}
    >
      <div className="border-b border-border/40 bg-muted/30 py-1.5 text-center text-[10px] uppercase text-muted-foreground">
        Advertisement
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "inline-block",
          width: `${width}px`,
          height: isVisible ? `${height}px` : collapsedHeight,
        }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
      />
    </div>
  );
};

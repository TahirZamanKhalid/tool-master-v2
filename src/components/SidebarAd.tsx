import { useRef } from "react";
import { ADSENSE_CLIENT, useAdSenseUnit } from "@/hooks/useAdSenseUnit";

interface SidebarAdProps {
  slot?: string;
  position?: "left" | "right";
  index?: number;
  className?: string;
  width?: number;
  height?: number;
}

export const SidebarAd = ({
  slot,
  position = "left",
  index = 1,
  className = "",
  width = 200,
  height = 600,
}: SidebarAdProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useAdSenseUnit({
    adRef,
    containerRef,
    enabled: Boolean(slot),
    lazy: true,
    minWidth: 10,
    rootMargin: "250px",
  });

  if (!slot) return null;

  return (
    <div
      ref={containerRef}
      aria-label={`${position === "left" ? "Left" : "Right"} advertisement ${index}`}
      className={`overflow-hidden rounded-xl border border-border/60 bg-card ${className}`}
      style={{ width: `${width}px`, minHeight: `${height + 25}px` }}
      data-ad-container-slot={slot}
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
          height: `${height}px`,
        }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
      />
    </div>
  );
};

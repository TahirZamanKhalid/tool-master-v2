import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { AdSenseSlotStatus } from "@/hooks/useAdSenseUnit";
import { ADSENSE_CLIENT, useAdSenseUnit } from "@/hooks/useAdSenseUnit";
import { useInlineAdsAllowed } from "@/hooks/useInlineAdsAllowed";

export interface AdSpaceProps {
  size?:
    | "leaderboard"
    | "banner"
    | "skyscraper"
    | "sidebar"
    | "sidebar-alt"
    | "square-300"
    | "medium-rect"
    | "custom";
  slot?: string;
  className?: string;
  style?: CSSProperties;
  lazy?: boolean;
  type?: string;
  position?: string;
}

const AD_SLOTS = {
  leaderboard: "9769564871",
  banner: "1575962277",
  skyscraper: "1212397554",
  sidebar: "5628599414",
  "sidebar-alt": "7110517063",
  "square-300": "4153181237",
  "medium-rect": "7713152297",
};

const SIZE_CONFIG: Record<
  string,
  { width: string; height: string; minWidth: string; minHeight: string }
> = {
  leaderboard: { width: "100%", height: "auto", minWidth: "320px", minHeight: "100px" },
  banner: { width: "100%", height: "auto", minWidth: "320px", minHeight: "60px" },
  skyscraper: { width: "200px", height: "600px", minWidth: "160px", minHeight: "600px" },
  sidebar: { width: "200px", height: "600px", minWidth: "160px", minHeight: "250px" },
  "sidebar-alt": { width: "200px", height: "600px", minWidth: "160px", minHeight: "250px" },
  "square-300": { width: "200px", height: "200px", minWidth: "160px", minHeight: "200px" },
  "medium-rect": { width: "200px", height: "250px", minWidth: "160px", minHeight: "250px" },
  custom: { width: "100%", height: "auto", minWidth: "160px", minHeight: "100px" },
};

const SLOT_SIZE_MAP: Record<string, AdSpaceProps["size"]> = {
  "1212397554": "skyscraper",
  "5628599414": "sidebar",
  "7110517063": "sidebar-alt",
  "4153181237": "square-300",
  "7713152297": "medium-rect",
};

export const AdSpace = ({
  size,
  slot,
  className,
  style,
  lazy = true,
}: AdSpaceProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [slotStatus, setSlotStatus] = useState<AdSenseSlotStatus>("idle");
  const inlineAdsAllowed = useInlineAdsAllowed();

  const resolvedSize = size || (slot ? SLOT_SIZE_MAP[slot] : undefined) || "leaderboard";
  const config = SIZE_CONFIG[resolvedSize] || SIZE_CONFIG.leaderboard;
  const adSlot =
    slot ||
    AD_SLOTS[resolvedSize as keyof typeof AD_SLOTS] ||
    AD_SLOTS.leaderboard;
  const isSidebarSize = [
    "skyscraper",
    "sidebar",
    "sidebar-alt",
    "square-300",
    "medium-rect",
  ].includes(resolvedSize);
  const adAllowed = inlineAdsAllowed || isSidebarSize;
  const canCollapse = !isSidebarSize;
  const isCollapsedSlot = slotStatus === "unfilled" || slotStatus === "blocked";
  const shouldReserveSpace =
    !canCollapse ||
    !lazy ||
    slotStatus === "requested" ||
    slotStatus === "filled" ||
    slotStatus === "unfill-optimized";
  const isVisible = shouldReserveSpace && !(canCollapse && isCollapsedSlot);
  const collapsedHeight = isCollapsedSlot ? "0px" : "1px";

  useAdSenseUnit({
    adRef,
    containerRef,
    enabled: adAllowed,
    lazy,
    minWidth: 10,
    rootMargin: "300px",
    onStatusChange: setSlotStatus,
  });

  if (!adAllowed) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden={canCollapse && !isVisible}
      style={{
        ...style,
        display: "block",
        width: isSidebarSize ? config.width : "100%",
        minWidth: config.minWidth,
        minHeight: isVisible ? config.minHeight : collapsedHeight,
        height: isVisible ? undefined : collapsedHeight,
        margin: "0 auto",
        overflow: "hidden",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? undefined : "none",
      }}
      data-ad-container-slot={adSlot}
      data-ad-slot-status={slotStatus}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width: isSidebarSize ? config.width : "100%",
          height: isSidebarSize ? config.height : "auto",
          minWidth: config.minWidth,
          minHeight: isVisible ? config.minHeight : collapsedHeight,
        }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format={isSidebarSize ? "vertical" : "auto"}
        data-full-width-responsive={isSidebarSize ? "false" : "true"}
      />
    </div>
  );
};

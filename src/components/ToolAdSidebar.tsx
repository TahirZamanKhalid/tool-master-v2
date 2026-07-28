import { SidebarAd } from "@/components/SidebarAd";

const SIDEBAR_SLOTS = {
  left: ["5628599414", "7110517063"],
  right: ["4153181237", "7713152297"],
} as const;

const MIN_SIDEBAR_SLOTS = 2;
const MAX_SIDEBAR_SLOTS = 6;
const CONTENT_HEIGHT_PER_SLOT = 560;
const SIDEBAR_AD_WIDTH = 160;
const SIDEBAR_AD_HEIGHT = 250;

interface ToolAdSidebarProps {
  side: "left" | "right";
  contentHeight?: number;
}

const getSidebarSlotCount = (contentHeight = 0) => {
  if (contentHeight <= 0) return MIN_SIDEBAR_SLOTS;

  return Math.min(
    MAX_SIDEBAR_SLOTS,
    Math.max(MIN_SIDEBAR_SLOTS, Math.ceil(contentHeight / CONTENT_HEIGHT_PER_SLOT))
  );
};

export const ToolAdSidebar = ({ side, contentHeight = 0 }: ToolAdSidebarProps) => {
  const slotPool = SIDEBAR_SLOTS[side];
  const slotCount = getSidebarSlotCount(contentHeight);
  const useStickyFallback = contentHeight <= 0 || slotCount <= MIN_SIDEBAR_SLOTS;
  const slots = Array.from({ length: slotCount }, (_, index) => slotPool[index % slotPool.length]);

  return (
    <aside
      aria-label={`${side === "left" ? "Left" : "Right"} advertisements`}
      className={`hidden w-[160px] shrink-0 flex-col gap-4 lg:flex ${
        slotCount > MIN_SIDEBAR_SLOTS ? "justify-between" : ""
      }`}
      data-sidebar-ad-count={slotCount}
      data-sidebar-content-height={Math.round(contentHeight)}
    >
      {slots.map((slot, index) => (
        <SidebarAd
          key={`${side}-${index}-${slot}`}
          slot={slot}
          position={side}
          index={index + 1}
          width={SIDEBAR_AD_WIDTH}
          height={SIDEBAR_AD_HEIGHT}
          collapseWhenEmpty
          className={useStickyFallback && index === 1 ? "sticky top-20" : ""}
        />
      ))}
    </aside>
  );
};

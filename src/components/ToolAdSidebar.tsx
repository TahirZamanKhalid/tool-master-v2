import { SidebarAd } from "@/components/SidebarAd";

const SIDEBAR_SLOTS = {
  left: ["5628599414", "7110517063"],
  right: ["4153181237", "7713152297"],
} as const;

interface ToolAdSidebarProps {
  side: "left" | "right";
}

export const ToolAdSidebar = ({ side }: ToolAdSidebarProps) => {
  const [primarySlot, stickySlot] = SIDEBAR_SLOTS[side];

  return (
    <aside
      aria-label={`${side === "left" ? "Left" : "Right"} advertisements`}
      className="hidden w-[160px] shrink-0 flex-col gap-3 lg:flex"
    >
      <SidebarAd
        slot={primarySlot}
        position={side}
        index={1}
        width={160}
        height={250}
      />
      <SidebarAd
        slot={stickySlot}
        position={side}
        index={2}
        width={160}
        height={250}
        className="sticky top-20"
      />
    </aside>
  );
};

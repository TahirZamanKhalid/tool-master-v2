// AdRow.tsx - Fixed version
import { LazyAdSpace } from "./LazyAdSpace";

type AdRowProps = {
  type: "display" | "multiplex" | "infeed";
  count?: number;
  className?: string;
  position?: "top" | "bottom" | "sidebar-left" | "sidebar-right" | "content";
};

export const AdRow = ({ type, count, className = "", position = "content" }: AdRowProps) => {
  // Default counts based on type
  const defaultCount = type === "multiplex" ? 3 : 2;
  const adCount = count || defaultCount;

  // Simple grid classes - always use 3 columns for multiplex, 2 for others
  const getGridClass = () => {
    if (type === "multiplex" || adCount >= 3) {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
    }
    return "grid grid-cols-1 md:grid-cols-2 gap-4";
  };

  // Simple ad slot generation (replace with your actual logic)
  const getAdSlot = (index: number) => {
    const slots = {
      display: ["display_ad_slot_1", "display_ad_slot_2", "display_ad_slot_3"],
      multiplex: ["multiplex_ad_slot_1", "multiplex_ad_slot_2", "multiplex_ad_slot_3"],
      infeed: ["infeed_ad_slot_1", "infeed_ad_slot_2", "infeed_ad_slot_3"],
    };
    return slots[type][index % slots[type].length];
  };

  const getLayoutKey = (index: number) => {
    return `layout_key_${index + 1}`;
  };

  return (
    <div className={`${getGridClass()} ${className}`}>
      {Array.from({ length: adCount }).map((_, index) => (
        <div key={`ad-${type}-${index}`} className="flex justify-center">
          {type === "display" && (
            <LazyAdSpace type="display" slot={getAdSlot(index)} position={position} className="w-full min-h-[250px]" />
          )}
          {type === "multiplex" && (
            <LazyAdSpace
              type="multiplex"
              slot={getAdSlot(index)}
              position={position}
              className="w-full min-h-[200px]"
            />
          )}
          {type === "infeed" && (
            <LazyAdSpace
              type="infeed"
              slot={getAdSlot(index)}
              layoutKey={getLayoutKey(index)}
              position={position}
              className="w-full min-h-[120px]"
            />
          )}
        </div>
      ))}
    </div>
  );
};

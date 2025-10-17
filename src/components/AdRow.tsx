// components/AdRow.tsx
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

  // Grid layout
  const getGridClass = () => {
    if (type === "multiplex" || adCount >= 3) {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    }
    return "grid grid-cols-1 md:grid-cols-2 gap-6";
  };

  // Get ad slots based on position and type
  const getAdSlots = () => {
    const baseSlots = {
      display: ["display_ad_slot_1", "display_ad_slot_2", "display_ad_slot_3"],
      multiplex: ["multiplex_ad_slot_1", "multiplex_ad_slot_2", "multiplex_ad_slot_3"],
      infeed: ["infeed_ad_slot_1", "infeed_ad_slot_2", "infeed_ad_slot_3"],
    };

    return baseSlots[type].slice(0, adCount);
  };

  const adSlots = getAdSlots();

  return (
    <div className={`${getGridClass()} ${className}`}>
      {adSlots.map((slot, index) => (
        <div key={`ad-${type}-${index}`} className="flex justify-center w-full">
          <LazyAdSpace type={type} slot={slot} position={position} className="w-full" />
        </div>
      ))}
    </div>
  );
};

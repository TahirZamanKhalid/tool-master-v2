// components/AdRow.tsx
import { LazyAdSpace } from "./LazyAdSpace";

type AdRowProps = {
  type: "display" | "multiplex" | "infeed";
  count?: number;
  className?: string;
  position?: "top" | "bottom" | "content";
};

export const AdRow = ({ type, count = 3, className = "", position = "content" }: AdRowProps) => {
  const getAdSlots = () => {
    const slots = {
      display: ["display_ad_slot_1", "display_ad_slot_2", "display_ad_slot_3"],
      multiplex: ["multiplex_ad_slot_1", "multiplex_ad_slot_2", "multiplex_ad_slot_3"],
      infeed: ["infeed_ad_slot_1", "infeed_ad_slot_2", "infeed_ad_slot_3"],
    };
    return slots[type].slice(0, count);
  };

  const gridClass =
    count >= 3
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      : count === 2
        ? "grid grid-cols-1 md:grid-cols-2 gap-4"
        : "grid grid-cols-1 gap-4";

  return (
    <div className={`${gridClass} ${className}`}>
      {getAdSlots().map((slot, index) => (
        <div key={`${type}-${index}`} className="flex justify-center">
          <LazyAdSpace type={type} slot={slot} position={position} className="w-full" />
        </div>
      ))}
    </div>
  );
};

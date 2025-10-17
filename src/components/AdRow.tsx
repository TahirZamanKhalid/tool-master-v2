import { LazyAdSpace } from "./LazyAdSpace";
import { getAdIndex, getDisplayAdSlot, getMultiplexAdSlot, getInfeedAdConfig } from "@/utils/adSlotRotation";

type AdRowProps = {
  type: "display" | "multiplex" | "infeed";
  count?: number;
  className?: string;
  position?: 'top' | 'bottom' | 'sidebar-left' | 'sidebar-right' | 'content';
};

export const AdRow = ({ type, count, className = "", position = 'content' }: AdRowProps) => {
  const baseIndex = getAdIndex(position);
  const items = Array.from({ length: Math.max(1, count ?? (type === 'multiplex' ? 3 : 2)) });

  const containerCols = (count ?? 0) >= 3 || type === 'multiplex'
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    : "grid grid-cols-1 md:grid-cols-2 gap-4";

  return (
    <div className={`${containerCols} ${className}`}>
      {items.map((_, i) => {
        if (type === 'display') {
          const slot = getDisplayAdSlot(baseIndex + i);
          return (
            <div key={`ad-${type}-${i}`} className="flex justify-center max-w-md mx-auto">
              <LazyAdSpace type="display" slot={slot} position={position} className="w-full" />
            </div>
          );
        }
        if (type === 'multiplex') {
          const slot = getMultiplexAdSlot(baseIndex + i);
          return (
            <div key={`ad-${type}-${i}`} className="flex justify-center max-w-md mx-auto">
              <LazyAdSpace type="multiplex" slot={slot} position={position} className="w-full" />
            </div>
          );
        }
        // infeed
        const { slot, layoutKey } = getInfeedAdConfig(baseIndex + i);
        return (
          <div key={`ad-${type}-${i}`} className="flex justify-center max-w-md mx-auto">
            <LazyAdSpace type="infeed" slot={slot} layoutKey={layoutKey} position={position} className="w-full" />
          </div>
        );
      })}
    </div>
  );
};

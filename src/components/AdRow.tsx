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
    if (type === "display") {
      const allDisplaySlots = [
        "8907016752", "1212397554", "2918331088", "4402803148", 
        "9239216915", "8923135106", "4202125614", "2889043946", "1575962277"
      ];
      return allDisplaySlots.slice(0, count);
    } else if (type === "multiplex") {
      return ["2127993591", "4356563508", "7202218695"].slice(0, count);
    } else if (type === "infeed") {
      return ["4739066253", "1968211491"].slice(0, count);
    }
    return [];
  };

  const gridClass =
    count >= 3
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      : count === 2
        ? "grid grid-cols-1 md:grid-cols-2 gap-4"
        : "grid grid-cols-1 gap-4";

  const getLayoutKey = (index: number) => {
    if (type === "infeed") {
      return index === 0 ? "-gk-24+14-4r+ke" : "-g5-1u+99-a6-k8";
    }
    return undefined;
  };

  return (
    <div className={`${gridClass} ${className}`}>
      {getAdSlots().map((slot, index) => (
        <div key={`${type}-${slot}`} className="flex justify-center">
          <LazyAdSpace 
            type={type} 
            slot={slot} 
            layoutKey={getLayoutKey(index)}
            position={position} 
            className="w-full max-w-md mx-auto" 
          />
        </div>
      ))}
    </div>
  );
};

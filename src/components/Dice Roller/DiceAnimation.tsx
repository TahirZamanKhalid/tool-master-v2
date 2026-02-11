// components/DiceAnimation.tsx
import { useEffect, useState } from "react";

interface DiceAnimationProps {
    sides: number;
    isRolling: boolean;
    result: number | null;
    diceIndex?: number;
}

export const DiceAnimation = ({
    sides,
    isRolling,
    result,
    diceIndex = 0,
}: DiceAnimationProps) => {
    const [displayValue, setDisplayValue] = useState<number>(1);
    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

    // Animate random numbers during roll
    useEffect(() => {
        if (!isRolling) {
            if (result !== null) {
                setDisplayValue(result);
            }
            return;
        }

        const interval = setInterval(() => {
            setDisplayValue(Math.floor(Math.random() * sides) + 1);
            setRotation({
                x: Math.random() * 360,
                y: Math.random() * 360,
                z: Math.random() * 360,
            });
        }, 50);

        return () => clearInterval(interval);
    }, [isRolling, sides, result]);

    // Get dice face dots for D6
    const getDiceDots = (value: number) => {
        const dotPositions: Record<number, string[]> = {
            1: ["center"],
            2: ["top-right", "bottom-left"],
            3: ["top-right", "center", "bottom-left"],
            4: ["top-left", "top-right", "bottom-left", "bottom-right"],
            5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
            6: [
                "top-left",
                "top-right",
                "middle-left",
                "middle-right",
                "bottom-left",
                "bottom-right",
            ],
        };
        return dotPositions[value] || [];
    };

    const getDotPosition = (position: string) => {
        const positions: Record<string, string> = {
            "top-left": "top-2 left-2",
            "top-right": "top-2 right-2",
            center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "middle-left": "top-1/2 left-2 -translate-y-1/2",
            "middle-right": "top-1/2 right-2 -translate-y-1/2",
            "bottom-left": "bottom-2 left-2",
            "bottom-right": "bottom-2 right-2",
        };
        return positions[position] || "";
    };

    // Get dice color based on type
    const getDiceColor = () => {
        const colors: Record<number, string> = {
            4: "from-red-500 to-red-700",
            6: "from-blue-500 to-blue-700",
            8: "from-green-500 to-green-700",
            10: "from-purple-500 to-purple-700",
            12: "from-orange-500 to-orange-700",
            20: "from-pink-500 to-pink-700",
            100: "from-gray-600 to-gray-800",
        };
        return colors[sides] || "from-primary to-purple-700";
    };

    // Get dice shape
    const getDiceShape = () => {
        if (sides === 4) return "clip-path-triangle";
        if (sides === 6) return "rounded-xl";
        if (sides === 8 || sides === 10 || sides === 12) return "rounded-2xl rotate-45";
        if (sides === 20) return "rounded-full";
        return "rounded-xl";
    };

    const animationDelay = diceIndex * 0.1;

    return (
        <div
            className="relative perspective-1000"
            style={{ animationDelay: `${animationDelay}s` }}
        >
            <div
                className={`
          relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
          bg-gradient-to-br ${getDiceColor()}
          ${getDiceShape()}
          shadow-2xl
          flex items-center justify-center
          transform-gpu transition-all duration-100
          ${isRolling ? "animate-dice-roll" : "animate-dice-land"}
        `}
                style={{
                    transform: isRolling
                        ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
                        : "rotateX(0) rotateY(0) rotateZ(0)",
                    boxShadow: isRolling
                        ? "0 20px 50px rgba(0,0,0,0.4)"
                        : "0 10px 30px rgba(0,0,0,0.3)",
                }}
            >
                {/* Inner shadow for 3D effect */}
                <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                {/* Dice content */}
                {sides === 6 ? (
                    // Show dots for D6
                    <div className="relative w-full h-full">
                        {getDiceDots(displayValue).map((pos, idx) => (
                            <div
                                key={idx}
                                className={`absolute w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-inner ${getDotPosition(
                                    pos
                                )}`}
                            />
                        ))}
                    </div>
                ) : (
                    // Show number for other dice
                    <span
                        className={`
              text-white font-bold drop-shadow-lg
              ${sides === 100 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl md:text-4xl"}
              ${sides === 8 || sides === 10 || sides === 12 ? "-rotate-45" : ""}
            `}
                    >
                        {displayValue}
                    </span>
                )}

                {/* Shine effect */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div
                        className={`
              absolute -top-1/2 -left-1/2 w-full h-full
              bg-gradient-to-br from-white/40 to-transparent
              transform rotate-45
              ${isRolling ? "animate-shine" : ""}
            `}
                    />
                </div>
            </div>

            {/* Dice type label */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 dark:text-gray-400">
                D{sides}
            </div>
        </div>
    );
};
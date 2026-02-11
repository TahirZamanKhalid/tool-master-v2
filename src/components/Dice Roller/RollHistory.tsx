// components/RollHistory.tsx
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RollRecord {
    id: number;
    dice: { sides: number; result: number }[];
    total: number;
    timestamp: Date;
    modifier: number;
}

interface RollHistoryProps {
    history: RollRecord[];
    onClear: () => void;
}

export const RollHistory = ({ history, onClear }: RollHistoryProps) => {
    if (history.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No rolls yet. Start rolling!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Roll History
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="text-xs text-red-500 hover:text-red-600"
                >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                </Button>
            </div>

            <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                    {history.map((roll) => (
                        <div
                            key={roll.id}
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {roll.dice.map((d, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium"
                                        >
                                            D{d.sides}: {d.result}
                                        </span>
                                    ))}
                                    {roll.modifier !== 0 && (
                                        <span className="text-xs text-gray-500">
                                            {roll.modifier > 0 ? "+" : ""}
                                            {roll.modifier}
                                        </span>
                                    )}
                                </div>
                                <span className="text-lg font-bold text-primary">{roll.total}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                                {roll.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};
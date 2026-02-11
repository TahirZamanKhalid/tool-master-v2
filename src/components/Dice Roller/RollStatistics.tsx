// components/RollStatistics.tsx
import { BarChart3, TrendingUp, Hash, Target } from "lucide-react";

interface RollRecord {
    id: number;
    dice: { sides: number; result: number }[];
    total: number;
    timestamp: Date;
    modifier: number;
}

interface RollStatisticsProps {
    history: RollRecord[];
}

export const RollStatistics = ({ history }: RollStatisticsProps) => {
    if (history.length === 0) {
        return null;
    }

    const totals = history.map((r) => r.total);
    const average = totals.reduce((a, b) => a + b, 0) / totals.length;
    const max = Math.max(...totals);
    const min = Math.min(...totals);
    const totalRolls = history.reduce((acc, r) => acc + r.dice.length, 0);

    // Calculate most common result
    const resultCounts: Record<number, number> = {};
    history.forEach((roll) => {
        roll.dice.forEach((d) => {
            resultCounts[d.result] = (resultCounts[d.result] || 0) + 1;
        });
    });
    const mostCommon = Object.entries(resultCounts).sort(
        (a, b) => b[1] - a[1]
    )[0];

    const stats = [
        {
            label: "Total Rolls",
            value: totalRolls,
            icon: Hash,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            label: "Average",
            value: average.toFixed(1),
            icon: TrendingUp,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            label: "Highest",
            value: max,
            icon: BarChart3,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            label: "Most Common",
            value: mostCommon ? mostCommon[0] : "-",
            icon: Target,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center"
                >
                    <div
                        className={`w-10 h-10 ${stat.bg} rounded-full flex items-center justify-center mx-auto mb-2`}
                    >
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
            ))}
        </div>
    );
};
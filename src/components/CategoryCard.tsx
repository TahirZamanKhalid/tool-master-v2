import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  toolCount: number;
  color: string;
  isSelected?: boolean;
  comingSoon?: boolean;
}

export const CategoryCard = ({
  icon: Icon,
  title,
  description,
  toolCount,
  color,
  isSelected = false,
  comingSoon = false,
}: CategoryCardProps) => {
  return (
    <div
      className={`group relative flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
        isSelected
          ? "border-primary/70 bg-primary/8 shadow-glow ring-2 ring-primary/20"
          : comingSoon
          ? "border-border/40 bg-card/50 opacity-70 cursor-not-allowed"
          : "border-border/50 bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-card-hover shadow-card"
      }`}
    >
      {/* Top gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Coming soon */}
        {comingSoon && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border/60">
              Coming Soon
            </span>
          </div>
        )}

        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Title + Description */}
        <h3 className="font-bold text-base text-foreground mb-1.5 group-hover:text-primary transition-colors duration-200 leading-tight">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${color} text-white shadow-sm`}>
            {comingSoon ? "No tools yet" : `${toolCount} tools`}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
        </div>
      </div>
    </div>
  );
};

import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  category: string;
  popular?: boolean;
  comingSoon?: boolean;
}

export const ToolCard = ({ icon: Icon, title, description, category, popular, comingSoon }: ToolCardProps) => {
  return (
    <div
      className={`group relative flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden ${
        comingSoon
          ? "border-border/40 bg-card/50 cursor-not-allowed opacity-70"
          : "border-border/50 bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-card-hover cursor-pointer shadow-card"
      }`}
    >
      {/* Top accent line on hover */}
      {!comingSoon && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Badge */}
      {popular && !comingSoon && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-primary to-accent text-white shadow-sm">
            POPULAR
          </span>
        </div>
      )}
      {comingSoon && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border/60">
            SOON
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Icon + Category row */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl transition-all duration-300 ${
            comingSoon
              ? "bg-muted/50 text-muted-foreground"
              : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-md group-hover:shadow-primary/25"
          }`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/40">
            {category}
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-[15px] leading-snug mb-2 transition-colors duration-200 ${
          comingSoon ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
        }`}>
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1 mb-4">
          {description}
        </p>

        {/* CTA */}
        <div className={`flex items-center gap-1.5 text-xs font-bold transition-all duration-200 ${
          comingSoon
            ? "text-muted-foreground/50"
            : "text-primary/70 group-hover:text-primary group-hover:gap-2.5"
        }`}>
          {comingSoon ? (
            <span>Coming Soon</span>
          ) : (
            <>
              <span>Use Tool</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

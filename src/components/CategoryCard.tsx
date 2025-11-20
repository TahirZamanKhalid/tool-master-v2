import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  toolCount: number;
  color: string;
  isSelected?: boolean;
  comingSoon?: boolean;
}

export const CategoryCard = ({ icon: Icon, title, description, toolCount, color, isSelected = false, comingSoon = false }: CategoryCardProps) => {
  return (
    <Card className={`group cursor-pointer shadow-card hover:shadow-card-hover transition-smooth hover:-translate-y-2 hover:scale-105 flex flex-col h-full overflow-hidden border-2 animate-fade-in-up ${
      isSelected ? 'border-primary border-2 ring-4 ring-primary/30 shadow-glow' : 'border-transparent hover:border-primary/30'
    } ${comingSoon ? 'opacity-75' : ''}`}>
      <CardContent className="p-6 relative flex-1 flex flex-col gradient-card">
        {comingSoon && (
          <div className="absolute top-3 right-3 animate-bounce-in">
            <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-card animate-pulse-slow">
              Coming Soon
            </span>
          </div>
        )}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-card group-hover:shadow-card-hover transition-smooth group-hover:scale-110 group-hover:rotate-6 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/20 group-hover:animate-shimmer"></div>
          <Icon className="h-7 w-7 text-white relative z-10 group-hover:animate-float" />
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover:text-gradient transition-smooth">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3 flex-1 leading-relaxed">{description}</p>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${color} animate-pulse-slow`}></div>
          <p className="text-xs font-semibold text-gradient">
            {comingSoon ? 'No tools yet' : `${toolCount} tools available`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

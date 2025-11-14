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
    <Card className={`group cursor-pointer shadow-card hover-lift flex flex-col h-full border-2 glass rounded-2xl overflow-hidden ${
      isSelected ? 'border-primary ring-4 ring-primary/20' : 'border-border/50 hover:border-primary/50'
    } ${comingSoon ? 'opacity-75' : ''}`}>
      <CardContent className="p-6 relative flex-1 flex flex-col">
        {comingSoon && (
          <div className="absolute top-3 right-3">
            <span className="bg-warning text-warning-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              Coming Soon
            </span>
          </div>
        )}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-smooth`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-smooth">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1 leading-relaxed">{description}</p>
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-primary via-secondary to-accent"></div>
          <p className="text-xs font-bold text-primary">
            {comingSoon ? 'No tools yet' : `${toolCount} tools`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

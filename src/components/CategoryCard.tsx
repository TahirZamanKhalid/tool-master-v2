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
    <Card className={`group cursor-pointer shadow-card hover:shadow-card-hover transition-smooth hover:-translate-y-1 flex flex-col h-full ${
      isSelected ? 'border-primary border-2 ring-2 ring-primary/20' : ''
    } ${comingSoon ? 'opacity-75' : ''}`}>
      <CardContent className="p-6 relative flex-1 flex flex-col">
        {comingSoon && (
          <div className="absolute top-3 right-3">
            <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        )}
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3 flex-1">{description}</p>
        <p className="text-xs font-medium text-primary">
          {comingSoon ? 'No tools yet' : `${toolCount} tools available`}
        </p>
      </CardContent>
    </Card>
  );
};

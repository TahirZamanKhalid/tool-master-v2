import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  toolCount: number;
  color: string;
  isSelected?: boolean;
}

export const CategoryCard = ({ icon: Icon, title, description, toolCount, color, isSelected = false }: CategoryCardProps) => {
  return (
    <Card className={`group cursor-pointer shadow-card hover:shadow-card-hover transition-smooth hover:-translate-y-1 ${
      isSelected ? 'border-primary border-2 ring-2 ring-primary/20' : ''
    }`}>
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <p className="text-xs font-medium text-primary">{toolCount} tools available</p>
      </CardContent>
    </Card>
  );
};

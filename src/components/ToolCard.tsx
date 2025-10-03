import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  category: string;
  popular?: boolean;
}

export const ToolCard = ({ icon: Icon, title, description, category, popular }: ToolCardProps) => {
  return (
    <Card className="group cursor-pointer shadow-card hover:shadow-card-hover transition-smooth hover:-translate-y-1 relative">
      {popular && (
        <Badge className="absolute -top-2 -right-2 gradient-primary border-0 shadow-lg">
          Popular
        </Badge>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button variant="outline" className="w-full group-hover:gradient-primary group-hover:text-white group-hover:border-0 transition-smooth">
          Use Tool
        </Button>
      </CardContent>
    </Card>
  );
};

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
  comingSoon?: boolean;
}

export const ToolCard = ({ icon: Icon, title, description, category, popular, comingSoon }: ToolCardProps) => {
  return (
    <Card className={`group shadow-card hover:shadow-card-hover transition-smooth hover:-translate-y-1 relative flex flex-col h-full ${comingSoon ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
      {popular && !comingSoon && (
        <Badge className="absolute -top-2 -right-2 gradient-primary border-0 shadow-lg">
          Popular
        </Badge>
      )}
      {comingSoon && (
        <Badge className="absolute -top-2 -right-2 bg-yellow-500/90 text-white border-0 shadow-lg">
          Coming Soon
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
        <CardTitle className="text-lg mt-3 line-clamp-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{description}</p>
        <Button 
          variant="outline" 
          className="w-full group-hover:gradient-primary group-hover:text-white group-hover:border-0 transition-smooth"
          disabled={comingSoon}
        >
          {comingSoon ? 'Coming Soon' : 'Use Tool'}
        </Button>
      </CardContent>
    </Card>
  );
};

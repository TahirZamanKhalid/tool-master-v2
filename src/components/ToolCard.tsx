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
    <Card className={`group shadow-card hover-lift relative flex flex-col h-full border-2 glass rounded-2xl overflow-hidden ${
      comingSoon ? 'cursor-not-allowed opacity-70 border-border/50' : 'cursor-pointer border-border/50 hover:border-secondary/50'
    }`}>
      {popular && !comingSoon && (
        <Badge className="absolute -top-2 -right-2 gradient-primary border-0 shadow-glow z-10 font-bold">
          ⭐ Popular
        </Badge>
      )}
      {comingSoon && (
        <Badge className="absolute -top-2 -right-2 bg-warning text-warning-foreground border-0 shadow-lg z-10 font-bold">
          Coming Soon
        </Badge>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 via-primary/20 to-accent/20 border border-primary/10 shadow-md group-hover:shadow-glow transition-smooth">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary font-medium">
            {category}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3 line-clamp-2 group-hover:text-primary transition-smooth">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3 leading-relaxed">{description}</p>
        <Button 
          variant="outline" 
          className="w-full group-hover:gradient-primary group-hover:text-white group-hover:border-0 transition-smooth rounded-xl font-semibold shadow-sm"
          disabled={comingSoon}
        >
          {comingSoon ? 'Coming Soon' : 'Use Tool →'}
        </Button>
      </CardContent>
    </Card>
  );
};

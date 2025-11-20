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
    <Card className={`group shadow-card hover:shadow-card-hover transition-smooth hover:-translate-y-2 hover:scale-105 relative flex flex-col h-full border-2 border-transparent hover:border-primary/20 overflow-hidden animate-fade-in-up ${comingSoon ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
      {popular && !comingSoon && (
        <Badge className="absolute -top-2 -right-2 gradient-primary border-0 shadow-card z-10 animate-bounce-in">
          <span className="animate-pulse-slow">⭐ Popular</span>
        </Badge>
      )}
      {comingSoon && (
        <Badge className="absolute -top-2 -right-2 bg-yellow-500/90 text-white border-0 shadow-card z-10 animate-bounce-in">
          Coming Soon
        </Badge>
      )}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"></div>
      </div>
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 shadow-card group-hover:shadow-card-hover transition-smooth group-hover:scale-110 group-hover:rotate-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Icon className="h-6 w-6 text-primary relative z-10 group-hover:animate-wiggle" />
          </div>
          <Badge variant="outline" className="text-xs font-semibold border-2 group-hover:border-primary/50 transition-smooth">
            {category}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3 line-clamp-2 group-hover:text-gradient transition-smooth">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col relative z-10">
        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3 leading-relaxed">{description}</p>
        <Button
          variant="outline"
          className="w-full group-hover:gradient-primary group-hover:text-white group-hover:border-0 transition-bounce shadow-card group-hover:shadow-card-hover font-semibold shimmer-effect"
          disabled={comingSoon}
        >
          {comingSoon ? 'Coming Soon' : 'Use Tool →'}
        </Button>
      </CardContent>
    </Card>
  );
};

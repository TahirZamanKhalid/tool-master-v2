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
    <Card className={`group relative flex flex-col h-full border border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden ${comingSoon ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>

      {/* Popular Badge */}
      {popular && !comingSoon && (
        <div className="absolute top-0 right-0 z-20">
          <div className="bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-md">
            POPULAR
          </div>
        </div>
      )}

      {/* Coming Soon Badge */}
      {comingSoon && (
        <div className="absolute top-0 right-0 z-20">
          <div className="bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-md">
            SOON
          </div>
        </div>
      )}

      {/* Hover Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardHeader className="pt-6 px-6 pb-2 relative z-10">
        <div className="flex justify-between items-start mb-4">
          {/* Icon Container */}
          <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
            <Icon className="h-6 w-6" />
          </div>

          {/* Category Badge */}
          <Badge variant="secondary" className="font-semibold text-[10px] uppercase tracking-wider bg-secondary text-secondary-foreground shadow-sm">
            {category}
          </Badge>
        </div>

        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6 flex-1 flex flex-col relative z-10">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-6 flex-1">
          {description}
        </p>

        <Button
          className={`w-full font-bold shadow-sm transition-all duration-300 ${comingSoon
            ? 'bg-muted text-muted-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-white'
            }`}
          disabled={comingSoon}
        >
          {comingSoon ? 'Coming Soon' : 'Try Now'}
        </Button>
      </CardContent>
    </Card>
  );
};

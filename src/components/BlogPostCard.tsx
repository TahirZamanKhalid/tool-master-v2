import { Card } from "@/components/ui/card";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedDate: string;
  image?: string;
}

export const BlogPostCard = ({
  slug,
  title,
  excerpt,
  category,
  readTime,
  publishedDate,
  image,
}: BlogPostCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-card-hover transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/blog/${slug}`)}>
      {image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
            {category}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {publishedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {readTime}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">{excerpt}</p>
        <Button variant="ghost" className="gap-2 p-0 h-auto">
          Read More <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { BlogPost } from "@/data/blogPosts";
import { useNavigate } from "react-router-dom";

interface BlogPostCardProps {
  post: BlogPost;
}

export const BlogPostCard = ({ post }: BlogPostCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 cursor-pointer group flex flex-col h-full"
      onClick={() => navigate(`/blog/${post.slug}`)}
    >
      <CardHeader className="p-0 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </CardHeader>
      <CardContent className="p-6 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
            {post.category}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0 mt-auto flex flex-col items-start gap-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
          Read Full Article <ArrowRight className="h-4 w-4 ml-1" />
        </div>
      </CardFooter>
    </Card>
  );
};

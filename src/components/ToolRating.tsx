import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ToolRatingProps {
  toolPath: string;
}

export const ToolRating = ({ toolPath }: ToolRatingProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userRating, setUserRating] = useState<any>(null);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchRatings();
  }, [toolPath]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchUserRating(user.id);
    }
  };

  const fetchUserRating = async (userId: string) => {
    const { data } = await supabase
      .from("tool_ratings")
      .select("*")
      .eq("tool_path", toolPath)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (data) {
      setUserRating(data);
      setRating(data.rating);
      setComment(data.comment || "");
    }
  };

  const fetchRatings = async () => {
    const { data, count } = await supabase
      .from("tool_ratings")
      .select("rating", { count: "exact" })
      .eq("tool_path", toolPath);

    if (data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      setAvgRating(avg);
      setTotalRatings(count || 0);
    }
  };

  const submitRating = async () => {
    if (!user) {
      toast.error("Please sign in to rate this tool");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    const { error } = await supabase
      .from("tool_ratings")
      .upsert({
        tool_path: toolPath,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      });

    if (error) {
      toast.error("Failed to submit rating");
    } else {
      toast.success("Rating submitted successfully!");
      fetchRatings();
      fetchUserRating(user.id);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Rate this tool</h3>
            {totalRatings > 0 && (
              <p className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} average from {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 cursor-pointer transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        {user && (
          <>
            <Textarea
              placeholder="Share your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button onClick={submitRating} className="w-full">
              {userRating ? "Update Rating" : "Submit Rating"}
            </Button>
          </>
        )}

        {!user && (
          <p className="text-sm text-muted-foreground text-center">
            Sign in to rate this tool
          </p>
        )}
      </CardContent>
    </Card>
  );
};

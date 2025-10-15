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
      .eq("user_identifier", userId)
      .maybeSingle();
    
    if (data) {
      setUserRating(data);
      setRating(data.rating);
      setComment(data.comment || "");
    }
  };

  const fetchRatings = async () => {
    // Use the secure function to get aggregate stats without exposing individual data
    const { data, error } = await supabase
      .rpc('get_tool_rating_stats', { tool_path_param: toolPath });

    if (data && data.length > 0 && data[0].total_ratings > 0) {
      setAvgRating(parseFloat(data[0].avg_rating.toString()) || 0);
      setTotalRatings(Number(data[0].total_ratings) || 0);
    }
  };

  const submitRating = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    // Get user identifier for tracking
    let userIdentifier = user?.id;
    
    if (!userIdentifier) {
      // Use localStorage to create a persistent anonymous ID for tracking
      let anonId = localStorage.getItem('toolmaster_anon_id');
      if (!anonId) {
        anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('toolmaster_anon_id', anonId);
      }
      userIdentifier = anonId;
    }

    // First check if rating exists
    const { data: existing } = await supabase
      .from("tool_ratings")
      .select("id")
      .eq("tool_path", toolPath)
      .eq("user_identifier", userIdentifier)
      .maybeSingle();

    let error;
    if (existing) {
      // Update existing rating
      const result = await supabase
        .from("tool_ratings")
        .update({
          rating,
          comment: comment.trim() || null,
        })
        .eq("id", existing.id);
      error = result.error;
    } else {
      // Insert new rating - use NULL for anonymous users
      const result = await supabase
        .from("tool_ratings")
        .insert({
          tool_path: toolPath,
          user_identifier: userIdentifier,
          user_id: user?.id || null, // NULL for anonymous users
          rating,
          comment: comment.trim() || null,
        });
      error = result.error;
    }

    if (error) {
      console.error('Rating error:', error);
      toast.error("Failed to submit rating");
    } else {
      toast.success("Rating submitted successfully!");
      setRating(0);
      setComment("");
      fetchRatings();
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

        <Textarea
          placeholder="Share your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button onClick={submitRating} className="w-full">
          Submit Rating
        </Button>
      </CardContent>
    </Card>
  );
};

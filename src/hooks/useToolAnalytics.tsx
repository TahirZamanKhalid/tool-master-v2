import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useToolAnalytics = (toolPath: string) => {
  useEffect(() => {
    const trackView = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Only track for authenticated users (required by RLS policy)
      if (user) {
        await supabase.from("tool_views").insert({
          tool_path: toolPath,
          user_id: user.id,
        });
      }
    };

    trackView();
  }, [toolPath]);
};

export const trackSearch = async (query: string) => {
  if (!query.trim()) return;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Only track for authenticated users (required by RLS policy)
  if (user) {
    await supabase.from("search_analytics").insert({
      search_query: query.toLowerCase().trim(),
      user_id: user.id,
    });
  }
};

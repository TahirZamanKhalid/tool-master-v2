import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve persistent session ID for anonymous tracking
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
};

export const useToolAnalytics = (toolPath: string) => {
  useEffect(() => {
    const trackView = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Track for both authenticated and anonymous users
      await supabase.from("tool_views").insert({
        tool_path: toolPath,
        user_id: user?.id || null,
        session_id: getSessionId(),
      });
    };

    trackView();
  }, [toolPath]);
};

export const trackSearch = async (query: string) => {
  if (!query.trim()) return;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // Track for both authenticated and anonymous users
  await supabase.from("search_analytics").insert({
    search_query: query.toLowerCase().trim(),
    user_id: user?.id || null,
    session_id: getSessionId(),
  });
};

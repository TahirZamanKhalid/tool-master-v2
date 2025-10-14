import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HeaderProps {
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

export const Header = ({ searchQuery = "", onSearch }: HeaderProps) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    // Check current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between gap-2 sm:gap-4 px-4">
        <div className="flex items-center gap-2 min-w-0 flex-shrink cursor-pointer" onClick={() => navigate("/")}>
          <div className="gradient-primary h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex-shrink-0 flex items-center justify-center shadow-card">
            <span className="text-white font-black text-lg sm:text-xl tracking-tight">TM</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold truncate bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ToolMaster Pro
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">100+ Free Tools</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1 sm:gap-2 px-2 sm:px-4">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          ) : null}

          <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-lg flex-shrink-0">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

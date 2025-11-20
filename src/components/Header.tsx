import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    // Default to light mode
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove("dark");
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 shadow-card animate-fade-in-down">
      <div className="container flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4 px-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink cursor-pointer group" onClick={() => navigate("/")}>
          <div className="gradient-primary h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex-shrink-0 flex items-center justify-center shadow-card group-hover:shadow-card-hover transition-smooth group-hover:scale-110 animate-bounce-in">
            <span className="text-white font-black text-lg sm:text-xl tracking-tight">TM</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold truncate text-gradient animate-gradient-x">
              ToolMaster Pro
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">100+ Free Tools</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="rounded-lg flex-shrink-0 hover:scale-110 transition-bounce hover:shadow-card relative group"
          >
            {isDark ? (
              <Sun className="h-5 w-5 group-hover:animate-wiggle" />
            ) : (
              <Moon className="h-5 w-5 group-hover:animate-wiggle" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

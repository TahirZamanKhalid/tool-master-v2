import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="rounded-lg flex-shrink-0"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

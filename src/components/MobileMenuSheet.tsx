import { Moon, Sun, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { AppTheme } from "@/utils/theme";

interface MobileMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navLinks: Array<{ name: string; path: string }>;
  isActive: (path: string) => boolean;
  theme: AppTheme;
  toggleTheme: () => void;
}

const MobileMenuSheet = ({
  open,
  onOpenChange,
  navLinks,
  isActive,
  theme,
  toggleTheme,
}: MobileMenuSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-[280px] p-0 border-border/60">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-xs">
              TM
            </div>
            <span className="font-black text-foreground">ToolMasterPro</span>
          </div>
        </div>

        <nav className="flex flex-col p-4 gap-1 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => onOpenChange(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                isActive(link.path)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border/60 space-y-3">
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
            <Link to="/tools" onClick={() => onOpenChange(false)}>
              <Wrench className="mr-2 h-4 w-4" />
              Browse All Tools
            </Link>
          </Button>
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-muted-foreground">Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-sm font-medium text-foreground bg-muted/60 px-3 py-1.5 rounded-lg"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
);

export default MobileMenuSheet;

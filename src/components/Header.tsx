import { Menu, Wrench, Sun, Moon, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const stored = localStorage.getItem("theme");
    return stored === "light" ? "light" : "dark";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "midnight", "forest", "sunset");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const navLinks = [
    { name: "Tools", path: "/tools" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/95 backdrop-blur-xl shadow-sm"
          : "bg-background/80 backdrop-blur-md"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">

        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          onClick={() => navigate("/")}
        >
          <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-md group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary" />
            <div className="absolute inset-0 flex items-center justify-center text-white font-black text-sm tracking-tighter">
              TM
            </div>
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-[18px] font-black tracking-tight text-foreground">
              ToolMaster<span className="text-primary">Pro</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">150+ Free Tools</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isActive(link.path)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* CTA Button (desktop) */}
          <Button
            onClick={() => navigate("/tools")}
            className="hidden md:flex h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Wrench className="mr-2 h-3.5 w-3.5" />
            Browse Tools
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="md:hidden h-9 w-9 rounded-xl"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0 border-border/60">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-xs">
                      TM
                    </div>
                    <span className="font-black text-foreground">ToolMasterPro</span>
                  </div>
                </div>

                {/* Mobile Links */}
                <nav className="flex flex-col p-4 gap-1 flex-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => { navigate(link.path); setMobileOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                        isActive(link.path)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      {link.name}
                    </button>
                  ))}
                </nav>

                {/* Mobile Bottom */}
                <div className="p-4 border-t border-border/60 space-y-3">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                    onClick={() => { navigate("/tools"); setMobileOpen(false); }}
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    Browse All Tools
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
        </div>
      </div>
    </header>
  );
};

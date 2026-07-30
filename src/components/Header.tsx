import { Menu, Wrench, Sun, Moon, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lazy, Suspense, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { applyTheme, getInitialTheme, saveThemePreference, type AppTheme } from "@/utils/theme";

const MobileMenuSheet = lazy(() => import("@/components/MobileMenuSheet"));

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<AppTheme>(() => getInitialTheme());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close search on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
      setSearchOpen(false);
    }
  };

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      saveThemePreference(next);
      return next;
    });
  };

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
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto gap-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 cursor-pointer group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
          aria-label="ToolMaster Pro home"
        >
          <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-md group-hover:shadow-primary/30 transition-transform duration-300 group-hover:scale-105">
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
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                isActive(link.path)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        {/* Search bar (desktop inline) */}
        <div className="hidden lg:flex flex-1 max-w-xs">
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="w-full animate-fade-in-down">
              <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-muted/60 border border-border/60 focus-within:border-primary/50 transition-colors">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search 150+ tools…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                />
                <kbd className="text-[10px] text-muted-foreground/50 font-mono">ESC</kbd>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 h-9 px-3 rounded-xl bg-muted/40 border border-border/40 hover:border-primary/30 hover:bg-muted/60 transition-all text-sm text-muted-foreground/70 group"
              aria-label="Search tools"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left">Search tools…</span>
              <kbd className="hidden xl:inline-block text-[10px] px-1.5 py-0.5 rounded bg-border/60 text-muted-foreground font-mono">⌘K</kbd>
            </button>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">

          {/* Live badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
            <Zap className="h-3 w-3" />
            150+ Free
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* CTA Button (desktop) */}
          <Button
            asChild
            className="hidden md:flex h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/25 transition-[background-color,box-shadow,transform] hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            <Link to="/tools">
              <Wrench className="mr-2 h-3.5 w-3.5" />
              Browse Tools
            </Link>
          </Button>

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="md:hidden h-9 w-9 rounded-xl"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {mobileOpen && (
            <Suspense fallback={null}>
              <MobileMenuSheet
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                navLinks={navLinks}
                isActive={isActive}
                theme={theme}
                toggleTheme={toggleTheme}
              />
            </Suspense>
          )}
        </div>
      </div>
    </header>
  );
};

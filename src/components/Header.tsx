import { Menu, Wrench, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themes = [
  { name: "Dark", value: "dark", color: "bg-slate-900" },
  { name: "Light", value: "light", color: "bg-white" },
  { name: "Midnight", value: "midnight", color: "bg-[#0b0f19]" },
  { name: "Forest", value: "forest", color: "bg-[#0a1a10]" },
  { name: "Sunset", value: "sunset", color: "bg-[#1a0e0a]" },
];

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove all theme classes
    root.classList.remove("light", "dark", "midnight", "forest", "sunset");
    // Add current theme class
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const navLinks = [
    { name: "All Tools", path: "/tools" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo Area */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-lg group-hover:shadow-primary/25 transition-all duration-300 group-hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary animate-gradient-xy"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white font-black text-lg tracking-tighter">
              TM
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-xl font-bold tracking-tight text-foreground">
              ToolMaster
              <span className="text-primary ml-1">Pro</span>
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                }`}
            >
              {link.name}
            </button>
          ))}

          <div className="h-6 w-px bg-border/50 mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Change Color Theme" variant="outline" size="icon" className="rounded-full border-primary/20 bg-background/50 hover:bg-primary/10 hover:text-primary transition-colors">
                <Palette className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2 bg-popover border-border shadow-xl rounded-xl z-50">
              {themes.map((t) => (
                <DropdownMenuItem
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-accent focus:bg-accent focus:text-accent-foreground transition-colors"
                >
                  <div className={`h-4 w-4 rounded-full border border-white/20 shadow-sm ${t.color}`} />
                  <span className="font-medium text-popover-foreground">{t.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => navigate("/tools")}
            className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
          >
            <Wrench className="mr-2 h-4 w-4" />
            Get Started
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Change Color Theme" variant="ghost" size="icon" className="rounded-full">
                <Palette className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {themes.map((t) => (
                <DropdownMenuItem
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className="flex items-center gap-2"
                >
                  <div className={`h-3 w-3 rounded-full border ${t.color}`} />
                  {t.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button aria-label="Toggle Navigation Menu" variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 py-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    TM
                  </div>
                  <span className="font-bold text-xl">ToolMaster Pro</span>
                </div>

                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Button
                      key={link.path}
                      variant="ghost"
                      className="justify-start text-lg font-medium"
                      onClick={() => navigate(link.path)}
                    >
                      {link.name}
                    </Button>
                  ))}
                  <Button
                    className="mt-4 bg-primary text-white"
                    onClick={() => navigate("/tools")}
                  >
                    Browse All Tools
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

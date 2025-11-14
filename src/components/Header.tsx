import { Moon, Sun, Sparkles, Search, Menu, X, Zap, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LazyAdSpace } from "./LazyAdSpace";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return true;
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Apply dark theme immediately if no preference is saved
    const saved = localStorage.getItem("theme");
    if (!saved) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toolCategories = [
    { name: "AI & Content", path: "/category/ai-content", icon: "✨", color: "from-blue-500 to-purple-600" },
    { name: "Image Tools", path: "/category/image-tools", icon: "🖼️", color: "from-pink-500 to-rose-600" },
    { name: "Developer Tools", path: "/category/developer-tools", icon: "💻", color: "from-green-500 to-emerald-600" },
    { name: "PDF Tools", path: "/category/pdf-tools", icon: "📄", color: "from-orange-500 to-red-600" },
    { name: "Text Tools", path: "/category/text-tools", icon: "📝", color: "from-indigo-500 to-blue-600" },
    { name: "Video Tools", path: "/category/video-tools", icon: "🎥", color: "from-purple-500 to-indigo-600" },
    { name: "SEO & Marketing", path: "/category/seo-marketing", icon: "📈", color: "from-violet-500 to-purple-600" },
    { name: "Calculators", path: "/category/calculators", icon: "🧮", color: "from-cyan-500 to-blue-600" },
    { name: "Security Tools", path: "/category/security-tools", icon: "🔒", color: "from-red-500 to-orange-600" },
    { name: "File Converters", path: "/category/file-converters", icon: "🔄", color: "from-amber-500 to-orange-600" },
    { name: "QR & Barcodes", path: "/category/qr-barcodes", icon: "📱", color: "from-emerald-500 to-teal-600" },
  ];

  const popularTools = [
    { name: "AI Chat", path: "/tools/ai-chat" },
    { name: "Background Remover", path: "/tools/background-remover" },
    { name: "Image Compressor", path: "/tools/image-compressor" },
    { name: "QR Code Generator", path: "/tools/qr-code-generator" },
    { name: "Password Generator", path: "/tools/password-generator" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="h-10 w-10 bg-muted rounded-xl animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            isDark
              ? "from-slate-950 via-blue-950/20 to-purple-950/30"
              : "from-blue-50/50 via-purple-50/30 to-cyan-50/50"
          } transition-all duration-1000`}
        />

        {/* Animated floating shapes */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary/20 rounded-full animate-float-1"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-accent/15 rounded-full animate-float-2"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-primary/25 rounded-full animate-float-3"></div>
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-accent/20 rounded-full animate-float-4"></div>

        {/* Grid pattern */}
        <div
          className={`absolute inset-0 bg-[linear-gradient(${
            isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
          }_1px,transparent_1px),linear-gradient(90deg,${
            isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
          }_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]`}
        ></div>
      </div>

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? "border-b bg-background/95 backdrop-blur-xl shadow-lg shadow-black/5"
            : "border-b bg-background/80 backdrop-blur-lg"
        }`}
      >
        <div className="container flex h-16 sm:h-20 items-center justify-between gap-4 px-4">
          {/* Logo Section */}
          <div
            className="flex items-center gap-3 min-w-0 flex-shrink cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <div className="gradient-primary h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
                <Wrench className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                <div className="absolute -top-1 -right-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black truncate bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  ToolMaster Pro
                </h1>
                <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">100+ Free Tools</p>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((star) => (
                    <div key={star} className="text-yellow-400 text-xs">
                      ★
                    </div>
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">4.9</span>
                </div>
              </div>
            </div>
          </div>


          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search 100+ tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full bg-background/50 backdrop-blur border-muted/50 focus:border-primary/50 transition-all"
              />
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Search Button - Mobile */}
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)} className="md:hidden rounded-xl">
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="rounded-xl relative overflow-hidden group"
            >
              <div className="relative z-10">
                {isDark ? (
                  <Sun className="h-5 w-5 group-hover:rotate-45 transition-transform duration-500" />
                ) : (
                  <Moon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-500" />
                )}
              </div>
              <div
                className={`absolute inset-0 bg-gradient-to-r ${
                  isDark ? "from-orange-400/20 to-yellow-400/20" : "from-blue-400/20 to-purple-400/20"
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
            </Button>

            {/* Mobile Menu - Always visible */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="gradient-primary h-12 w-12 rounded-xl flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">ToolMaster Pro</h2>
                      <p className="text-sm text-muted-foreground">100+ Free Tools</p>
                    </div>
                  </div>

                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-full"
                    />
                  </form>

                  {/* Mobile Navigation */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Categories</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {toolCategories.map((category) => (
                          <div
                            key={category.name}
                            onClick={() => navigate(category.path)}
                            className={`p-3 rounded-xl bg-gradient-to-r ${category.color} text-white cursor-pointer transition-transform hover:scale-105`}
                          >
                            <div className="text-2xl mb-1">{category.icon}</div>
                            <div className="font-semibold text-sm">{category.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Popular Tools</h3>
                      <div className="space-y-2">
                        {popularTools.map((tool) => (
                          <div
                            key={tool.name}
                            onClick={() => navigate(tool.path)}
                            className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-all hover:translate-x-1"
                          >
                            {tool.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {showSearch && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg animate-in fade-in-0">
            <div className="container pt-20 px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Search Tools</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowSearch(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <form onSubmit={handleSearch} className="relative mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="What tool are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg rounded-2xl border-2"
                  autoFocus
                />
              </form>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quick Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {toolCategories.map((category) => (
                    <div
                      key={category.name}
                      onClick={() => {
                        navigate(category.path);
                        setShowSearch(false);
                      }}
                      className="p-4 rounded-xl border-2 hover:border-primary cursor-pointer transition-all hover:scale-105"
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="font-semibold">{category.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Sticky Header Ad Banner */}
      <div
        className={`sticky top-16 sm:top-20 z-40 w-full bg-background/95 backdrop-blur-xl border-b py-2 transition-all duration-500 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container px-4">
          <div className="flex justify-center">
            <LazyAdSpace type="display" slot="8907016752" className="w-full max-w-[728px]" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(10px) translateY(-15px); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(-5px) rotate(90deg); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 8s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 10s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 12s ease-in-out infinite; }
        .animate-gradient { animation: gradient 3s ease infinite; background-size: 200% auto; }
      `}</style>
    </>
  );
};

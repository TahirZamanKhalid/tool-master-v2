import { Search, Sparkles, Zap, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, memo } from "react";

interface HeroProps {
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

const TrendingPill = memo(({ term, onClick }: { term: string; onClick: (term: string) => void }) => (
  <button
    onClick={() => onClick(term)}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border/60 bg-card/60 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/8 transition-all duration-200 backdrop-blur-sm"
  >
    {term}
  </button>
));
TrendingPill.displayName = "TrendingPill";

const StatBadge = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/50 backdrop-blur-sm text-sm text-muted-foreground font-medium">
    <Icon className="h-4 w-4 text-primary shrink-0" />
    <span>{label}</span>
  </div>
);

export const OptimizedHero = memo(({ searchQuery = "", onSearch }: HeroProps) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(localSearch);
  };

  const handleTrendingClick = (term: string) => {
    import("@/data/allTools").then(({ allTools }) => {
      const tool = allTools.find(t =>
        t.title.toLowerCase().includes(term.toLowerCase()) ||
        term.toLowerCase().includes(t.title.toLowerCase().replace("free online ", ""))
      );
      if (tool) {
        window.location.href = tool.path;
      } else {
        onSearch?.(term.toLowerCase());
      }
    });
  };

  const trendingTerms = [
    "Background Remover",
    "PDF Merger",
    "Image Compressor",
    "QR Generator",
    "AI Essay Writer",
    "JSON Formatter",
    "Video Trimmer",
    "Password Generator",
  ];

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 -z-20 gradient-hero animate-gradient-xy" />
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-accent/6 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-secondary/4 rounded-full blur-3xl" />
      </div>

      <div className="container py-20 md:py-28 px-4 max-w-5xl mx-auto relative z-10">
        <div className="text-center space-y-8">

          {/* Top badge */}
          <div className="flex justify-center animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              150+ Free Professional Tools — No Sign-up Required
            </div>
          </div>

          {/* Main heading */}
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
              <span className="text-gradient">One Platform.</span>
              <br />
              <span className="text-foreground">Every Tool You Need.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Image editing, PDF tools, AI writing, developer utilities, calculators — all free, all in your browser, all instant.
            </p>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto max-w-2xl w-full animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="relative flex items-center gap-2 p-1.5 bg-card/80 backdrop-blur-xl border border-border/70 rounded-2xl shadow-card-hover focus-within:border-primary/50 focus-within:shadow-glow transition-all duration-300">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  aria-label="Search tools"
                  placeholder="Search 150+ tools… try 'PDF', 'QR', 'calculator'"
                  className="h-12 pl-12 pr-4 bg-transparent border-0 ring-0 focus-visible:ring-0 text-sm font-medium placeholder:text-muted-foreground/60"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 shrink-0"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Trending pills */}
          <div className="flex flex-wrap justify-center gap-2 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <span className="self-center text-xs font-bold text-primary uppercase tracking-wider">🔥 Popular:</span>
            {trendingTerms.map((term) => (
              <TrendingPill key={term} term={term} onClick={handleTrendingClick} />
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-2 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
            <StatBadge icon={Zap} label="Instant & Free" />
            <StatBadge icon={Shield} label="Privacy First — Runs in Browser" />
            <StatBadge icon={Sparkles} label="150+ Tools & Growing" />
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
});

OptimizedHero.displayName = "OptimizedHero";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, memo } from "react";

interface HeroProps {
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

const TrendingButton = memo(({ term, onClick }: { term: string; onClick: (term: string) => void }) => (
  <Button
    variant="outline"
    size="sm"
    className="h-7 sm:h-8 text-xs sm:text-sm px-3 sm:px-4 hover:gradient-primary hover:text-white hover:border-transparent transition-bounce shadow-card hover:shadow-card-hover hover:scale-110 animate-fade-in font-semibold"
    onClick={() => onClick(term)}
  >
    {term}
  </Button>
));

TrendingButton.displayName = "TrendingButton";

export const OptimizedHero = memo(({ searchQuery = "", onSearch }: HeroProps) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    // Don't trigger search on input - only on button click
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger search only when button is clicked
    onSearch?.(localSearch);
  };

  const handleTrendingClick = (term: string) => {
    onSearch?.(term.toLowerCase());
  };

  const trendingTerms = [
    "Background Remover",
    "PDF Merger",
    "Image size Reducer",
    "QR Generator",
    "AI Blog Writer",
    "JSON Formatter",
    "Video Trimmer"
  ];

  return (
    <section className="relative overflow-hidden w-full">
      <div className="gradient-hero absolute inset-0 -z-10 animate-gradient-xy"></div>
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      <div className="container py-16 md:py-24 px-4 relative z-10">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight break-words animate-fade-in-up">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient-x">
              100+ Free AI-Powered Tools
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground break-words animate-fade-in-up font-semibold" style={{ animationDelay: '0.1s' }}>
            ✨ Instant Access, No Signup Required ✨
          </p>

          <form onSubmit={handleSearchSubmit} className="mx-auto max-w-2xl w-full px-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse-slow" />
                <Input
                  placeholder="Search 100+ tools..."
                  className="h-12 sm:h-14 pl-10 sm:pl-12 pr-2 text-sm sm:text-base shadow-card-hover hover:shadow-glow border-2 border-primary/20 hover:border-primary/40 w-full transition-smooth focus:scale-105 font-medium"
                  value={localSearch}
                  onChange={handleSearchChange}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="gradient-primary border-0 h-12 sm:h-14 px-4 sm:px-6 whitespace-nowrap shadow-card hover:shadow-card-hover transition-bounce hover:scale-110 font-bold shimmer-effect"
              >
                Search →
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-muted-foreground px-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <span className="self-center font-semibold text-gradient">🔥 Trending:</span>
            {trendingTerms.map((term, index) => (
              <TrendingButton key={term} term={term} onClick={handleTrendingClick} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

OptimizedHero.displayName = "OptimizedHero";

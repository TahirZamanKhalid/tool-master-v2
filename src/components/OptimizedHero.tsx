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
    className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 border-primary/30 hover:bg-primary/10 hover:border-primary transition-smooth rounded-lg"
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

  const trendingTerms = ["Background Remover", "QR Generator", "PDF Merger", "AI Chat"];

  return (
    <section className="relative overflow-hidden w-full bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6TTAgMTZjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHptMCA0MGMwLTQuNDE4IDMuNTgyLTggOC04czggMy41ODIgOCA4LTMuNTgyIDgtOCA4LTgtMy41ODItOC04em0zNiAwYzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      
      <div className="container py-16 md:py-24 px-4 relative">
        <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight break-words bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-scale-in">
              100+ Free AI-Powered Tools
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground break-words">
              Instant Access, No Signup Required ✨
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-muted-foreground px-2">
            <span className="self-center font-medium">Trending:</span>
            {trendingTerms.map((term) => (
              <TrendingButton key={term} term={term} onClick={handleTrendingClick} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

OptimizedHero.displayName = "OptimizedHero";

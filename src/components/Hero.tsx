import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface HeroProps {
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

export const Hero = ({ searchQuery = "", onSearch }: HeroProps) => {
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
  return (
    <section className="relative overflow-hidden w-full">
      <div className="gradient-hero absolute inset-0 -z-10"></div>
      <div className="container py-16 md:py-24 px-4">
        <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight break-words">
            100+ Free Online Tools for Every Task
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground break-words">
            AI-Powered Web Tools - Instant Access, No Registration Required
          </p>

          <form onSubmit={handleSearchSubmit} className="mx-auto max-w-2xl w-full px-2">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  className="h-12 sm:h-14 pl-10 sm:pl-12 pr-2 text-sm sm:text-base shadow-card-hover border-2 w-full"
                  value={localSearch}
                  onChange={handleSearchChange}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="gradient-primary border-0 h-12 sm:h-14 px-4 sm:px-6 whitespace-nowrap"
              >
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-muted-foreground px-2">
            <span className="self-center">Trending:</span>
            {["Background Remover", "QR Generator", "PDF Merger", "Image Editor"].map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                onClick={() => handleTrendingClick(term)}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

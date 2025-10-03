import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdSpace } from "./AdSpace";
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
    onSearch?.(value); // Live search on every keystroke
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleTrendingClick = (term: string) => {
    onSearch?.(term.toLowerCase());
  };
  return (
    <section className="relative overflow-hidden">
      <div className="gradient-hero absolute inset-0 -z-10"></div>
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            100+ Free AI-Powered Tools
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Instant Access, No Signup Required
          </p>
          
          <form onSubmit={handleSearchSubmit} className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search 100+ tools... Try 'background remover' or 'QR code'"
                className="h-14 pl-12 text-base shadow-card-hover border-2"
                value={localSearch}
                onChange={handleSearchChange}
              />
              <Button 
                type="submit"
                size="lg" 
                className="absolute right-2 top-1/2 -translate-y-1/2 gradient-primary border-0"
              >
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <span>Trending:</span>
            {["Background Remover", "QR Generator", "PDF Merger", "AI Chat"].map((term) => (
              <Button 
                key={term} 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => handleTrendingClick(term)}
              >
                {term}
              </Button>
            ))}
          </div>

          {/* Ad in Hero section */}
          <div className="pt-8">
            <AdSpace size="leaderboard" />
          </div>
        </div>
      </div>
    </section>
  );
};

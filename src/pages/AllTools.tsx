import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { SEOHead } from "@/components/SEOHead";
import { AdSpace } from "@/components/AdSpace";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { allTools } from "@/data/allTools";

const AllTools = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredTools = allTools.filter(
    (tool) =>
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase()) ||
      tool.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <SEOHead
        title="All Tools - Complete Collection | ToolMaster Pro"
        description="Browse all 100+ free online tools in one place. Find developer tools, image editors, PDF utilities, calculators, converters, and more."
        keywords="all tools, online tools, free tools, web utilities, developer tools"
      />
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              All Tools
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Browse all {allTools.length} free online tools
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  placeholder="Search tools..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-full border-2 focus:border-primary focus:ring-4 focus:ring-primary/20 shadow-lg"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <AdSpace size="leaderboard" className="mb-12" />

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
              {search && ` for "${search}"`}
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool, index) => (
              <div 
                key={index} 
                onClick={() => navigate(tool.path)}
                className="transform transition-all hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <ToolCard {...tool} />
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredTools.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-block p-6 bg-muted rounded-full mb-4">
                <svg
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No tools found</h3>
              <p className="text-muted-foreground">
                Try a different search term or browse our categories
              </p>
            </div>
          )}

          <AdSpace size="leaderboard" className="mt-12" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllTools;

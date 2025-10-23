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
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="All Tools - Complete Collection"
        description="Browse all our free online tools in one place"
        keywords="all tools, online tools, free tools"
      />
      <Header />
      <main className="flex-1 py-12 container">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">All Tools</h1>
          <p className="text-muted-foreground mb-6">Browse all {allTools.length} tools</p>
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md mx-auto"
          />
        </div>

        <AdSpace size="leaderboard" className="mb-8" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool, index) => (
            <div key={index} onClick={() => navigate(tool.path)}>
              <ToolCard {...tool} />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllTools;

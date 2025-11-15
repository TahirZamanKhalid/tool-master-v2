import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { SEOHead } from "@/components/SEOHead";
import { AdSpace } from "@/components/AdSpace";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { allTools } from "@/data/allTools";
import { LazyAdSpace } from "@/components/LazyAdSpace";
import { AdRow } from "@/components/AdRow";
import { getDisplayAdSlot, getAdIndex } from "@/utils/adSlotRotation";

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
        <div className="flex gap-6">
          {/* Left Sidebar Ad */}
          <div className="hidden xl:block flex-shrink-0" style={{ width: "160px", maxWidth: "160px" }}>
            <div style={{ maxHeight: "600px", overflow: "hidden" }}>
              <LazyAdSpace 
                type="display" 
                slot={getDisplayAdSlot(getAdIndex('sidebar-left'))}
                position="sidebar-left"
                className="w-full"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
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

            <div className="mb-8">
              <LazyAdSpace type="display" slot={getDisplayAdSlot(getAdIndex('top'))} className="w-full" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map((tool, index) => (
                <div key={index} onClick={() => navigate(tool.path)}>
                  <ToolCard {...tool} />
                </div>
              ))}
            </div>

            <div className="mt-12">
              <AdRow type="display" count={3} position="bottom" />
            </div>
          </div>

          {/* Right Sidebar Ad */}
          <div className="hidden xl:block flex-shrink-0" style={{ width: "160px", maxWidth: "160px" }}>
            <div style={{ maxHeight: "600px", overflow: "hidden" }}>
              <LazyAdSpace 
                type="display" 
                slot={getDisplayAdSlot(getAdIndex('sidebar-right'))}
                position="sidebar-right"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllTools;

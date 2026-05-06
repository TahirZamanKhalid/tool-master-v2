import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdRow } from "@/components/AdRow";
import { SidebarAd } from "@/components/SidebarAd";
import { useState, useMemo, useEffect } from "react";
import { allTools } from "@/data/allTools";
import { Search, Sparkles, Filter, X } from "lucide-react";

const AllTools = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [selectedCat, setSelectedCat] = useState(params.get("category") || "");

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (search) newParams.set("q", search);
    if (selectedCat) newParams.set("category", selectedCat);
    setParams(newParams, { replace: true });
  }, [search, selectedCat, setParams]);

  const allCategories = useMemo(() => {
    const cats = Array.from(new Set(allTools.map((t) => t.category))).sort();
    return cats;
  }, []);

  const filteredTools = useMemo(() => {
    return allTools.filter((t) => {
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !selectedCat || t.category === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCat]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCat("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="All Free Online Tools — 150+ Browser-Based Utilities | ToolMaster Pro"
        description="Browse all 150+ free online tools. Search and filter by category — image, PDF, video, AI, calculator, developer tools and more. No signup required, 100% free."
        keywords="all online tools, free tools list, browse online tools, web utilities, free web tools, browser tools, no signup tools, online toolbox, free image tools, free PDF tools, free video tools, free AI tools, free calculators, free developer tools, free SEO tools, free text tools, free QR code generator, free password generator, free background remover, free PDF merger, free word counter, free JSON formatter"
        canonical="https://toolmaster.cloud/tools"
        breadcrumbs={[
          { name: "Home", url: "https://toolmaster.cloud/" },
          { name: "All Tools", url: "https://toolmaster.cloud/tools" },
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": "https://toolmaster.cloud/tools",
          name: "All Free Online Tools — ToolMaster Pro",
          description: "Complete collection of 150+ free browser-based online tools. Image editors, PDF utilities, AI writing tools, calculators, developer utilities and more.",
          url: "https://toolmaster.cloud/tools",
          isPartOf: { "@id": "https://toolmaster.cloud/#website" },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://toolmaster.cloud/" },
              { "@type": "ListItem", position: 2, name: "All Tools", item: "https://toolmaster.cloud/tools" },
            ],
          },
        }}
      />
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 gradient-hero animate-gradient-xy" />
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <Breadcrumbs items={[{ label: "All Tools", current: true }]} />

          <div className="text-center max-w-3xl mx-auto mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              {allTools.length} TOOLS · 15 CATEGORIES · 100% FREE
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-3">
              Every Free Tool, <span className="text-gradient">In One Place</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Search across {allTools.length} browser-based tools. No signup, no fees, instant results.
            </p>

            {/* Search */}
            <div className="mt-6 max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search tools by name, category, or function..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 pl-12 pr-4 bg-card border-border/60 focus:border-primary/50 rounded-2xl shadow-card text-base"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        {/* Top Banner Ad */}
        <div className="mb-6">
          <AdRow slot="9769564871" />
        </div>

        {/* Layout: Filter Sidebar + Tools Grid + Ad Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] xl:grid-cols-[200px_1fr_300px] gap-6">

          {/* Left: Category Filter */}
          <aside className="lg:block">
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Filter className="h-4 w-4" />
                    Filter
                  </span>
                  {(selectedCat || search) && (
                    <button
                      onClick={clearFilters}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap lg:flex-col gap-1.5">
                  <button
                    onClick={() => setSelectedCat("")}
                    className={`text-left text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                      !selectedCat
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    All Categories <span className="opacity-60">({allTools.length})</span>
                  </button>
                  {allCategories.map((cat) => {
                    const count = allTools.filter((t) => t.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCat(cat === selectedCat ? "" : cat)}
                        className={`text-left text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                          selectedCat === cat
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        {cat} <span className="opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Center: Tools Grid */}
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-bold text-foreground">{filteredTools.length}</span> of {allTools.length} tools
                {selectedCat && (
                  <> in <span className="font-bold text-foreground">{selectedCat}</span></>
                )}
                {search && (
                  <> matching "<span className="font-bold text-foreground">{search}</span>"</>
                )}
              </p>
            </div>

            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTools.map((tool, index) => {
                  const showAdAfter = (index + 1) % 9 === 0 && index < filteredTools.length - 1;
                  return (
                    <div key={tool.path} className="contents">
                      <div
                        className="animate-fade-in-up cursor-pointer"
                        style={{ animationDelay: `${(index % 12) * 0.03}s` }}
                        onClick={() => tool.path && navigate(tool.path)}
                      >
                        <ToolCard {...tool} />
                      </div>
                      {showAdAfter && (
                        <div className="col-span-1 sm:col-span-2 xl:col-span-3">
                          <AdRow slot="2127993591" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-xl font-bold text-foreground mb-2">No tools found</p>
                <p className="text-muted-foreground mb-4">Try a different search or clear your filters</p>
                <button
                  onClick={clearFilters}
                  className="text-primary hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Right Sticky Ad Sidebar */}
          <aside className="hidden xl:block">
            <div className="sticky top-20 space-y-4">
              <div className="ad-container-sidebar w-full">
                <SidebarAd slot="5628599414" position="right" index={1} width={300} height={600} />
              </div>
              <div className="ad-container w-full min-h-[250px]">
                <SidebarAd slot="7110517063" position="right" index={2} width={300} height={250} />
              </div>
            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllTools;

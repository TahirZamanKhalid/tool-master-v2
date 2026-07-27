import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { SEOHead } from "@/components/SEOHead";
import { ToolAdSidebar } from "@/components/ToolAdSidebar";
import { SidebarAd } from "@/components/SidebarAd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { allTools } from "@/data/allTools";
import { useState, useMemo } from "react";
import {
  Sparkles, Image, FileText, Calculator, QrCode, Video,
  TrendingUp, Code, Shield, Dices, ArrowRightLeft,
  Receipt, Hash, Brain, Type, Search, ArrowLeft, Wrench,
  type LucideIcon,
} from "lucide-react";

const categoryMap: Record<string, string> = {
  "ai-content": "AI & Content",
  "image-tools": "Image Tools",
  "developer-tools": "Developer Tools",
  "qr-barcodes": "QR & Barcodes",
  "pdf-tools": "PDF Tools",
  "text-tools": "Text Tools",
  "video-tools": "Video Tools",
  "seo-marketing": "SEO & Marketing",
  calculators: "Calculators",
  "security-tools": "Security Tools",
  utilities: "Utilities",
  "file-converters": "File Converters",
  "business-tools": "Business Tools",
  "social-media": "Social Media",
  generators: "Generators",
};

const categoryMeta: Record<string, { icon: LucideIcon; gradient: string; tagline: string }> = {
  "AI & Content": { icon: Sparkles, gradient: "from-blue-500 to-purple-600", tagline: "AI-powered writing, chatbots, and content generation tools" },
  "Image Tools": { icon: Image, gradient: "from-pink-500 to-rose-600", tagline: "Edit, compress, convert and transform images instantly" },
  "Developer Tools": { icon: Code, gradient: "from-green-500 to-emerald-600", tagline: "JSON, formatters, validators, and web dev utilities" },
  "QR & Barcodes": { icon: QrCode, gradient: "from-emerald-500 to-teal-600", tagline: "Generate and scan QR codes & barcodes online" },
  "PDF Tools": { icon: FileText, gradient: "from-orange-500 to-red-600", tagline: "Merge, split, compress and convert PDF documents" },
  "Text Tools": { icon: Type, gradient: "from-indigo-500 to-blue-600", tagline: "Word counter, case converter, and text manipulation" },
  "Video Tools": { icon: Video, gradient: "from-purple-500 to-indigo-600", tagline: "Edit, compress, trim and convert videos in your browser" },
  "SEO & Marketing": { icon: TrendingUp, gradient: "from-violet-500 to-purple-600", tagline: "Meta tags, sitemaps, keywords and marketing utilities" },
  "Calculators": { icon: Calculator, gradient: "from-cyan-500 to-blue-600", tagline: "Finance, health, math and everyday calculations" },
  "Security Tools": { icon: Shield, gradient: "from-red-500 to-orange-600", tagline: "Password generators, validators and encryption tools" },
  "Utilities": { icon: Dices, gradient: "from-fuchsia-500 to-pink-600", tagline: "Random generators, timers, stopwatches and more" },
  "File Converters": { icon: ArrowRightLeft, gradient: "from-amber-500 to-orange-600", tagline: "Convert between every file format you need" },
  "Business Tools": { icon: Receipt, gradient: "from-teal-500 to-cyan-600", tagline: "Invoices, business names and professional utilities" },
  "Social Media": { icon: Hash, gradient: "from-rose-500 to-pink-600", tagline: "Hashtags, bios, captions and social content tools" },
  "Generators": { icon: Brain, gradient: "from-lime-500 to-green-600", tagline: "Random data, names, domains and creative generators" },
};

const CategoryTools = () => {
  const { category } = useParams();
  const [search, setSearch] = useState("");

  const decodedCategory = categoryMap[category || ""] || "";
  const meta = categoryMeta[decodedCategory] || { icon: Wrench, gradient: "from-primary to-accent", tagline: "Browse tools" };
  const Icon = meta.icon;

  const categoryTools = useMemo(
    () =>
      allTools
        .filter((tool) => tool.category === decodedCategory)
        .filter(
          (t) =>
            !search ||
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase())
        ),
    [decodedCategory, search]
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`${decodedCategory} — Free Online ${decodedCategory} Tools | ToolMaster Pro`}
        description={`Browse ${categoryTools.length}+ free ${decodedCategory.toLowerCase()} tools. ${meta.tagline}. No signup, browser-based, instant results. 100% free forever.`}
        keywords={`${decodedCategory.toLowerCase()}, free ${decodedCategory.toLowerCase()} tools, online ${decodedCategory.toLowerCase()}, best ${decodedCategory.toLowerCase()} tools, ${decodedCategory.toLowerCase()} online, free ${decodedCategory.toLowerCase()} online, browser-based ${decodedCategory.toLowerCase()}, no signup ${decodedCategory.toLowerCase()}`}
        canonical={`https://toolmaster.cloud/category/${category}`}
        breadcrumbs={[
          { name: "Home", url: "https://toolmaster.cloud/" },
          { name: "All Tools", url: "https://toolmaster.cloud/tools" },
          { name: decodedCategory, url: `https://toolmaster.cloud/category/${category}` },
        ]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `https://toolmaster.cloud/category/${category}`,
            name: `Free ${decodedCategory} Tools — ToolMaster Pro`,
            description: `${categoryTools.length}+ free ${decodedCategory.toLowerCase()} tools. ${meta.tagline}`,
            url: `https://toolmaster.cloud/category/${category}`,
            isPartOf: { "@id": "https://toolmaster.cloud/#website" },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://toolmaster.cloud/" },
                { "@type": "ListItem", position: 2, name: "All Tools", item: "https://toolmaster.cloud/tools" },
                { "@type": "ListItem", position: 3, name: decodedCategory, item: `https://toolmaster.cloud/category/${category}` },
              ],
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Free ${decodedCategory} Tools`,
            description: meta.tagline,
            numberOfItems: categoryTools.length,
            itemListElement: categoryTools.slice(0, 20).map((tool, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: tool.title,
              url: `https://toolmaster.cloud${tool.path}`,
              description: tool.description,
            })),
          },
        ]}
      />
      <Header />

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 gradient-hero animate-gradient-xy" />
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className={`absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br ${meta.gradient} opacity-10 rounded-full blur-3xl`} />
        </div>

        <div className="container max-w-7xl mx-auto px-4 py-12">
          <Breadcrumbs items={[
            { label: "All Tools", path: "/tools" },
            { label: decodedCategory, current: true },
          ]} />

          <div className="flex flex-col md:flex-row md:items-center gap-6 mt-6">
            <div className={`shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {categoryTools.length} {categoryTools.length === 1 ? "tool" : "tools"} available
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-2">
                {decodedCategory}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
                {meta.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        {/* Layout: left ad rail, tools, right ad rail and category navigation */}
        <div className="flex gap-4">
          <ToolAdSidebar side="left" />

          {/* Left: Search + Tools */}
          <div className="min-w-0 flex-1">
            {/* Search */}
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={`Search ${decodedCategory} tools...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-11 bg-card border-border/60 focus:border-primary/50 rounded-xl"
              />
            </div>

            {categoryTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTools.map((tool, index) => (
                  <div
                    key={tool.path}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <ToolCard {...tool} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-xl font-bold text-foreground mb-2">
                  {search ? "No matches found" : "No tools in this category yet"}
                </p>
                <p className="text-muted-foreground mb-4">
                  {search ? "Try a different keyword" : "Check back soon — we add tools regularly"}
                </p>
                {search ? (
                  <Button variant="outline" onClick={() => setSearch("")}>Clear Search</Button>
                ) : (
                  <Button asChild>
                    <Link to="/tools">Browse All Tools</Link>
                  </Button>
                )}
              </div>
            )}

          </div>

          {/* Right Sticky Sidebar */}
          <aside className="hidden w-[300px] shrink-0 xl:block">
            <div className="sticky top-20 space-y-4">
              <div className="ad-container-sidebar w-full">
                <SidebarAd slot="4351073152" position="right" index={1} width={300} height={600} />
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-5">
                <p className="text-sm font-bold text-primary mb-1">💡 Pro Tip</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All {decodedCategory.toLowerCase()} run entirely in your browser. Your files never leave your device.
                </p>
              </div>

              <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card">
                <p className="text-sm font-bold text-foreground mb-3">Other Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(categoryMap)
                    .filter(([slug]) => slug !== category)
                    .slice(0, 8)
                    .map(([slug, name]) => (
                      <Link
                        key={slug}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border/40 transition-all"
                        to={`/category/${slug}`}
                      >
                        {name}
                      </Link>
                    ))}
                </div>
                <Button
                  asChild
                  className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm"
                >
                  <Link to="/tools">View All Tools</Link>
                </Button>
              </div>
            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryTools;

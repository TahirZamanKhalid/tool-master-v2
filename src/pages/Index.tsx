import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OptimizedHero } from "@/components/OptimizedHero";
import { CategoryCard } from "@/components/CategoryCard";
import { ToolCard } from "@/components/ToolCard";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { SEOHead } from "@/components/SEOHead";
import { AdRow } from "@/components/AdRow";
import { InFeedAd } from "@/components/InFeedAd";
import { useState, useEffect, useMemo } from "react";
import { allTools } from "@/data/allTools";
import { ArrowRight, CheckCircle, Zap, Shield, Globe, Star } from "lucide-react";
import {
  Sparkles, Image, FileText, Calculator, QrCode, Video,
  TrendingUp, Code, Shield as ShieldIcon, Dices, ArrowRightLeft,
  Receipt, Hash, Brain, Type
} from "lucide-react";

const categories = [
  { icon: Sparkles, title: "AI & Content", description: "AI-powered writing, chatbots, and text generation", toolCount: 8, color: "from-blue-500 to-purple-600" },
  { icon: Image, title: "Image Tools", description: "Image editor, compressor, converter & background remover", toolCount: 16, color: "from-pink-500 to-rose-600" },
  { icon: Code, title: "Developer Tools", description: "JSON formatters, code beautifiers & web dev utilities", toolCount: 21, color: "from-green-500 to-emerald-600" },
  { icon: QrCode, title: "QR & Barcodes", description: "QR code generator, barcode creator and scanner tools", toolCount: 5, color: "from-emerald-500 to-teal-600" },
  { icon: FileText, title: "PDF Tools", description: "PDF merger, splitter, compressor and converter", toolCount: 6, color: "from-orange-500 to-red-600" },
  { icon: Type, title: "Text Tools", description: "Word counter, case converter and string manipulation", toolCount: 23, color: "from-indigo-500 to-blue-600" },
  { icon: Video, title: "Video Tools", description: "Video editor, compressor, trimmer and converter", toolCount: 6, color: "from-purple-500 to-indigo-600" },
  { icon: TrendingUp, title: "SEO & Marketing", description: "Meta tags, sitemaps and marketing utilities", toolCount: 18, color: "from-violet-500 to-purple-600" },
  { icon: Calculator, title: "Calculators", description: "BMI, loan, percentage, compound interest & more", toolCount: 23, color: "from-cyan-500 to-blue-600" },
  { icon: ShieldIcon, title: "Security Tools", description: "Password generator, strength checker & encryption", toolCount: 4, color: "from-red-500 to-orange-600" },
  { icon: Dices, title: "Utilities", description: "Random number generator, timer, stopwatch & more", toolCount: 9, color: "from-fuchsia-500 to-pink-600" },
  { icon: ArrowRightLeft, title: "File Converters", description: "Excel↔CSV, image format conversions & PDF", toolCount: 8, color: "from-amber-500 to-orange-600" },
  { icon: Receipt, title: "Business Tools", description: "Invoice generator and professional business utilities", toolCount: 2, color: "from-teal-500 to-cyan-600" },
  { icon: Hash, title: "Social Media", description: "Hashtag generator, bio maker & YouTube tools", toolCount: 3, color: "from-rose-500 to-pink-600" },
  { icon: Brain, title: "Generators", description: "Business names, domains, fake data & more", toolCount: 8, color: "from-lime-500 to-green-600" },
];

const categorySlugMap: Record<string, string> = {
  "AI & Content": "ai-content",
  "Image Tools": "image-tools",
  "Developer Tools": "developer-tools",
  "QR & Barcodes": "qr-barcodes",
  "PDF Tools": "pdf-tools",
  "Text Tools": "text-tools",
  "Video Tools": "video-tools",
  "SEO & Marketing": "seo-marketing",
  "Calculators": "calculators",
  "Security Tools": "security-tools",
  "Utilities": "utilities",
  "File Converters": "file-converters",
  "Business Tools": "business-tools",
  "Social Media": "social-media",
  "Generators": "generators",
};

const stats = [
  { value: "150+", label: "Free Tools", icon: Zap },
  { value: "1M+", label: "Monthly Users", icon: Globe },
  { value: "10M+", label: "Files Processed", icon: CheckCircle },
  { value: "4.9★", label: "User Rating", icon: Star },
];

const whyUs = [
  "No registration or email required for any tool",
  "Privacy-first: All processing happens in your browser",
  "Ultra-fast — works great on mobile and desktop",
  "150+ tools across 15+ specialized categories",
  "100% free with no hidden paywalls",
];

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    setSearchParams(params);
    setTimeout(() => {
      document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleButtonSearch = (query: string) => {
    const directMatch = allTools.find(
      (t) =>
        t.title.toLowerCase() === query.toLowerCase() ||
        t.title.toLowerCase().replace("free online ", "") === query.toLowerCase()
    );
    if (directMatch) { navigate(directMatch.path); return; }
    setSearchQuery(query);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    setSearchParams(params);
    if (query) {
      setTimeout(() => {
        document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleCategoryFilter = (category: string) => {
    const newCat = category === selectedCategory ? "" : category;
    setSelectedCategory(newCat);
    setSearchQuery("");
    const params = new URLSearchParams();
    if (newCat) params.set("category", newCat);
    setSearchParams(params);
    if (newCat) {
      setTimeout(() => {
        document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const filteredTools = useMemo(() => {
    const filtered = allTools.filter((tool) => {
      const matchesSearch =
        !searchQuery ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    if (!searchQuery && !selectedCategory) {
      const popular = filtered.filter((t) => t.popular);
      const others = filtered.filter((t) => !t.popular);
      return [...popular, ...others].slice(0, 12);
    }
    return filtered;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <SEOHead
        title="ToolMaster Pro — 150+ Free Online Tools | No Registration Required"
        description="Access 150+ free online tools. Background remover, PDF merger, image compressor, QR generator, AI writing tools, calculators & more. No signup, browser-based, secure."
        keywords="free online tools, web tools, browser tools, no registration, no signup tools, PDF tools, image tools, text converters, calculators, developer tools, online utilities, AI tools, free tools no download, online toolbox, web utilities, productivity tools, free image compressor, free PDF merger, free QR code generator, JSON formatter, background remover online, password generator, hash generator, color picker"
        canonical="https://toolmaster.cloud/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://toolmaster.cloud/#website",
            url: "https://toolmaster.cloud/",
            name: "ToolMaster Pro",
            alternateName: "ToolMaster Pro - Free Online Tools",
            description: "150+ free online tools — image, PDF, video, AI, developer, calculators and more. No signup required.",
            inLanguage: "en-US",
            publisher: { "@id": "https://toolmaster.cloud/#organization" },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://toolmaster.cloud/#organization",
            name: "ToolMaster Pro",
            url: "https://toolmaster.cloud/",
            logo: {
              "@type": "ImageObject",
              url: "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/uploads/1759510903222-toolmasterpro logo.jpeg",
              width: 512,
              height: 512,
            },
            sameAs: [
              "https://twitter.com/ToolMasterPro",
              "https://www.facebook.com/ToolMasterPro",
              "https://www.linkedin.com/company/toolmasterpro",
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Most Popular Free Online Tools",
            description: "Top free tools on ToolMaster Pro",
            numberOfItems: 12,
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Background Remover", url: "https://toolmaster.cloud/tools/background-remover" },
              { "@type": "ListItem", position: 2, name: "PDF Merger", url: "https://toolmaster.cloud/tools/pdf-merger" },
              { "@type": "ListItem", position: 3, name: "QR Code Generator", url: "https://toolmaster.cloud/tools/qr-code-generator" },
              { "@type": "ListItem", position: 4, name: "Image Size Reducer", url: "https://toolmaster.cloud/tools/image-size-reducer" },
              { "@type": "ListItem", position: 5, name: "JSON Formatter", url: "https://toolmaster.cloud/tools/json-formatter" },
              { "@type": "ListItem", position: 6, name: "Password Generator", url: "https://toolmaster.cloud/tools/password-generator" },
              { "@type": "ListItem", position: 7, name: "Word Counter", url: "https://toolmaster.cloud/tools/word-counter" },
              { "@type": "ListItem", position: 8, name: "Color Picker", url: "https://toolmaster.cloud/tools/color-picker" },
              { "@type": "ListItem", position: 9, name: "Essay Writer", url: "https://toolmaster.cloud/tools/essay-writer" },
              { "@type": "ListItem", position: 10, name: "Blog Writer", url: "https://toolmaster.cloud/tools/blog-article-writer" },
              { "@type": "ListItem", position: 11, name: "Image Editor", url: "https://toolmaster.cloud/tools/advanced-image-editor" },
              { "@type": "ListItem", position: 12, name: "Watermark Tool", url: "https://toolmaster.cloud/tools/watermark-tool" },
            ],
          },
        ]}
      />
      <Header />

      <main>
        {/* Hero */}
        <OptimizedHero searchQuery={searchQuery} onSearch={handleButtonSearch} />

        {/* Stats Bar */}
        <div className="border-y border-border/40 bg-muted/20">
          <div className="container max-w-5xl mx-auto px-4 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-2xl md:text-3xl font-black text-gradient">{value}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <section className="py-16 px-4">
          <div className="container max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-4xl font-black mb-3 text-foreground">
                Browse Tools by Category
              </h2>
              <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                15 categories covering every workflow — from image editing to AI writing to developer utilities.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {categories.map((category, index) => (
                <div
                  key={category.title}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.04}s` }}
                  onClick={() => navigate(`/category/${categorySlugMap[category.title]}`)}
                >
                  <CategoryCard {...category} isSelected={false} comingSoon={false} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ad Row after categories */}
        <div className="container max-w-5xl mx-auto px-4 mb-8">
          <AdRow />
        </div>

        {!searchQuery && !selectedCategory && <HowItWorks />}

        {/* Popular / Search Results Section */}
        <section id="tools-section" className="py-12 px-4">
          <div className="container max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground">
                  {searchQuery || selectedCategory ? "Search Results" : "Most Popular Tools"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || selectedCategory
                    ? `${filteredTools.length} tool${filteredTools.length !== 1 ? "s" : ""} found — all free, no signup`
                    : "Trusted by developers, designers & students worldwide"}
                </p>
              </div>
              {!searchQuery && !selectedCategory && (
                <button
                  onClick={() => navigate("/tools")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0"
                >
                  View All Tools <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {selectedCategory && (
              <div className="mb-6 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing: <span className="font-semibold text-foreground">{selectedCategory}</span>
                </span>
                <button
                  onClick={() => handleCategoryFilter("")}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Clear
                </button>
              </div>
            )}

            {filteredTools.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTools.map((tool, index) => {
                  const showAdAfter = (index + 1) % 8 === 0 && index < filteredTools.length - 1;
                  return (
                    <div key={tool.path} className="contents">
                      <div
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.04}s` }}
                        onClick={() => tool.path && navigate(tool.path)}
                      >
                        <ToolCard {...tool} />
                      </div>
                      {showAdAfter && (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
                          <AdRow slot="2127993591" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
                <p className="text-xl font-bold text-foreground mb-2">No tools found</p>
                <p className="text-muted-foreground mb-4">Try a different search term</p>
                <button
                  onClick={() => { handleSearch(""); handleCategoryFilter(""); }}
                  className="text-primary hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Ad Banner */}
        <div className="container max-w-5xl mx-auto px-4 mb-8">
          <AdRow slot="1212397554" />
        </div>

        {/* Why ToolMasterPro */}
        <section className="py-16 px-4 bg-muted/20 border-y border-border/40">
          <div className="container max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                  Professional Tools.<br />
                  <span className="text-gradient">Completely Free.</span>
                </h2>
                <p className="text-muted-foreground text-base leading-relaxed">
                  ToolMasterPro was built with one mission — give everyone instant access to professional-grade tools without logins, fees, or friction. Everything runs in your browser for maximum speed and privacy.
                </p>
                <button
                  onClick={() => navigate("/tools")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  Explore All Tools <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-card">
                <h3 className="font-bold text-lg text-foreground mb-4">Why users love us</h3>
                <ul className="space-y-3">
                  {whyUs.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQ />
      </main>

      <Footer />
    </div>
  );
};

export default Index;

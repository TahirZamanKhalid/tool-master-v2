import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OptimizedHero } from "@/components/OptimizedHero";
import { CategoryCard } from "@/components/CategoryCard";
import { ToolCard } from "@/components/ToolCard";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { SEOHead } from "@/components/SEOHead";
import { trackSearch } from "@/hooks/useToolAnalytics";
import { AdRow } from "@/components/AdRow";
import { useState, useEffect, useMemo } from "react";
import { allTools } from "@/data/allTools";
import {
  Sparkles,
  Image,
  FileText,
  Calculator,
  QrCode,
  Video,
  TrendingUp,
  Code,
  Shield,
  Dices,
  ArrowRightLeft,
  Receipt,
  Hash,
  Brain,
  Type
} from "lucide-react";

const categories = [
  {
    icon: Sparkles,
    title: "AI & Content",
    description: "AI-powered content writing tools, chatbots, and text generation utilities",
    toolCount: 8,
    color: "from-blue-500 to-purple-600",
  },
  {
    icon: Image,
    title: "Image Tools",
    description: "Free online image editor, compressor, converter, and background remover tools",
    toolCount: 16,
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Code,
    title: "Developer Tools",
    description: "API testing, code formatters, JSON validators, and web development utilities",
    toolCount: 21,
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: QrCode,
    title: "QR & Barcodes",
    description: "Free QR code generator, barcode creator, and scanner tools online",
    toolCount: 5,
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "PDF Tools",
    description: "Online PDF merger, splitter, compressor, and converter - no download",
    toolCount: 6,
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Type,
    title: "Text Tools",
    description: "Word counter, case converter, text formatter, and string manipulation tools",
    toolCount: 23,
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: Video,
    title: "Video Tools",
    description: "Online video editor, compressor, merger, and watermark tools - free",
    toolCount: 6,
    color: "from-purple-500 to-indigo-600",
  },
  {
    icon: TrendingUp,
    title: "SEO & Marketing",
    description: "SEO tools, meta tag generator, sitemap creator, and marketing utilities",
    toolCount: 18,
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Calculator,
    title: "Calculators",
    description: "Free online calculators: percentage, BMI, loan, tip, compound interest, and more",
    toolCount: 23,
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Shield,
    title: "Security Tools",
    description: "Password generator, strength checker, and encryption tools online",
    toolCount: 4,
    color: "from-red-500 to-orange-600",
  },
  {
    icon: Dices,
    title: "Utilities",
    description: "Random number generator, timer, stopwatch, and utility tools",
    toolCount: 9,
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    icon: ArrowRightLeft,
    title: "File Converters",
    description: "Free file converter: Excel to CSV, image format converter, PDF converter",
    toolCount: 8,
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Receipt,
    title: "Business Tools",
    description: "Invoice generator, business name creator, and professional utilities",
    toolCount: 2,
    color: "from-teal-500 to-cyan-600",
  },
  {
    icon: Hash,
    title: "Social Media",
    description: "Hashtag generator, Instagram bio maker, YouTube title generator tools",
    toolCount: 3,
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Brain,
    title: "Generators",
    description: "Business name generator, domain name creator, fake data, and more",
    toolCount: 8,
    color: "from-lime-500 to-green-600",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    setSearchQuery(q);
    setSelectedCategory(category);
  }, [searchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    setSearchParams(params);

    // Track search analytics
    if (query.length >= 3) {
      trackSearch(query);
      // Scroll to search results when user searches
      setTimeout(() => {
        document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  // Button-triggered search handler
  const handleButtonSearch = (query: string) => {
    // Check for direct match first
    const directMatch = allTools.find(t =>
      t.title.toLowerCase() === query.toLowerCase() ||
      t.title.toLowerCase().replace("free online ", "") === query.toLowerCase()
    );

    if (directMatch) {
      navigate(directMatch.path);
      return;
    }

    setSearchQuery(query);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    setSearchParams(params);

    // Track search analytics
    if (query.length >= 3) {
      trackSearch(query);
    }

    // Scroll to search results when user searches
    if (query) {
      setTimeout(() => {
        document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleCategoryFilter = (category: string) => {
    const newCategory = category === selectedCategory ? "" : category;
    setSelectedCategory(newCategory);
    setSearchQuery(""); // Clear search when selecting category
    const params = new URLSearchParams();
    if (newCategory) params.set("category", newCategory);
    setSearchParams(params);

    // Scroll to search results section
    if (newCategory) {
      setTimeout(() => {
        document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  // Count tools per category
  const getToolCountByCategory = (categoryName: string) => {
    return allTools.filter(tool => tool.category === categoryName).length;
  };

  const filteredTools = useMemo(() => {
    const filtered = allTools.filter((tool) => {
      const matchesSearch = !searchQuery ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Show only 12 most popular tools when no search/filter is active
    if (!searchQuery && !selectedCategory) {
      // Get tools marked as popular first, then fill with others up to 12
      const popularFirst = filtered.filter(t => t.popular);
      const others = filtered.filter(t => !t.popular);
      return [...popularFirst, ...others].slice(0, 12);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleToolClick = (path: string) => {
    if (!path) return;
    navigate(path);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <SEOHead
        title="ToolMaster Pro - 100+ Free Online Tools | No Registration Required"
        description="Access 100+ free online tools. Background remover, PDF merger, Image Size Reducer, QR generator, calculators & more. No signup, browser-based, secure."
        keywords="free online tools, web tools, browser tools, no registration, PDF tools, image tools, text converters, calculators, developer tools, online utilities, free web apps"
        canonical="https://toolmaster.cloud"
      />
      <Header />


      <main>
        <OptimizedHero searchQuery={searchQuery} onSearch={handleButtonSearch} />

        {/* Categories Section */}
        <section className="py-16 container w-full overflow-hidden px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 break-words">Browse Free Online Tools by Category</h2>
            <p className="text-muted-foreground text-base sm:text-lg break-words">
              Explore our comprehensive collection of free web-based tools and utilities. No registration required, instant access to 100+ professional-grade online tools.
            </p>
          </div>

          {/* Categories Grid - Full width */}
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {categories.map((category, index) => {
                // Create URL-friendly slugs
                const categorySlug: Record<string, string> = {
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
                  "Generators": "generators"
                };

                return (
                  <div
                    key={index}
                    className="animate-scale-in cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => navigate(`/category/${categorySlug[category.title]}`)}
                  >
                    <CategoryCard
                      {...category}
                      toolCount={category.toolCount}
                      isSelected={false}
                      comingSoon={false}
                    />
                  </div>
                );
              })}
            </div>

            {selectedCategory && (
              <div className="text-center mb-8">
                <p className="text-lg text-muted-foreground">
                  Showing tools in <span className="font-semibold text-foreground">{selectedCategory}</span>
                  <button
                    onClick={() => handleCategoryFilter("")}
                    className="ml-2 text-primary hover:underline"
                  >
                    Clear filter
                  </button>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Ad Row after Categories */}
        <div className="container">
          <AdRow />
        </div>

        {!searchQuery && !selectedCategory && <HowItWorks />}

        {/* Popular Tools Section */}
        <section id="tools-section" className="py-16 container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {searchQuery || selectedCategory ? "Search Results" : "Most Popular Free Online Tools"}
            </h2>
            <p className="text-muted-foreground text-lg mb-4">
              {searchQuery || selectedCategory
                ? `Found ${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''} - All free, no signup required`
                : "Trusted by thousands of developers, designers, and content creators worldwide"
              }
            </p>
            {!searchQuery && !selectedCategory && (
              <button
                onClick={() => navigate("/tools")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold"
              >
                View All Tools
              </button>
            )}
          </div>

          {filteredTools.length > 0 ? (
            <>
              {/* Tools Grid - Full width */}
              <div className="max-w-6xl mx-auto">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTools.map((tool, index) => {
                    // Insert ad after every 8 tools
                    const showAdAfter = (index + 1) % 8 === 0 && index < filteredTools.length - 1;

                    return (
                      <>
                        <div
                          key={index}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                          onClick={() => handleToolClick(tool.path)}
                        >
                          <ToolCard {...tool} />
                        </div>
                      </>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-4">No tools found matching your search</p>
              <button
                onClick={() => {
                  handleSearch("");
                  handleCategoryFilter("");
                }}
                className="text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Why Choose Our Free Online Tools?</h2>
              <p className="text-muted-foreground">Trusted by professionals worldwide for fast, secure, and reliable results</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              <div className="animate-fade-in p-6 rounded-lg bg-card/50 backdrop-blur shadow-card hover:shadow-card-hover transition-smooth">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    100+
                  </span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">Free Tools</p>
              </div>
              <div className="animate-fade-in p-6 rounded-lg bg-card/50 backdrop-blur shadow-card hover:shadow-card-hover transition-smooth" style={{ animationDelay: "0.1s" }}>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    1M+
                  </span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">Monthly Users</p>
              </div>
              <div className="animate-fade-in p-6 rounded-lg bg-card/50 backdrop-blur shadow-card hover:shadow-card-hover transition-smooth" style={{ animationDelay: "0.2s" }}>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    10M+
                  </span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">Files Processed</p>
              </div>
              <div className="animate-fade-in p-6 rounded-lg bg-card/50 backdrop-blur shadow-card hover:shadow-card-hover transition-smooth" style={{ animationDelay: "0.3s" }}>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    100%
                  </span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">Free Forever</p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-20 bg-background border-t border-b border-white/5">
          <div className="container max-w-5xl px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-black leading-tight">Master Your Workflow with <span className="text-primary italic">Professional</span> Results</h2>
                <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    In today's fast-paced digital world, efficiency is everything. ToolMaster Pro was built with one simple mission: to provide every professional, student, and developer with instant access to high-quality, <strong>privacy-first web tools</strong> without the friction of logins or subscriptions.
                  </p>
                  <p>
                    Whether you're looking to <span className="text-foreground font-semibold">remove photo backgrounds</span>, merge complex PDF documents, or format messy JSON data with our developer suite, our tools run entirely in your browser. This means your data never leaves your device, ensuring maximum security and speed.
                  </p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-card/80 backdrop-blur-xl border-white/10 p-8 rounded-2xl shadow-2xl">
                  <h3 className="text-xl font-bold mb-4">Why users love ToolMaster Pro</h3>
                  <ul className="space-y-4">
                    {[
                      "No registration or email required for any tool",
                      "Privacy-first: All processing happens in your browser",
                      "Ultra-fast performance on mobile and desktop",
                      "Over 100+ tools across 15+ specialized categories",
                      "100% free with no hidden premium gated features"
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                        <span className="text-muted-foreground text-base">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-16 text-center text-muted-foreground leading-relaxed">
              <p className="max-w-3xl mx-auto">
                From the <strong>Image size Reducer</strong> that helps you optimize your web presence to our <strong>AI content generators</strong> that spark creativity, every utility in our library is designed for clarity and ease of use. Stop wrestling with bloated software and start using ToolMaster Pro—the ultimate digital utility belt for the modern web.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />
      </main>

      <Footer />
    </div>
  );
};

export default Index;

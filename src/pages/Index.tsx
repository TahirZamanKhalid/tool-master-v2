import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OptimizedHero } from "@/components/OptimizedHero";
import { CategoryCard } from "@/components/CategoryCard";
import { ToolCard } from "@/components/ToolCard";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { LazyAdSpace } from "@/components/LazyAdSpace";
import { AdSpace } from "@/components/AdSpace";
import { AdRow } from "@/components/AdRow";
import { SEOHead } from "@/components/SEOHead";
import { trackSearch } from "@/hooks/useToolAnalytics";
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
    description: "AI-powered writing, chatbots, and content generation",
    toolCount: 8,
    color: "from-blue-500 to-purple-600",
  },
  {
    icon: Image,
    title: "Image Tools",
    description: "Edit, compress, convert, and enhance images",
    toolCount: 16,
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Code,
    title: "Developer Tools",
    description: "API testing, formatters, and development utilities",
    toolCount: 21,
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: QrCode,
    title: "QR & Barcodes",
    description: "Generate and customize QR codes and barcodes",
    toolCount: 5,
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "PDF Tools",
    description: "Merge, split, compress, and convert PDFs",
    toolCount: 6,
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Type,
    title: "Text Tools",
    description: "Word counter, case converter, and more",
    toolCount: 23,
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: Video,
    title: "Premium Video Tools",
    description: "Professional video editing, compression, merging, and watermarking",
    toolCount: 6,
    color: "from-purple-500 to-indigo-600",
  },
  {
    icon: TrendingUp,
    title: "SEO & Marketing",
    description: "Meta tags, sitemaps, and SEO optimization",
    toolCount: 18,
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Calculator,
    title: "Calculators",
    description: "Percentage, BMI, loan, tip, compound interest, and more",
    toolCount: 23,
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Shield,
    title: "Security Tools",
    description: "Password generators and validators",
    toolCount: 4,
    color: "from-red-500 to-orange-600",
  },
  {
    icon: Dices,
    title: "Utilities",
    description: "Random generators, timers, and more",
    toolCount: 9,
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    icon: ArrowRightLeft,
    title: "File Converters",
    description: "Convert files between formats (Excel, CSV, images, PDFs)",
    toolCount: 8,
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Receipt,
    title: "Business Tools",
    description: "Invoice generation and business utilities",
    toolCount: 2,
    color: "from-teal-500 to-cyan-600",
  },
  {
    icon: Sparkles,
    title: "Premium Plus",
    description: "Enhanced tools with advanced features and analytics",
    toolCount: 5,
    color: "from-yellow-500 to-amber-600",
  },
  {
    icon: Hash,
    title: "Social Media",
    description: "Hashtag generator, Instagram bio, YouTube titles",
    toolCount: 3,
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Brain,
    title: "Generators",
    description: "Business names, domains, fake data, and more",
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
        title="ToolMaster Pro"
        description="Access 100+ free online tools for developers, designers, and content creators. No signup required. Image tools, text converters, calculators, and more."
        keywords="free online tools, developer tools, image tools, text tools, converters, calculators, no signup"
        canonical="https://toolmaster.cloud"
      />
      <Header />


      <OptimizedHero searchQuery={searchQuery} onSearch={handleButtonSearch} />

      {/* Categories Section */}
      <section className="py-16 container w-full overflow-hidden px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 break-words">Browse by Category</h2>
          <p className="text-muted-foreground text-base sm:text-lg break-words">
            Explore our comprehensive collection of free online tools
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
              "Premium Video Tools": "video-tools",
              "SEO & Marketing": "seo-marketing",
              "Calculators": "calculators",
              "Security Tools": "security-tools",
              "Utilities": "utilities",
              "File Converters": "file-converters",
              "Business Tools": "business-tools",
              "Social Media": "social-media",
              "Generators": "generators",
              "Premium Plus": "premium-plus"
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

        {/* Single ad in center after categories */}
        <div className="mt-12 flex justify-center">
          <AdSpace type="display" slot="1212397554" position="content" />
        </div>
      </section>

      {!searchQuery && !selectedCategory && <HowItWorks />}

      {/* Popular Tools Section */}
      <section id="tools-section" className="py-16 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {searchQuery || selectedCategory ? "Search Results" : "Popular Tools"}
          </h2>
          <p className="text-muted-foreground text-lg mb-4">
            {searchQuery || selectedCategory 
              ? `Found ${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''}`
              : "Most used tools by our community"
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
                  
                  {/* Insert in-feed ad after every 8 tools */}
                  {showAdAfter && (
                    <div className="col-span-full my-4">
                      <LazyAdSpace 
                        type="infeed" 
                        slot="4739066253" 
                        layoutKey="-gk-24+14-4r+ke"
                        position="content" 
                        className="mx-auto" 
                      />
                    </div>
                  )}
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

        {/* Single ad at bottom */}
        <div className="mt-12 flex justify-center">
          <AdSpace type="display" slot="2918331088" position="bottom" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
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

      {/* FAQ Section */}
      <FAQ />

      <Footer />
    </div>
  );
};

export default Index;

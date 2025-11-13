import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { ToolCard } from "@/components/ToolCard";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <SEOHead 
        title="Free Online Tools - ToolMaster Pro | 100+ Free Utilities" 
        description="Access 100+ free online tools for developers, designers, and content creators. Image editors, PDF tools, calculators, converters, and more - no signup required."
        keywords="free online tools, web tools, developer tools, image editor, PDF tools, text tools, calculators, converters"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  100+ Free Online Tools
                </span>
                <br />
                <span className="text-foreground">At Your Fingertips</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional tools for developers, designers, and content creators. No signup required, completely free forever.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search for tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleButtonSearch(searchQuery)}
                    className="w-full px-6 py-4 text-lg rounded-full border-2 border-border bg-background/80 backdrop-blur focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none shadow-lg group-hover:shadow-glow"
                  />
                  <Button
                    onClick={() => handleButtonSearch(searchQuery)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-md"
                  >
                    Search
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">100+</div>
                  <div className="text-sm text-muted-foreground">Free Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">1M+</div>
                  <div className="text-sm text-muted-foreground">Monthly Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">100%</div>
                  <div className="text-sm text-muted-foreground">Free Forever</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Categories Section */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Browse by Category
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose from our extensive collection of professional tools organized by category
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category, index) => (
                <div
                  key={index}
                  onClick={() => handleCategoryFilter(category.title)}
                  className="cursor-pointer transform transition-transform hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CategoryCard 
                    icon={category.icon}
                    title={category.title}
                    description={category.description}
                    toolCount={category.toolCount}
                    color={category.color}
                  />
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={() => navigate("/categories")}
                variant="outline"
                size="lg"
                className="hover:bg-accent"
              >
                View All Categories
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Tools Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Featured Tools
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our most popular and powerful tools, loved by millions of users worldwide
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {filteredTools.slice(0, 8).map((tool, index) => (
                <div 
                  key={index} 
                  onClick={() => handleToolClick(tool.path)}
                  className="transform transition-transform hover:scale-105 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ToolCard {...tool} />
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate("/tools")}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg hover:shadow-glow"
              >
                View All {allTools.length} Tools
              </Button>
            </div>
          </div>
        </section>

        <HowItWorks />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
};

export default Index;

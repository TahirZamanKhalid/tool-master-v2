import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import { ToolCard } from "@/components/ToolCard";
import { HowItWorks } from "@/components/HowItWorks";
import { AdSpace } from "@/components/AdSpace";
import { SEOHead } from "@/components/SEOHead";
import { trackSearch } from "@/hooks/useToolAnalytics";
import { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Image,
  FileText,
  Calculator,
  QrCode,
  Video,
  TrendingUp,
  Code,
  MessageSquare,
  Eraser,
  FileDown,
  Type,
  DollarSign,
  Palette,
  Brain,
  Zap,
  Instagram,
  Link2,
  Hash,
  Key,
  FileCode,
  AlignLeft,
  Clock,
  GitCompare,
  Regex,
  Wand2,
  Scale,
  Percent,
  Activity,
  Crop,
  Laugh,
  FileSpreadsheet,
  FileJson,
  Database,
  Globe,
  Shield,
  FileImage,
  Paintbrush,
  Link,
  Dices,
  Timer,
  Calendar,
} from "lucide-react";

const categories = [
  {
    icon: Sparkles,
    title: "AI & Content",
    description: "AI-powered writing, chatbots, and content generation",
    toolCount: 18,
    color: "from-blue-500 to-purple-600",
  },
  {
    icon: Image,
    title: "Image Tools",
    description: "Edit, compress, convert, and enhance images",
    toolCount: 25,
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: QrCode,
    title: "QR & Barcodes",
    description: "Generate and customize QR codes and barcodes",
    toolCount: 8,
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "PDF Tools",
    description: "Merge, split, compress, and convert PDFs",
    toolCount: 15,
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Type,
    title: "Text Tools",
    description: "Word counter, case converter, and more",
    toolCount: 20,
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "SEO & Marketing",
    description: "Meta tags, sitemaps, and SEO optimization",
    toolCount: 12,
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Calculator,
    title: "Calculators",
    description: "Percentage, BMI, loan, and more calculators",
    toolCount: 15,
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Video,
    title: "Video & Audio",
    description: "Compress, convert, and edit media files",
    toolCount: 10,
    color: "from-fuchsia-500 to-pink-600",
  },
];

const popularTools = [
  {
    icon: MessageSquare,
    title: "AI Chatbot",
    description: "Chat with AI assistant powered by advanced language models",
    category: "AI & Content",
    popular: true,
    comingSoon: true,
  },
  {
    icon: Eraser,
    title: "Background Remover",
    description: "Remove image backgrounds instantly with AI",
    category: "Image Tools",
    popular: true,
  },
  {
    icon: QrCode,
    title: "QR Code Generator",
    description: "Create custom QR codes with logos and colors",
    category: "QR & Barcodes",
    popular: true,
  },
  {
    icon: FileDown,
    title: "PDF Merger",
    description: "Combine multiple PDFs into a single document",
    category: "PDF Tools",
    popular: true,
  },
  {
    icon: Type,
    title: "Word Counter",
    description: "Count words, characters, and analyze text",
    category: "Text Tools",
  },
  {
    icon: Image,
    title: "Image Compressor",
    description: "Reduce image file size without losing quality",
    category: "Image Tools",
  },
  {
    icon: DollarSign,
    title: "Currency Converter",
    description: "Convert between 20+ world currencies",
    category: "Calculators",
  },
  {
    icon: Zap,
    title: "Text to Speech",
    description: "Convert text to natural-sounding speech",
    category: "Text Tools",
    comingSoon: true,
  },
  {
    icon: Code,
    title: "JSON Formatter",
    description: "Format and validate JSON data",
    category: "Text Tools",
  },
  {
    icon: Instagram,
    title: "Caption Generator",
    description: "Generate engaging social media captions",
    category: "AI & Content",
    comingSoon: true,
  },
  {
    icon: Palette,
    title: "Color Picker",
    description: "Pick colors and generate palettes",
    category: "Image Tools",
  },
  {
    icon: Brain,
    title: "AI Writing Assistant",
    description: "Improve your writing with AI suggestions",
    category: "AI & Content",
    comingSoon: true,
  },
  {
    icon: Link2,
    title: "URL Encoder",
    description: "Encode and decode URLs safely",
    category: "Text Tools",
  },
  {
    icon: Hash,
    title: "Hash Generator",
    description: "Generate cryptographic hashes",
    category: "Text Tools",
  },
  {
    icon: Key,
    title: "UUID Generator",
    description: "Generate unique identifiers",
    category: "Text Tools",
  },
  {
    icon: Type,
    title: "Case Converter",
    description: "Convert text between different cases",
    category: "Text Tools",
  },
  {
    icon: FileCode,
    title: "Markdown Preview",
    description: "Write and preview markdown in real-time",
    category: "Text Tools",
  },
  {
    icon: Code,
    title: "HTML Encoder",
    description: "Encode or decode HTML entities",
    category: "Text Tools",
  },
  {
    icon: AlignLeft,
    title: "Lorem Ipsum",
    description: "Generate placeholder text",
    category: "Text Tools",
  },
  {
    icon: Clock,
    title: "Timestamp Converter",
    description: "Convert Unix timestamps",
    category: "Text Tools",
  },
  {
    icon: GitCompare,
    title: "Text Diff",
    description: "Compare text differences",
    category: "Text Tools",
  },
  {
    icon: Regex,
    title: "Regex Tester",
    description: "Test regular expressions",
    category: "Text Tools",
  },
  {
    icon: Wand2,
    title: "Code Beautifier",
    description: "Format JSON, HTML, CSS",
    category: "Text Tools",
  },
  {
    icon: Scale,
    title: "Unit Converter",
    description: "Convert units of measurement",
    category: "Calculators",
  },
  {
    icon: Percent,
    title: "Percentage Calculator",
    description: "Calculate percentages",
    category: "Calculators",
  },
  {
    icon: Activity,
    title: "BMI Calculator",
    description: "Calculate Body Mass Index",
    category: "Calculators",
  },
  {
    icon: Image,
    title: "Image Resizer",
    description: "Resize images to custom dimensions",
    category: "Image Tools",
  },
  {
    icon: Crop,
    title: "Image Cropper",
    description: "Crop images to your desired size",
    category: "Image Tools",
  },
  {
    icon: Laugh,
    title: "Meme Generator",
    description: "Create funny memes with custom text",
    category: "Image Tools",
  },
  {
    icon: Type,
    title: "ASCII Art Generator",
    description: "Convert text to ASCII art",
    category: "Text Tools",
  },
  {
    icon: FileSpreadsheet,
    title: "CSV to JSON",
    description: "Convert CSV data to JSON format",
    category: "Developer Tools",
  },
  {
    icon: FileJson,
    title: "JSON to CSV",
    description: "Convert JSON data to CSV format",
    category: "Developer Tools",
  },
  {
    icon: Code,
    title: "XML Formatter",
    description: "Format and beautify XML code",
    category: "Developer Tools",
  },
  {
    icon: FileCode,
    title: "YAML Formatter",
    description: "Format and validate YAML files",
    category: "Developer Tools",
  },
  {
    icon: Database,
    title: "SQL Formatter",
    description: "Format and beautify SQL queries",
    category: "Developer Tools",
  },
  {
    icon: Globe,
    title: "IP Lookup",
    description: "Get location and details of any IP",
    category: "Developer Tools",
  },
  {
    icon: Shield,
    title: "Password Strength",
    description: "Check how strong your password is",
    category: "Security Tools",
  },
  {
    icon: FileImage,
    title: "Base64 Image Encoder",
    description: "Convert images to Base64 strings",
    category: "Developer Tools",
  },
  {
    icon: Palette,
    title: "Color Converter",
    description: "Convert between color formats",
    category: "Image Tools",
  },
  {
    icon: Paintbrush,
    title: "Gradient Generator",
    description: "Create beautiful CSS gradients",
    category: "Image Tools",
  },
  {
    icon: Link,
    title: "Text to Slug",
    description: "Convert text to URL-friendly slugs",
    category: "Text Tools",
  },
  {
    icon: Dices,
    title: "Random Number",
    description: "Generate random numbers",
    category: "Utilities",
  },
  {
    icon: Dices,
    title: "Dice Roller",
    description: "Roll virtual dice",
    category: "Utilities",
  },
  {
    icon: Timer,
    title: "Countdown Timer",
    description: "Set a countdown timer",
    category: "Utilities",
  },
  {
    icon: Clock,
    title: "Stopwatch",
    description: "Precise stopwatch timer",
    category: "Utilities",
  },
  {
    icon: Calendar,
    title: "Age Calculator",
    description: "Calculate your exact age",
    category: "Calculators",
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
    }
  };

  // Live search handler
  const handleLiveSearch = (query: string) => {
    setSearchQuery(query);
    
    // Track search analytics for live searches too
    if (query.length >= 3) {
      trackSearch(query);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (category !== selectedCategory) params.set("category", category);
    setSearchParams(params);
    
    // Scroll to tools section
    document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredTools = useMemo(() => {
    return popularTools.filter((tool) => {
      const matchesSearch = !searchQuery || 
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleToolClick = (path: string, comingSoon?: boolean) => {
    if (comingSoon) {
      return; // Don't navigate if coming soon
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Home - 100+ Free Online Tools"
        description="Access 100+ free online tools for developers, designers, and content creators. No signup required. Image tools, text converters, calculators, and more."
        keywords="free online tools, developer tools, image tools, text tools, converters, calculators, no signup"
      />
      <Header searchQuery={searchQuery} onSearch={handleLiveSearch} />
      
      {/* Top Banner Ad */}
      <div className="container py-4">
        <AdSpace size="banner" />
      </div>

      <Hero searchQuery={searchQuery} onSearch={handleLiveSearch} />

      {/* Categories Section */}
      <section className="py-16 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Category</h2>
          <p className="text-muted-foreground text-lg">
            Explore our comprehensive collection of free online tools
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="animate-scale-in cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleCategoryFilter(category.title)}
            >
              <CategoryCard 
                {...category} 
                isSelected={selectedCategory === category.title}
              />
            </div>
          ))}
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

        {/* Mid-content Ad */}
        <AdSpace size="leaderboard" className="my-8" />
      </section>

      {!searchQuery && !selectedCategory && <HowItWorks />}

      {/* Popular Tools Section */}
      <section id="tools-section" className="py-16 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {searchQuery || selectedCategory ? "Search Results" : "Popular Tools"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {searchQuery || selectedCategory 
              ? `Found ${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''}`
              : "Most used tools by our community"
            }
          </p>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool, index) => {
              const toolPaths: Record<string, string> = {
                "AI Chatbot": "/tools/ai-chatbot",
                "Background Remover": "/tools/background-remover",
                "QR Code Generator": "/tools/qr-code-generator",
                "PDF Merger": "/tools/pdf-merger",
                "Word Counter": "/tools/word-counter",
                "Image Compressor": "/tools/image-compressor",
                "Currency Converter": "/tools/currency-converter",
                "Text to Speech": "/tools/text-to-speech",
                "JSON Formatter": "/tools/json-formatter",
                "Caption Generator": "/tools/caption-generator",
                "Color Picker": "/tools/color-picker",
                "AI Writing Assistant": "/tools/ai-writing",
                "URL Encoder": "/tools/url-encoder",
                "Hash Generator": "/tools/hash-generator",
                "UUID Generator": "/tools/uuid-generator",
                "Case Converter": "/tools/case-converter",
                "Markdown Preview": "/tools/markdown-preview",
                "HTML Encoder": "/tools/html-encoder",
                "Lorem Ipsum": "/tools/lorem-ipsum",
                "Timestamp Converter": "/tools/timestamp-converter",
                "Text Diff": "/tools/text-diff",
                "Regex Tester": "/tools/regex-tester",
                "Code Beautifier": "/tools/code-beautifier",
                "Unit Converter": "/tools/unit-converter",
                "Percentage Calculator": "/tools/percentage-calculator",
                "BMI Calculator": "/tools/bmi-calculator",
                "Image Resizer": "/tools/image-resizer",
                "Image Cropper": "/tools/image-cropper",
                "Meme Generator": "/tools/meme-generator",
                "ASCII Art Generator": "/tools/ascii-art",
                "CSV to JSON": "/tools/csv-to-json",
                "JSON to CSV": "/tools/json-to-csv",
                "XML Formatter": "/tools/xml-formatter",
                "YAML Formatter": "/tools/yaml-formatter",
                "SQL Formatter": "/tools/sql-formatter",
                "IP Lookup": "/tools/ip-lookup",
                "Password Strength": "/tools/password-strength",
                "Base64 Image Encoder": "/tools/base64-image",
                "Color Converter": "/tools/color-converter",
                "Gradient Generator": "/tools/gradient-generator",
                "Text to Slug": "/tools/text-to-slug",
                "Random Number": "/tools/random-number",
                "Dice Roller": "/tools/dice-roller",
                "Countdown Timer": "/tools/countdown-timer",
                "Stopwatch": "/tools/stopwatch",
                "Age Calculator": "/tools/age-calculator",
              };
              
              return (
                <div
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => !tool.comingSoon && handleToolClick(toolPaths[tool.title] || "/")}
                >
                  <ToolCard {...tool} comingSoon={tool.comingSoon} />
                </div>
              );
            })}
          </div>
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

        {/* Bottom Ad */}
        <AdSpace size="leaderboard" className="mt-12" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                100+
              </div>
              <p className="text-muted-foreground">Free Tools</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                1M+
              </div>
              <p className="text-muted-foreground">Monthly Users</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                10M+
              </div>
              <p className="text-muted-foreground">Files Processed</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                100%
              </div>
              <p className="text-muted-foreground">Free Forever</p>
            </div>
          </div>

          {/* Ad after Stats section */}
          <div className="mt-12">
            <AdSpace size="leaderboard" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card">
        <div className="container">
          {/* Ad before footer content */}
          <div className="mb-8">
            <AdSpace size="leaderboard" />
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="gradient-primary h-8 w-8 rounded-lg"></div>
                <span className="text-lg font-bold">ToolMaster Pro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                100+ free online tools for everyone. No signup required.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Popular Categories</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">AI Tools</li>
                <li className="hover:text-foreground cursor-pointer">Image Tools</li>
                <li className="hover:text-foreground cursor-pointer">PDF Tools</li>
                <li className="hover:text-foreground cursor-pointer">Text Tools</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer" onClick={() => navigate("/blog")}>Blog</li>
                <li className="hover:text-foreground cursor-pointer">Tutorials</li>
                <li className="hover:text-foreground cursor-pointer">API Access</li>
                <li className="hover:text-foreground cursor-pointer">Sitemap</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer" onClick={() => navigate("/privacy-policy")}>Privacy Policy</li>
                <li className="hover:text-foreground cursor-pointer" onClick={() => navigate("/terms-of-service")}>Terms of Service</li>
                <li className="hover:text-foreground cursor-pointer">DMCA</li>
                <li className="hover:text-foreground cursor-pointer" onClick={() => navigate("/contact")}>Contact</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 ToolMaster Pro. All rights reserved. Built with ❤️ for everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

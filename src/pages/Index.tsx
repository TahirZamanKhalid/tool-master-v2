import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryCard } from "@/components/CategoryCard";
import { ToolCard } from "@/components/ToolCard";
import { HowItWorks } from "@/components/HowItWorks";
import { AdSpace } from "@/components/AdSpace";
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
    category: "Developer Tools",
  },
  {
    icon: Instagram,
    title: "Caption Generator",
    description: "Generate engaging social media captions",
    category: "Social Media",
    comingSoon: true,
  },
  {
    icon: Palette,
    title: "Color Picker",
    description: "Pick colors and generate palettes",
    category: "Developer Tools",
  },
  {
    icon: Brain,
    title: "AI Writing Assistant",
    description: "Improve your writing with AI suggestions",
    category: "AI & Content",
    comingSoon: true,
  },
];

const Index = () => {
  const navigate = useNavigate();

  const handleToolClick = (path: string, comingSoon?: boolean) => {
    if (comingSoon) {
      return; // Don't navigate if coming soon
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Top Banner Ad */}
      <div className="container py-4">
        <AdSpace size="banner" />
      </div>

      <Hero />

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
              className="animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CategoryCard {...category} />
            </div>
          ))}
        </div>

        {/* Mid-content Ad */}
        <AdSpace size="leaderboard" className="my-8" />
      </section>

      <HowItWorks />

      {/* Popular Tools Section */}
      <section className="py-16 container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Tools</h2>
          <p className="text-muted-foreground text-lg">
            Most used tools by our community
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {popularTools.map((tool, index) => {
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card">
        <div className="container">
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
                <li className="hover:text-foreground cursor-pointer">Blog</li>
                <li className="hover:text-foreground cursor-pointer">Tutorials</li>
                <li className="hover:text-foreground cursor-pointer">API Access</li>
                <li className="hover:text-foreground cursor-pointer">Sitemap</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">Privacy Policy</li>
                <li className="hover:text-foreground cursor-pointer">Terms of Service</li>
                <li className="hover:text-foreground cursor-pointer">DMCA</li>
                <li className="hover:text-foreground cursor-pointer">Contact</li>
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

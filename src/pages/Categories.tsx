import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { SEOHead } from "@/components/SEOHead";
import { AdSpace } from "@/components/AdSpace";
import {
  Sparkles,
  Image as ImageIcon,
  Code2,
  QrCode,
  FileText,
  Type,
  Video,
  TrendingUp,
  Calculator,
  Shield,
  Wrench,
  FileCode,
  Building,
} from "lucide-react";

const Categories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      icon: Sparkles,
      title: "AI & Content",
      description: "AI-powered writing, content generation, and creative tools",
      toolCount: 8,
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: ImageIcon,
      title: "Image Tools",
      description: "Edit, compress, convert, and enhance your images",
      toolCount: 16,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Code2,
      title: "Developer Tools",
      description: "Code formatters, validators, and development utilities",
      toolCount: 21,
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: QrCode,
      title: "QR & Barcodes",
      description: "Generate and scan QR codes and barcodes",
      toolCount: 5,
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: FileText,
      title: "PDF Tools",
      description: "Merge, split, compress, and edit PDF files",
      toolCount: 6,
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Type,
      title: "Text Tools",
      description: "Text manipulation, conversion, and analysis tools",
      toolCount: 23,
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: Video,
      title: "Video Tools",
      description: "Edit, compress, and convert video files",
      toolCount: 6,
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: TrendingUp,
      title: "SEO & Marketing",
      description: "SEO analysis, meta tags, and marketing tools",
      toolCount: 18,
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Calculator,
      title: "Calculators",
      description: "Financial, unit, and specialized calculators",
      toolCount: 23,
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Shield,
      title: "Security Tools",
      description: "Password generators, encryption, and security utilities",
      toolCount: 4,
      color: "from-red-500 to-orange-500",
    },
    {
      icon: Wrench,
      title: "Utilities",
      description: "Timers, random generators, and everyday utilities",
      toolCount: 9,
      color: "from-fuchsia-500 to-pink-500",
    },
    {
      icon: FileCode,
      title: "File Converters",
      description: "Convert between different file formats",
      toolCount: 8,
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Building,
      title: "Business Tools",
      description: "Invoice generators, name generators, and business utilities",
      toolCount: 2,
      color: "from-teal-500 to-cyan-500",
    },
  ];

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
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Tool Categories - Browse by Type | ToolMaster Pro"
        description="Explore our complete collection of free online tools organized by category. Find the perfect tool for your needs from 13 different categories."
        keywords="tool categories, online tools by category, free utilities, web tools collection"
      />
      <Header />

      <main className="flex-1 py-12 bg-gradient-hero">
        <div className="container">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Browse All Categories
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the perfect tool for your needs from our comprehensive collection of 100+ free online utilities
            </p>
          </div>

          <AdSpace size="leaderboard" className="mb-12" />

          {/* Categories Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => navigate(`/category/${categorySlug[category.title]}`)}
                className="cursor-pointer transform transition-all hover:scale-105 animate-fade-in"
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

          {/* Bottom Ad */}
          <AdSpace size="leaderboard" className="mt-12" />

          {/* CTA Section */}
          <div className="mt-16 text-center bg-card rounded-2xl p-12 shadow-lg border">
            <h2 className="text-3xl font-bold mb-4">Can't Find What You Need?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Browse all our tools or use the search to find exactly what you're looking for
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/tools")}
                className="px-8 py-3 bg-gradient-primary text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg hover:shadow-glow"
              >
                View All Tools
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80 transition-colors shadow-md"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;

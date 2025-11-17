import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { SEOHead } from "@/components/SEOHead";
import { allTools } from "@/data/allTools";

const CategoryTools = () => {
  const navigate = useNavigate();
  const { category } = useParams();

  // Map URL slugs to exact category names
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

  const decodedCategory = categoryMap[category || ""] || "";
  const categoryTools = allTools.filter((tool) => tool.category === decodedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${decodedCategory} Tools - Free Online Tools`}
        description={`Browse all ${decodedCategory} tools`}
        keywords={`${decodedCategory}, tools, online tools`}
      />
      <Header />
      <main className="flex-1 py-12 container max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">{decodedCategory}</h1>
          <p className="text-muted-foreground">{categoryTools.length} tools available</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryTools.map((tool, index) => (
            <div key={index} onClick={() => navigate(tool.path)} className="cursor-pointer">
              <ToolCard {...tool} />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryTools;

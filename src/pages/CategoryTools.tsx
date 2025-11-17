import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";
import { SEOHead } from "@/components/SEOHead";
import { LazyAdSpace } from "@/components/LazyAdSpace";
import { AdRow } from "@/components/AdRow";
import { getDisplayAdSlot, getAdIndex } from "@/utils/adSlotRotation";
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
      <main className="flex-1 py-12 container">
        <div className="flex gap-6">
          {/* Left Sidebar Ad */}
          <div className="hidden xl:block flex-shrink-0" style={{ width: "160px" }}>
            <div className="sticky top-4">
              <LazyAdSpace
                type="display"
                slot={getDisplayAdSlot(getAdIndex("sidebar-left"))}
                position="sidebar-left"
                style={{
                  width: "160px",
                  height: "600px",
                  display: "block",
                }}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">{decodedCategory}</h1>
              <p className="text-muted-foreground">{categoryTools.length} tools available</p>
            </div>

            <div className="mb-8">
              <LazyAdSpace
                type="display"
                slot={getDisplayAdSlot(getAdIndex("top"))}
                className="w-full"
                style={{ minHeight: "90px" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryTools.map((tool, index) => (
                <div key={index} onClick={() => navigate(tool.path)} className="cursor-pointer">
                  <ToolCard {...tool} />
                </div>
              ))}
            </div>

            <div className="mt-12">
              <AdRow type="display" count={3} position="bottom" />
            </div>
          </div>

          {/* Right Sidebar Ad */}
          <div className="hidden xl:block flex-shrink-0" style={{ width: "160px" }}>
            <div className="sticky top-4">
              <LazyAdSpace
                type="display"
                slot={getDisplayAdSlot(getAdIndex("sidebar-right"))}
                position="sidebar-right"
                style={{
                  width: "160px",
                  height: "600px",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryTools;

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs, BREADCRUMB_PRESETS, generateBreadcrumbsFromPath } from "@/components/Breadcrumbs";
import { SEOHead } from "@/components/SEOHead";
import { ShareButtons } from "@/components/ShareButtons";
import { ToolFAQ } from "@/components/ToolFAQ";
import { SidebarAd } from "@/components/SidebarAd";
import { AdRow } from "@/components/AdRow";
import { blogPosts } from "@/data/blogPosts";
import { ArrowRight, Bookmark, ChevronRight } from "lucide-react";

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  children: ReactNode;
  instructions?: string[];
  features?: string[];
  extraContent?: ReactNode;
  relatedTools?: { name: string; path: string }[];
  layout?: "full-width" | "with-sidebar";
  sidebarAdSlot?: string;
  sidebarAdIndex?: number;
  sidebarAdWidth?: number;
  sidebarAdHeight?: number;
}

export const ToolLayout = ({
  title,
  description,
  category,
  children,
  instructions,
  features,
  extraContent,
  relatedTools,
  layout = "full-width",
  sidebarAdSlot = "4351073152",
  sidebarAdIndex = 1,
  sidebarAdWidth = 300,
  sidebarAdHeight = 600,
}: ToolLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const enhancedKeywords = `${title}, ${category}, free ${title.toLowerCase()}, online ${title.toLowerCase()}, ${title.toLowerCase()} tool, ${category.toLowerCase()} tools, free online tools, no signup, no registration`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: {
      "@type": "Organization",
      name: "ToolMaster Pro",
      logo: {
        "@type": "ImageObject",
        url: "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/uploads/1759510903222-toolmasterpro logo.jpeg",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5",
    },
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const cat = (category || "").toLowerCase();
    if (cat.includes("image")) return BREADCRUMB_PRESETS.imageTools(title, path);
    if (cat.includes("pdf")) return BREADCRUMB_PRESETS.pdfTools(title, path);
    if (cat.includes("text")) return BREADCRUMB_PRESETS.textTools(title, path);
    if (cat.includes("video")) return BREADCRUMB_PRESETS.videoTools(title, path);
    if (cat.includes("calculator")) return BREADCRUMB_PRESETS.calculators(title, path);
    if (cat.includes("converter")) return BREADCRUMB_PRESETS.converters(title, path);
    if (cat.includes("generator")) return BREADCRUMB_PRESETS.generators(title, path);
    if (cat.includes("seo") || cat.includes("marketing")) return BREADCRUMB_PRESETS.seoMarketing(title, path);
    if (cat.includes("developer")) return BREADCRUMB_PRESETS.developerTools(title, path);
    if (cat.includes("social")) return BREADCRUMB_PRESETS.socialMedia(title, path);
    if (cat.includes("utility")) return BREADCRUMB_PRESETS.utilities(title, path);
    return generateBreadcrumbsFromPath(path);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead
        title={title}
        description={description}
        keywords={enhancedKeywords}
        canonical={`https://toolmaster.cloud${location.pathname}`}
        ogImage="https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/social-images/social-1759510890634-toolmasterpro logo.jpeg"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Header />

      {/* Top Banner Ad */}
      <div className="w-full border-b border-border/40 bg-muted/20">
        <div className="container max-w-7xl mx-auto px-4 py-2 flex justify-center">
          <AdRow slot="9769564871" />
        </div>
      </div>

      <main className="container max-w-7xl mx-auto py-6 px-4">
        <Breadcrumbs items={getBreadcrumbs()} />

        {/* Page Title Row */}
        <div className="mt-6 mb-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-3 py-1"
            >
              {category}
            </Badge>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Free Online Tool</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-foreground leading-tight mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-3xl">
            {description}
          </p>
          <div className="mt-3">
            <ShareButtons
              title={title}
              description={description}
              url={`https://toolmaster.cloud${location.pathname}`}
            />
          </div>
        </div>

        {/* Main Layout: Tool + Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

          {/* LEFT: Tool Content */}
          <div className="space-y-6 min-w-0">

            {/* The Tool Itself */}
            <div className="w-full overflow-hidden bg-card rounded-2xl border border-border/60 shadow-card">
              <div className="p-4 md:p-6">
                {children}
              </div>
            </div>

            {/* Mid-content Ad Banner */}
            <div className="ad-container">
              <AdRow slot="1575962277" />
            </div>

            {/* How to Use */}
            {instructions && (
              <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-card">
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-foreground">
                  <span className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-base">📚</span>
                  How to Use {title}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">Follow these simple steps</p>
                <ol className="space-y-3">
                  {instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-muted-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Features / Why Use */}
            <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-card">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-foreground">
                <span className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-base">✨</span>
                Why Use Our {title}?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Key features & benefits</p>
              <ul className="space-y-2.5">
                {features ? (
                  features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary block" />
                      </span>
                      {f}
                    </li>
                  ))
                ) : (
                  [
                    `100% Free — No signup or registration required`,
                    `Browser-based — Your data never leaves your device`,
                    `Works on any device — Desktop, tablet, or mobile`,
                    `Professional results — High-quality output every time`,
                    `Privacy focused — No files are sent to our servers`,
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary block" />
                      </span>
                      {f}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {extraContent && (
              <div className="prose dark:prose-invert max-w-none">{extraContent}</div>
            )}

            {/* FAQ */}
            <ToolFAQ toolName={title} />

            {/* Related Tools */}
            {relatedTools && relatedTools.length > 0 && (
              <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-card">
                <h2 className="text-xl font-bold mb-4 text-foreground">Related Tools</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {relatedTools.map((tool, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(tool.path)}
                      className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-primary/5 text-left transition-all group"
                    >
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Blog / Guides */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-6">
              <h2 className="text-xl font-bold mb-1 text-foreground">Step-by-Step Guides</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Learn pro workflows with our expert tutorials.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {blogPosts.slice(0, 2).map((post) => (
                  <div
                    key={post.id}
                    className="cursor-pointer group p-3 rounded-xl bg-card/50 border border-border/40 hover:border-primary/30 transition-all"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {post.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </div>
                ))}
              </div>
              <Button
                variant="link"
                onClick={() => navigate("/blog")}
                className="p-0 h-auto text-primary font-bold text-sm"
              >
                View All Guides <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>

          </div>

          {/* RIGHT: Sticky Sidebar */}
          <aside className="hidden xl:block space-y-4">
            <div className="sticky top-20 space-y-4">

              {/* Sidebar Ad */}
              <div className="ad-container-sidebar w-full">
                <SidebarAd
                  slot={sidebarAdSlot}
                  position="right"
                  index={sidebarAdIndex}
                  width={sidebarAdWidth}
                  height={sidebarAdHeight}
                />
              </div>

              {/* Pro Tip card */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Bookmark className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-primary">Pro Tip</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bookmark this page (Ctrl+D) to access <strong>{title}</strong> instantly whenever you need it!
                </p>
              </div>

              {/* Second sidebar ad */}
              <div className="ad-container w-full min-h-[250px]">
                <SidebarAd
                  slot="7110517063"
                  position="right"
                  index={2}
                  width={300}
                  height={250}
                />
              </div>

              {/* All Tools CTA */}
              <div className="bg-card rounded-2xl border border-border/60 p-5 text-center shadow-card">
                <p className="text-sm font-bold text-foreground mb-1">Need Another Tool?</p>
                <p className="text-xs text-muted-foreground mb-3">Browse 150+ free tools in one place.</p>
                <Button
                  onClick={() => navigate("/tools")}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm"
                >
                  Browse All Tools
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

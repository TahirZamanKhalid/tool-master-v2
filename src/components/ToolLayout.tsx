import { ReactNode, useState } from "react";
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
import { AdWatchModal } from "@/components/AdWatchModal";
import { blogPosts } from "@/data/blogPosts";
import { ArrowRight, Bookmark, ChevronRight, Download } from "lucide-react";

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  children: ReactNode;
  instructions?: string[];
  features?: string[];
  extraContent?: ReactNode;
  relatedTools?: { name: string; path: string }[];
  /** Show ad-watch modal before download. Pass the download fn as children trigger. */
  showDownloadAd?: boolean;
  onDownload?: () => void;
  downloadLabel?: string;
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
  showDownloadAd = false,
  onDownload,
  downloadLabel = "Download Result",
}: ToolLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adModalOpen, setAdModalOpen] = useState(false);

  const keywords = `${title}, ${category}, free ${title.toLowerCase()}, online ${title.toLowerCase()}, ${title.toLowerCase()} tool`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: "ToolMaster Pro" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1250", bestRating: "5" },
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

  const handleDownloadClick = () => {
    if (showDownloadAd && onDownload) {
      setAdModalOpen(true);
    } else {
      onDownload?.();
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        canonical={`https://toolmaster.cloud${location.pathname}`}
        ogImage="https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/social-images/social-1759510890634-toolmasterpro logo.jpeg"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Header />

      {/* ── Mobile/Tablet top banner ad (hidden on xl where sidebar takes over) ── */}
      <div className="xl:hidden w-full border-b border-border/40 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 py-2 flex justify-center">
          <AdRow slot="9769564871" lazy={false} />
        </div>
      </div>

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-5">

        {/* Breadcrumbs */}
        <Breadcrumbs items={getBreadcrumbs()} />

        {/* ── Compact title section ── */}
        <div className="mt-4 mb-4">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2.5 py-0.5">
              {category}
            </Badge>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Free Online Tool</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-black text-foreground leading-tight mb-1">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>

            {/* Download CTA if provided */}
            {onDownload && (
              <Button
                onClick={handleDownloadClick}
                className="shrink-0 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 h-9 px-4 text-sm"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {downloadLabel}
              </Button>
            )}
          </div>

          <div className="mt-2">
            <ShareButtons
              title={title}
              description={description}
              url={`https://toolmaster.cloud${location.pathname}`}
            />
          </div>
        </div>

        {/* ── Main layout grid: tool + right sidebar ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">

          {/* ── LEFT: Tool + below-fold content ── */}
          <div className="space-y-5 min-w-0">

            {/* Tool Widget */}
            <div className="w-full bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden">
              <div className="p-4 md:p-5">
                {children}
              </div>
            </div>

            {/* Mobile 300x250 ad — below tool, hidden on xl */}
            <div className="xl:hidden">
              <AdRow slot="1575962277" />
            </div>

            {/* ── Below fold sections ── */}

            {instructions && (
              <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card">
                <h2 className="text-lg font-black text-foreground mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">📚</span>
                  How to Use {title}
                </h2>
                <ol className="space-y-2.5">
                  {instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="shrink-0 h-5 w-5 rounded-full bg-primary text-white text-[11px] font-black flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-muted-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Mid-content Ad */}
            <AdRow slot="2127993591" />

            <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card">
              <h2 className="text-lg font-black text-foreground mb-3 flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">✨</span>
                Why Use Our {title}?
              </h2>
              <ul className="space-y-2">
                {features ? (
                  features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary block" />
                      </span>
                      {f}
                    </li>
                  ))
                ) : ([
                  `100% Free — No signup or registration required`,
                  `Browser-based — Your data never leaves your device`,
                  `Works on any device — Desktop, tablet, or mobile`,
                  `Professional results — High-quality output every time`,
                  `Privacy focused — No files sent to our servers`,
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary block" />
                    </span>
                    {f}
                  </li>
                )))}
              </ul>
            </div>

            {extraContent && (
              <div className="prose dark:prose-invert max-w-none">{extraContent}</div>
            )}

            <ToolFAQ toolName={title} />

            {relatedTools && relatedTools.length > 0 && (
              <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card">
                <h2 className="text-lg font-black text-foreground mb-3">Related Tools</h2>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {relatedTools.map((tool, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(tool.path)}
                      className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-primary/5 text-left transition-all group"
                    >
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Blog guides */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 p-5">
              <h2 className="text-lg font-black text-foreground mb-1">Step-by-Step Guides</h2>
              <p className="text-xs text-muted-foreground mb-4">Learn pro workflows with expert tutorials.</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                {blogPosts.slice(0, 2).map((post) => (
                  <div
                    key={post.id}
                    className="cursor-pointer group p-3 rounded-xl bg-card/60 border border-border/40 hover:border-primary/30 transition-all"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    <h4 className="font-semibold text-xs mb-1 group-hover:text-primary transition-colors line-clamp-1">{post.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </div>
                ))}
              </div>
              <Button variant="link" onClick={() => navigate("/blog")} className="p-0 h-auto text-primary font-bold text-xs">
                View All Guides <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Bottom ad */}
            <AdRow slot="1212397554" />

          </div>

          {/* ── RIGHT: Sticky sidebar (xl only) ── */}
          <aside className="hidden xl:flex flex-col gap-4">
            <div className="sticky top-20 flex flex-col gap-4">

              {/* XL top banner for sidebar area */}
              <div className="w-full border-b border-border/40 bg-muted/20 rounded-xl p-2 flex justify-center">
                <AdRow slot="9769564871" lazy={false} />
              </div>

              {/* 300x600 sidebar ad */}
              <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/10 flex flex-col items-center" style={{ minHeight: 620 }}>
                <div className="text-[10px] text-muted-foreground py-1 bg-muted/20 w-full text-center tracking-wider uppercase">
                  Advertisement
                </div>
                <SidebarAd slot="4351073152" position="right" index={1} width={300} height={600} />
              </div>

              {/* Pro tip */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold text-primary">Pro Tip</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">Ctrl+D</kbd> to bookmark{" "}
                  <strong>{title}</strong> for instant access later!
                </p>
              </div>

              {/* 300x250 second sidebar ad */}
              <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/10 flex flex-col items-center" style={{ minHeight: 270 }}>
                <div className="text-[10px] text-muted-foreground py-1 bg-muted/20 w-full text-center tracking-wider uppercase">
                  Advertisement
                </div>
                <SidebarAd slot="7110517063" position="right" index={2} width={300} height={250} />
              </div>

              {/* Browse all tools CTA */}
              <div className="bg-card rounded-2xl border border-border/60 p-4 text-center shadow-card">
                <p className="text-xs font-bold text-foreground mb-0.5">Need Another Tool?</p>
                <p className="text-[11px] text-muted-foreground mb-3">150+ free tools, one place.</p>
                <Button
                  onClick={() => navigate("/tools")}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs h-8"
                >
                  Browse All Tools
                </Button>
              </div>

            </div>
          </aside>

        </div>
      </main>

      <Footer />

      {/* Ad Watch Modal — skippable after 5s */}
      <AdWatchModal
        isOpen={adModalOpen}
        title="Almost there!"
        description="Watch this short ad to download your result for free."
        onClose={() => setAdModalOpen(false)}
        onAdComplete={() => {
          setAdModalOpen(false);
          onDownload?.();
        }}
      />
    </div>
  );
};

import { ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs, BREADCRUMB_PRESETS, generateBreadcrumbsFromPath } from "@/components/Breadcrumbs";
import { SEOHead } from "@/components/SEOHead";
import { ShareButtons } from "@/components/ShareButtons";
import { ToolFAQ, getToolFAQSchema } from "@/components/ToolFAQ";
import { ToolAdSidebar } from "@/components/ToolAdSidebar";
import { AdRow } from "@/components/AdRow";
import { AdWatchModal } from "@/components/AdWatchModal";
import { blogPosts } from "@/data/blogPosts";
import { toCanonicalUrl } from "@/utils/seo";
import { ArrowRight, BookOpen, ChevronRight, Download, Sparkles } from "lucide-react";

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  children: ReactNode;
  instructions?: string[];
  features?: string[];
  extraContent?: ReactNode;
  relatedTools?: { name: string; path: string }[];
  showDownloadAd?: boolean;
  onDownload?: () => void;
  downloadLabel?: string;
  customFAQs?: { question: string; answer: string }[];
}

/* ─── Sticky sidebar ad column ───────────────────────────────────────────── */
/* ─── Component ──────────────────────────────────────────────────────────── */

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
  customFAQs,
}: ToolLayoutProps) => {
  const location = useLocation();
  const [adModalOpen, setAdModalOpen] = useState(false);
  const contentColumnRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [renderMobileInlineAd, setRenderMobileInlineAd] = useState(false);

  useEffect(() => {
    const contentColumn = contentColumnRef.current;
    if (!contentColumn || typeof window === "undefined") return;

    const updateContentHeight = () => {
      setContentHeight(Math.ceil(contentColumn.getBoundingClientRect().height));
    };

    updateContentHeight();

    if (!("ResizeObserver" in window)) {
      window.addEventListener("resize", updateContentHeight);
      return () => window.removeEventListener("resize", updateContentHeight);
    }

    const observer = new ResizeObserver(updateContentHeight);
    observer.observe(contentColumn);
    window.addEventListener("resize", updateContentHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateContentHeight);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = window.matchMedia("(max-width: 1023px)");
    const updateMobileAdState = () => setRenderMobileInlineAd(query.matches);

    updateMobileAdState();

    if (query.addEventListener) {
      query.addEventListener("change", updateMobileAdState);
      return () => query.removeEventListener("change", updateMobileAdState);
    }

    query.addListener(updateMobileAdState);
    return () => query.removeListener(updateMobileAdState);
  }, []);

  /* ── SEO ── */
  const titleLower = title.toLowerCase();
  const keywords = [
    title,
    `free ${titleLower}`,
    `online ${titleLower}`,
    `${titleLower} online`,
    `${titleLower} free`,
    `${titleLower} tool`,
    `best ${titleLower}`,
    `${titleLower} no signup`,
    `${titleLower} browser`,
    `free online ${titleLower}`,
    category,
    `${category.toLowerCase()} tools`,
    "free online tools",
    "no signup required",
    "ToolMaster Pro",
  ].join(", ");

  const canonicalUrl = toCanonicalUrl(location.pathname);

  /* ── Breadcrumbs ── */
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const cat = (category || "").toLowerCase();
    if (cat.includes("image"))      return BREADCRUMB_PRESETS.imageTools(title, path);
    if (cat.includes("pdf"))        return BREADCRUMB_PRESETS.pdfTools(title, path);
    if (cat.includes("text"))       return BREADCRUMB_PRESETS.textTools(title, path);
    if (cat.includes("video"))      return BREADCRUMB_PRESETS.videoTools(title, path);
    if (cat.includes("calculator")) return BREADCRUMB_PRESETS.calculators(title, path);
    if (cat.includes("converter"))  return BREADCRUMB_PRESETS.converters(title, path);
    if (cat.includes("generator"))  return BREADCRUMB_PRESETS.generators(title, path);
    if (cat.includes("seo") || cat.includes("marketing")) return BREADCRUMB_PRESETS.seoMarketing(title, path);
    if (cat.includes("developer"))  return BREADCRUMB_PRESETS.developerTools(title, path);
    if (cat.includes("social"))     return BREADCRUMB_PRESETS.socialMedia(title, path);
    if (cat.includes("utility"))    return BREADCRUMB_PRESETS.utilities(title, path);
    return generateBreadcrumbsFromPath(path);
  };

  const breadcrumbItems = getBreadcrumbs();
  const breadcrumbsForSchema = [
    { name: "Home", url: "https://toolmaster.cloud/" },
    ...breadcrumbItems.map((b) => ({
      name: b.label,
      url: b.path?.startsWith("http")
        ? b.path
        : `https://toolmaster.cloud${b.path || location.pathname}`,
    })),
  ];

  /* ── Structured data ── */
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    alternateName: `Free Online ${title}`,
    description,
    url: canonicalUrl,
    applicationCategory: "UtilityApplication",
    applicationSubCategory: category,
    operatingSystem: "Any (Web Browser)",
    browserRequirements: "Requires JavaScript. Modern web browser (Chrome, Firefox, Safari, Edge).",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    publisher: {
      "@type": "Organization",
      name: "ToolMaster Pro",
      url: "https://toolmaster.cloud",
      logo: {
        "@type": "ImageObject",
        url: "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/uploads/1759510903222-toolmasterpro logo.jpeg",
      },
    },
    featureList:
      features?.join(", ") ||
      "Free, no signup, browser-based, privacy-first, mobile-friendly",
    isAccessibleForFree: true,
    inLanguage: "en-US",
  };

  const howToSchema =
    instructions && instructions.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `How to use ${title}`,
          description: `Step-by-step guide to using the ${title}: ${description}`,
          totalTime: "PT2M",
          estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
          tool: { "@type": "HowToTool", name: title },
          step: instructions.map((step, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: `Step ${i + 1}`,
            text: step,
            url: `${canonicalUrl}#step-${i + 1}`,
          })),
        }
      : null;

  const allSchemas: object[] = [webAppSchema];
  if (howToSchema) allSchemas.push(howToSchema);
  allSchemas.push(getToolFAQSchema(title, customFAQs));

  const handleDownloadClick = () => {
    if (showDownloadAd && onDownload) {
      setAdModalOpen(true);
    } else {
      onDownload?.();
    }
  };

  /* ── Render ── */
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        canonical={canonicalUrl}
        breadcrumbs={breadcrumbsForSchema}
        jsonLd={allSchemas}
      />

      <Header />

      <main className="flex-1">
        {/* ── Constrained wrapper ── */}
        <div className="mx-auto w-full max-w-[1400px] px-4 py-5">

          {/* Breadcrumbs — full width above the 3-col grid */}
          <Breadcrumbs items={getBreadcrumbs()} />

          {/* ── Page title + actions ── */}
          <div className="mb-4 mt-4">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Badge className="border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {category}
              </Badge>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Free Online Tool</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="mb-1 text-xl font-black leading-tight text-foreground md:text-3xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>

              {onDownload && (
                <Button
                  onClick={handleDownloadClick}
                  className="h-9 shrink-0 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90"
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

          

          {/* ════════════════════════════════════════════════════════════
              3-COLUMN GRID
              [160px left ad] | [centre: tool + below-fold] | [160px right ad]
              Sidebars hidden below lg. On mobile everything stacks in 1 col.
          ════════════════════════════════════════════════════════════ */}
          <div className="flex gap-4">

            {/* Left sidebar ad */}
            <ToolAdSidebar side="left" contentHeight={contentHeight} />

            {/* ── Centre column ── */}
            <div ref={contentColumnRef} className="min-w-0 flex-1 space-y-5">

              {/* Tool widget */}
              <div className="w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
                <div className="p-4 md:p-5">
                  {children}
                </div>
              </div>

              {renderMobileInlineAd && (
                <div className="lg:hidden">
                  <AdRow
                    slot="1575962277"
                    format="horizontal"
                    minHeight={90}
                    allowOnToolRoutes
                  />
                </div>
              )}

              {/* How to use */}
              {instructions && (
                <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-foreground">
                    <BookOpen className="h-6 w-6 rounded-lg bg-primary/10 p-1 text-primary" />
                    How to Use {title}
                  </h2>
                  <ol className="space-y-2.5">
                    {instructions.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-white">
                          {i + 1}
                        </span>
                        <span className="text-sm leading-relaxed text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Why use this tool */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-foreground">
                  <Sparkles className="h-6 w-6 rounded-lg bg-primary/10 p-1 text-primary" />
                  Why Use Our {title}?
                </h2>
                <ul className="space-y-2">
                  {(
                    features ?? [
                      "100% free - no signup or registration required",
                      "Browser-based - your data never leaves your device",
                      "Works on any device - desktop, tablet, or mobile",
                      "Professional results - high-quality output every time",
                      "Privacy focused - no files sent to our servers",
                    ]
                  ).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Extra content slot */}
              {extraContent && (
                <div className="prose dark:prose-invert max-w-none">{extraContent}</div>
              )}

              {/* FAQ */}
              <ToolFAQ toolName={title} customFAQs={customFAQs} />

              {/* Related tools */}
              {relatedTools && relatedTools.length > 0 && (
                <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
                  <h2 className="mb-3 text-lg font-black text-foreground">Related Tools</h2>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {relatedTools.map((tool, i) => (
                      <Link
                        key={i}
                        to={tool.path}
                        className="group flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {tool.name}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog guides */}
              <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5 p-5">
                <h2 className="mb-1 text-lg font-black text-foreground">Step-by-Step Guides</h2>
                <p className="mb-4 text-xs text-muted-foreground">
                  Learn pro workflows with expert tutorials.
                </p>
                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  {blogPosts.slice(0, 2).map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group cursor-pointer rounded-xl border border-border/40 bg-card/60 p-3 transition-all hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <h4 className="mb-1 line-clamp-1 text-xs font-semibold transition-colors group-hover:text-primary">
                        {post.title}
                      </h4>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{post.excerpt}</p>
                    </Link>
                  ))}
                </div>
                <Button variant="link" asChild className="h-auto p-0 text-xs font-bold text-primary">
                  <Link to="/blog">
                    View All Guides <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

            </div>
            {/* end centre column */}

            {/* Right sidebar ad */}
            <ToolAdSidebar side="right" contentHeight={contentHeight} />

          </div>
          {/* end 3-col flex */}

        </div>
        {/* end max-w wrapper */}
      </main>

      <Footer />

      {/* Ad-watch modal */}
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

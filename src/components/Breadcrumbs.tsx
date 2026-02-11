// components/Breadcrumbs.tsx
import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  path?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  homeLabel?: string;
  baseUrl?: string;
}

export const Breadcrumbs = ({
  items,
  className = "",
  showHome = true,
  homeLabel = "Home",
  baseUrl = "https://toolmaster.cloud",
}: BreadcrumbsProps) => {
  const location = useLocation();

  // Generate breadcrumb schema markup for SEO
  const schemaData = useMemo(() => {
    const itemListElement = [];

    // Add home
    if (showHome) {
      itemListElement.push({
        "@type": "ListItem",
        position: 1,
        name: homeLabel,
        item: baseUrl,
      });
    }

    // Add other items
    items.forEach((item, index) => {
      const position = showHome ? index + 2 : index + 1;
      const itemUrl = item.path
        ? `${baseUrl}${item.path}`
        : item.current
          ? `${baseUrl}${location.pathname}`
          : baseUrl;

      itemListElement.push({
        "@type": "ListItem",
        position,
        name: item.label,
        item: itemUrl,
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement,
    };
  }, [items, showHome, homeLabel, baseUrl, location.pathname]);

  // Determine if an item is the last one (current page)
  const isLastItem = (index: number) => index === items.length - 1;

  return (
    <>
      {/* Schema.org structured data for breadcrumbs - SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Visual breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb navigation"
        className={`mb-6 ${className}`}
        role="navigation"
      >
        <ol
          className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm text-muted-foreground"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {/* Home Link */}
          {showHome && (
            <li
              className="flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <Link
                to="/"
                className="flex items-center gap-1 hover:text-primary transition-colors duration-200 p-1 -m-1 rounded-md hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                itemProp="item"
                title={`Go to ${homeLabel}`}
              >
                <Home className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span
                  itemProp="name"
                  className="hidden sm:inline"
                >
                  {homeLabel}
                </span>
                <span className="sr-only sm:hidden">{homeLabel}</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
          )}

          {/* Breadcrumb Items */}
          {items.map((item, index) => {
            const isLast = isLastItem(index);
            const isCurrent = item.current || isLast;
            const position = showHome ? index + 2 : index + 1;

            return (
              <li
                key={`${item.label}-${index}`}
                className="flex items-center min-w-0"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {/* Separator */}
                <ChevronRight
                  className="h-4 w-4 flex-shrink-0 text-muted-foreground/50 mx-1"
                  aria-hidden="true"
                />

                {/* Link or Current Page */}
                {item.path && !isCurrent ? (
                  // Clickable link for non-current items
                  <Link
                    to={item.path}
                    className="hover:text-primary transition-colors duration-200 truncate max-w-[120px] sm:max-w-[200px] md:max-w-none p-1 -m-1 rounded-md hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    itemProp="item"
                    title={`Go to ${item.label}`}
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                ) : (
                  // Current page (not clickable)
                  <span
                    className="text-foreground font-medium truncate max-w-[150px] sm:max-w-[250px] md:max-w-none"
                    aria-current="page"
                    itemProp="item"
                    itemScope
                    itemType="https://schema.org/WebPage"
                    itemID={`${baseUrl}${location.pathname}`}
                  >
                    <span itemProp="name">{item.label}</span>
                  </span>
                )}

                <meta itemProp="position" content={String(position)} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

// Export a helper function to generate breadcrumb items from path
export const generateBreadcrumbsFromPath = (
  pathname: string,
  customLabels?: Record<string, string>
): BreadcrumbItem[] => {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Convert segment to readable label
    let label = customLabels?.[segment] || segment;

    // Format label: kebab-case to Title Case
    if (!customLabels?.[segment]) {
      label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    items.push({
      label,
      path: isLast ? undefined : currentPath,
      current: isLast,
    });
  });

  return items;
};

// Preset breadcrumb configurations for common tools
export const BREADCRUMB_PRESETS = {
  imageTools: (toolName: string, toolPath: string): BreadcrumbItem[] => [
    { label: "Tools", path: "/tools" },
    { label: "Image Tools", path: "/tools/image-tools" },
    { label: toolName, path: toolPath, current: true },
  ],

  pdfTools: (toolName: string, toolPath: string): BreadcrumbItem[] => [
    { label: "Tools", path: "/tools" },
    { label: "PDF Tools", path: "/tools/pdf-tools" },
    { label: toolName, path: toolPath, current: true },
  ],

  textTools: (toolName: string, toolPath: string): BreadcrumbItem[] => [
    { label: "Tools", path: "/tools" },
    { label: "Text Tools", path: "/tools/text-tools" },
    { label: toolName, path: toolPath, current: true },
  ],

  utilities: (toolName: string, toolPath: string): BreadcrumbItem[] => [
    { label: "Tools", path: "/tools" },
    { label: "Utilities", path: "/tools/utilities" },
    { label: toolName, path: toolPath, current: true },
  ],

  converters: (toolName: string, toolPath: string): BreadcrumbItem[] => [
    { label: "Tools", path: "/tools" },
    { label: "Converters", path: "/tools/converters" },
    { label: toolName, path: toolPath, current: true },
  ],

  calculators: (toolName: string, toolPath: string): BreadcrumbItem[] => [
    { label: "Tools", path: "/tools" },
    { label: "Calculators", path: "/tools/calculators" },
    { label: toolName, path: toolPath, current: true },
  ],

  generators: (toolName: string, toolPath: string): BreadcrumbItem[] => [
    { label: "Tools", path: "/tools" },
    { label: "Generators", path: "/tools/generators" },
    { label: toolName, path: toolPath, current: true },
  ],

  videoTools: (toolName: string, toolPath: string): BreadcrumbItem[] => [
    { label: "Tools", path: "/tools" },
    { label: "Video Tools", path: "/category/video-tools" },
    { label: toolName, path: toolPath, current: true },
  ],

  socialMedia: (toolName: string, toolPath: string): BreadcrumbItem[] => [
    { label: "Tools", path: "/tools" },
    { label: "Social Media", path: "/category/social-media" },
    { label: toolName, path: toolPath, current: true },
  ],

  seoMarketing: (toolName: string, toolPath: string): BreadcrumbItem[] => [
    { label: "Tools", path: "/tools" },
    { label: "SEO Tools", path: "/category/seo-marketing" },
    { label: toolName, path: toolPath, current: true },
  ],

  developerTools: (toolName: string, toolPath: string): BreadcrumbItem[] => [
    { label: "Tools", path: "/tools" },
    { label: "Developer Tools", path: "/category/developer-tools" },
    { label: toolName, path: toolPath, current: true },
  ],
};
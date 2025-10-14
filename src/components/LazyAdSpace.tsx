import { lazy, Suspense } from "react";

const AdSpace = lazy(() => import("./AdSpace").then((module) => ({ default: module.AdSpace })));

interface LazyAdSpaceProps {
  adSlot: string;
  className?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
}

const adHeights = {
  banner: "90px",
  leaderboard: "90px",
  rectangle: "250px",
  skyscraper: "600px",
};

// Helper to determine ad height based on format
const getAdHeight = (format: string) => {
  switch (format) {
    case "horizontal":
      return "90px";
    case "vertical":
      return "600px";
    case "rectangle":
      return "250px";
    default:
      return "90px"; // auto
  }
};

export const LazyAdSpace = ({ adSlot, className, format = "auto" }: LazyAdSpaceProps) => {
  return (
    <Suspense
      fallback={
        <div
          className={`bg-muted/10 animate-pulse rounded ${className}`}
          style={{ minHeight: getAdHeight(format) }}
          aria-label="Loading advertisement"
        />
      }
    >
      <AdSpace adSlot={adSlot} className={className} format={format} />
    </Suspense>
  );
};

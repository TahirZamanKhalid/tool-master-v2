import { lazy, Suspense } from "react";

const AdSpace = lazy(() => import("./AdSpace").then(module => ({ default: module.AdSpace })));

interface LazyAdSpaceProps {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
}

const adHeights = {
  banner: '90px',
  leaderboard: '90px',
  rectangle: '250px',
  skyscraper: '600px',
};

export const LazyAdSpace = ({ size, className }: LazyAdSpaceProps) => {
  return (
    <Suspense 
      fallback={
        <div 
          className={`bg-muted/10 animate-pulse rounded ${className}`} 
          style={{ minHeight: adHeights[size] }}
          aria-label="Loading advertisement"
        />
      }
    >
      <AdSpace size={size} className={className} />
    </Suspense>
  );
};

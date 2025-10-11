import { lazy, Suspense } from "react";

const AdSpace = lazy(() => import("./AdSpace").then(module => ({ default: module.AdSpace })));

interface LazyAdSpaceProps {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
}

export const LazyAdSpace = ({ size, className }: LazyAdSpaceProps) => {
  return (
    <Suspense fallback={<div className={`bg-muted/20 animate-pulse ${className}`} style={{ minHeight: size === 'skyscraper' ? '600px' : '90px' }} />}>
      <AdSpace size={size} className={className} />
    </Suspense>
  );
};

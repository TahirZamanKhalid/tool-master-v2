import { lazy, Suspense } from "react";

const AdSpace = lazy(() => import("./AdSpace").then(module => ({ default: module.AdSpace })));

type LazyAdSpacePropsNew = {
  type: "display" | "infeed" | "multiplex";
  slot: string;
  layoutKey?: string;
  className?: string;
  position?: 'top' | 'bottom' | 'sidebar-left' | 'sidebar-right' | 'content';
};

type LazyAdSpacePropsOld = {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
  position?: 'top' | 'bottom' | 'sidebar-left' | 'sidebar-right' | 'content';
};

type LazyAdSpaceProps = LazyAdSpacePropsNew | LazyAdSpacePropsOld;

export const LazyAdSpace = (props: LazyAdSpaceProps) => {
  return (
    <Suspense 
      fallback={
        <div 
          className={`bg-muted/10 animate-pulse rounded ${props.className || ""}`} 
          style={{ minHeight: '90px' }}
          aria-label="Loading advertisement"
        />
      }
    >
      <AdSpace {...props} />
    </Suspense>
  );
};

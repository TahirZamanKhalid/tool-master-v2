import { lazy, Suspense } from "react";

const AdSpace = lazy(() => import("./AdSpace").then(module => ({ default: module.AdSpace })));

type LazyAdSpacePropsNew = {
  type: "display" | "infeed" | "multiplex";
  slot: string;
  layoutKey?: string;
  className?: string;
};

type LazyAdSpacePropsOld = {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
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

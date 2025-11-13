// components/LazyAdSpace.tsx
import { lazy, Suspense } from "react";

const AdSpace = lazy(() => import("./AdSpace").then((module) => ({ default: module.AdSpace })));

import type { AdSpaceProps } from "./AdSpace";

type LazyAdSpaceProps = AdSpaceProps;

export const LazyAdSpace = (props: LazyAdSpaceProps) => {
  return (
    <Suspense
      fallback={
        <div
          className={`bg-muted/5 animate-pulse rounded-lg flex items-center justify-center ${props.className || ""}`}
          style={{ minHeight: "90px" }}
          aria-label="Loading advertisement"
        >
          <div className="text-xs text-muted-foreground/50">Loading ad...</div>
        </div>
      }
    >
      <AdSpace {...props} />
    </Suspense>
  );
};

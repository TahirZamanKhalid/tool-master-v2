// components/LazyAdSpace.tsx
import { lazy, Suspense } from "react";
import type { AdSpaceProps } from "./AdSpace";

const AdSpace = lazy(() => import("./AdSpace").then((module) => ({ default: module.AdSpace })));

export const LazyAdSpace = (props: AdSpaceProps) => {
  return (
    <Suspense
      fallback={
        <div
          className={`bg-muted/10 animate-pulse rounded-lg ${props.className || ""}`}
          style={{ minHeight: "90px", ...props.style }}
          aria-label="Loading advertisement"
        />
      }
    >
      <AdSpace {...props} />
    </Suspense>
  );
};

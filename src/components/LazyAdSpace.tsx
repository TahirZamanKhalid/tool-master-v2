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
          className={`bg-muted/10 animate-pulse rounded-lg ${props.className || ""}`}
          style={{ minHeight: "90px" }}
          aria-label="Loading advertisement"
        />
      }
    >
      <AdSpace {...props} />
    </Suspense>
  );
};

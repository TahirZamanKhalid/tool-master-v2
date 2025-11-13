// components/LazyAdSpace.tsx
import { lazy, Suspense } from "react";

const AdSpace = lazy(() => import("./AdSpace").then((module) => ({ default: module.AdSpace })));

import type { AdSpaceProps } from "./AdSpace";

type LazyAdSpaceProps = AdSpaceProps;

export const LazyAdSpace = (props: LazyAdSpaceProps) => {
  return (
    <Suspense fallback={<div style={{ minHeight: "90px" }} />}>
      <AdSpace {...props} />
    </Suspense>
  );
};

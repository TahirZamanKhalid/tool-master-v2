import { RefObject, useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface UseAdSenseUnitOptions {
  adRef: RefObject<HTMLModElement>;
  containerRef: RefObject<HTMLElement>;
  enabled?: boolean;
  lazy?: boolean;
  minWidth?: number;
  rootMargin?: string;
}

const ALREADY_INITIALIZED_ERROR = /already (?:have ads|initialized|filled)/i;

export const ADSENSE_CLIENT = "ca-pub-7382531001943020";

export const useAdSenseUnit = ({
  adRef,
  containerRef,
  enabled = true,
  lazy = true,
  minWidth = 10,
  rootMargin = "300px",
}: UseAdSenseUnitOptions) => {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || pushedRef.current) return;

    let cancelled = false;
    let animationFrame: number | undefined;
    let retryTimer: number | undefined;
    let observer: IntersectionObserver | undefined;
    let widthRetries = 0;

    const pushAd = () => {
      if (cancelled || pushedRef.current) return;

      const ad = adRef.current;
      const container = containerRef.current;
      if (!ad || !container) return;

      if (ad.dataset.adStatus) {
        pushedRef.current = true;
        return;
      }

      if (container.offsetWidth < minWidth) {
        if (widthRetries < 8) {
          widthRetries += 1;
          retryTimer = window.setTimeout(pushAd, 250);
        }
        return;
      }

      try {
        pushedRef.current = true;
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!ALREADY_INITIALIZED_ERROR.test(message)) {
          console.warn("[AdSense] Unable to initialize ad unit", error);
          pushedRef.current = false;
        }
      }
    };

    const schedulePush = () => {
      if (animationFrame !== undefined) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = undefined;
        pushAd();
      });
    };

    if (!lazy || !("IntersectionObserver" in window)) {
      schedulePush();
    } else {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer?.disconnect();
          schedulePush();
        },
        { rootMargin, threshold: 0.01 }
      );

      const container = containerRef.current;
      if (container) observer.observe(container);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [adRef, containerRef, enabled, lazy, minWidth, rootMargin]);
};

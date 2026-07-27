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
  emptyTimeoutMs?: number;
  onStatusChange?: (status: AdSenseSlotStatus) => void;
}

const ALREADY_INITIALIZED_ERROR = /already (?:have ads|initialized|filled)/i;

export const ADSENSE_CLIENT = "ca-pub-7382531001943020";

export type AdSenseSlotStatus =
  | "idle"
  | "requested"
  | "filled"
  | "unfilled"
  | "unfill-optimized"
  | "blocked";

const getAdStatus = (ad: HTMLModElement): AdSenseSlotStatus | undefined => {
  if (ad.dataset.adStatus === "filled") return "filled";
  if (ad.dataset.adStatus === "unfilled") return "unfilled";
  if (ad.dataset.adStatus === "unfill-optimized") return "unfill-optimized";
  if (ad.querySelector("iframe")) return "filled";
  return undefined;
};

export const useAdSenseUnit = ({
  adRef,
  containerRef,
  enabled = true,
  lazy = true,
  minWidth = 10,
  rootMargin = "300px",
  emptyTimeoutMs = 4000,
  onStatusChange,
}: UseAdSenseUnitOptions) => {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || pushedRef.current) return;

    let cancelled = false;
    let animationFrame: number | undefined;
    let retryTimer: number | undefined;
    let emptyTimer: number | undefined;
    let observer: IntersectionObserver | undefined;
    let statusObserver: MutationObserver | undefined;
    let statusRequested = false;
    let widthRetries = 0;

    const notifyStatus = (status: AdSenseSlotStatus) => {
      if (!cancelled) onStatusChange?.(status);
    };

    const observeAdStatus = () => {
      const ad = adRef.current;
      if (!ad) return;

      const currentStatus = getAdStatus(ad);
      if (currentStatus) notifyStatus(currentStatus);

      statusObserver?.disconnect();
      statusObserver = new MutationObserver(() => {
        const nextStatus = getAdStatus(ad);
        if (nextStatus) notifyStatus(nextStatus);
      });
      statusObserver.observe(ad, {
        attributes: true,
        attributeFilter: ["data-ad-status"],
        childList: true,
        subtree: true,
      });

      if (emptyTimeoutMs > 0) {
        emptyTimer = window.setTimeout(() => {
          const finalStatus = getAdStatus(ad);
          notifyStatus(finalStatus ?? "blocked");
        }, emptyTimeoutMs);
      }
    };

    const pushAd = () => {
      if (cancelled || pushedRef.current) return;

      const ad = adRef.current;
      const container = containerRef.current;
      if (!ad || !container) return;

      if (ad.dataset.adStatus) {
        pushedRef.current = true;
        observeAdStatus();
        return;
      }

      if (container.offsetWidth < minWidth) {
        if (widthRetries < 8) {
          widthRetries += 1;
          retryTimer = window.setTimeout(pushAd, 250);
        } else {
          notifyStatus("blocked");
        }
        return;
      }

      if (!statusRequested) {
        statusRequested = true;
        notifyStatus("requested");
        retryTimer = window.setTimeout(pushAd, 50);
        return;
      }

      try {
        pushedRef.current = true;
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        observeAdStatus();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!ALREADY_INITIALIZED_ERROR.test(message)) {
          console.warn("[AdSense] Unable to initialize ad unit", error);
          pushedRef.current = false;
          notifyStatus("blocked");
        } else {
          notifyStatus("requested");
          observeAdStatus();
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
      statusObserver?.disconnect();
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      if (emptyTimer !== undefined) window.clearTimeout(emptyTimer);
    };
  }, [adRef, containerRef, enabled, lazy, minWidth, rootMargin, emptyTimeoutMs, onStatusChange]);
};

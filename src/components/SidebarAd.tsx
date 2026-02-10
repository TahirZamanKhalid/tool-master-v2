// components/SidebarAd.tsx
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface SidebarAdProps {
  slot?: string;
  position?: "left" | "right";
  index?: number;
  className?: string;
}

// Track pushed sidebar ads
const pushedSidebarAds = new Set<string>();

export const SidebarAd = ({
  slot,
  position = "left",
  index = 1,
  className = ""
}: SidebarAdProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isPushedRef = useRef(false);

  if (!slot) return null;

  const uniqueId = `sidebar-${position}-${index}-${slot}`;

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px", threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Push ad when visible
  useEffect(() => {
    if (!isVisible || isPushedRef.current) return;

    const pushAd = () => {
      if (isPushedRef.current || pushedSidebarAds.has(uniqueId)) {
        return;
      }

      try {
        if (typeof window === "undefined" || !window.adsbygoogle) {
          setTimeout(pushAd, 1000);
          return;
        }

        if (!adRef.current || !containerRef.current) {
          setTimeout(pushAd, 500);
          return;
        }

        const width = containerRef.current.offsetWidth;
        if (width < 10) {
          setTimeout(pushAd, 500);
          return;
        }

        isPushedRef.current = true;
        pushedSidebarAds.add(uniqueId);
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        console.log(`[SidebarAd] Pushed ${uniqueId}`);
      } catch (error) {
        console.error(`[SidebarAd] Error:`, error);
        isPushedRef.current = true;
        pushedSidebarAds.add(uniqueId);
      }
    };

    const timer = setTimeout(pushAd, 1000);
    return () => clearTimeout(timer);
  }, [isVisible, uniqueId]);

  return (
    <div
      ref={containerRef}
      className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden ${className}`}
      style={{ width: "200px", minHeight: "600px" }}
    >
      <div className="text-center text-xs text-gray-400 py-2 bg-gray-100 dark:bg-gray-800">
        Advertisement
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "inline-block",
          width: "200px",
          height: "600px",
        }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot={slot}
      />
    </div>
  );
};
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export interface InFeedAdProps {
    slot?: string;
    className?: string;
    style?: CSSProperties;
    layout?: "desktop" | "mobile";
}

const IN_FEED_SLOTS = {
    desktop: "4739066253",
    "desktop-2": "1968211491",
};

export const InFeedAd = ({
    className,
    style,
    slot,
    layout = "desktop",
}: InFeedAdProps) => {
    const adRef = useRef<HTMLModElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [adFilled, setAdFilled] = useState(false);
    const isPushedRef = useRef(false);

    const adSlot = slot || IN_FEED_SLOTS[layout];
    const uniqueId = `in-feed-${adSlot}-${Math.random().toString(36).substr(2, 9)}`;

    // Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" }
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
            if (isPushedRef.current) return;

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
                if (width < 100) { // Ensure minimum width
                    console.log(`[InFeedAd] Container too small (${width}px), retrying...`);
                    setTimeout(pushAd, 500);
                    return;
                }

                isPushedRef.current = true;
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                setAdFilled(true);
                console.log(`[InFeedAd] Pushed ${uniqueId}`);
            } catch (error) {
                console.error(`[InFeedAd] Error:`, error);
            }
        };

        // Small delay to ensure layout is stable
        const timer = setTimeout(pushAd, 500);
        return () => clearTimeout(timer);
    }, [isVisible, uniqueId]);

    return (
        <div
            ref={containerRef}
            className={`in-feed-ad w-full my-4 ${className || ""}`}
            style={{
                minWidth: "250px",
                minHeight: "100px",
                overflow: "hidden",
                ...style,
            }}
        >
            <div className="text-center text-xs text-gray-400 py-1 mb-1 bg-gray-50 dark:bg-gray-800/50 rounded">
                Advertisement
            </div>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{
                    display: "block",
                    width: "100%",
                    minHeight: "100px",
                }}
                data-ad-format="fluid"
                data-ad-layout-key="-6t+ed+2i-1n-4w"
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot={adSlot}
            />
        </div>
    );
};
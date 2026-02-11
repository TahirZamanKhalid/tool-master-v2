import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface FixedSizeAdProps {
    slot: string;
    width: number;
    height: number;
    className?: string;
}

const pushedFixedAds = new Set<string>();

export const FixedSizeAd = ({ slot, width, height, className = "" }: FixedSizeAdProps) => {
    const adRef = useRef<HTMLModElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const isPushedRef = useRef(false);

    const uniqueId = `fixed-${slot}-${width}-${height}`;

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

    useEffect(() => {
        if (!isVisible || isPushedRef.current) return;

        const pushAd = () => {
            if (isPushedRef.current || pushedFixedAds.has(uniqueId)) return;

            try {
                if (typeof window === "undefined" || !window.adsbygoogle) {
                    setTimeout(pushAd, 1000);
                    return;
                }

                if (!adRef.current || !containerRef.current) {
                    setTimeout(pushAd, 500);
                    return;
                }

                isPushedRef.current = true;
                pushedFixedAds.add(uniqueId);
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (error) {
                console.error(`[FixedSizeAd] Error:`, error);
                isPushedRef.current = true;
                pushedFixedAds.add(uniqueId);
            }
        };

        const timer = setTimeout(pushAd, 1000);
        return () => clearTimeout(timer);
    }, [isVisible, uniqueId]);

    return (
        <div
            ref={containerRef}
            className={`flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden ${className}`}
            style={{ width: "100%", minHeight: `${height + 30}px` }}
        >
            <div className="text-center text-xs text-gray-400 py-1 bg-gray-100 dark:bg-gray-800 w-full mb-2">
                Advertisement
            </div>
            <div style={{ width: `${width}px`, height: `${height}px`, overflow: "hidden" }}>
                <ins
                    ref={adRef}
                    className="adsbygoogle"
                    style={{ display: "inline-block", width: `${width}px`, height: `${height}px` }}
                    data-ad-client="ca-pub-7382531001943020"
                    data-ad-slot={slot}
                />
            </div>
        </div>
    );
};

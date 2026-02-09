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
    const [adFailed, setAdFailed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                if (adRef.current && containerRef.current) {
                    const width = containerRef.current.offsetWidth;
                    if (width > 0) {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    } else {
                        setAdFailed(true);
                    }
                }
            } catch (error) {
                console.error("AdSense in-feed error:", error);
                setAdFailed(true);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, []);

    const adSlot = slot || IN_FEED_SLOTS[layout];

    return (
        <div
            ref={containerRef}
            className={`in-feed-ad w-full ${className || ""}`}
            style={{
                minWidth: "250px",
                minHeight: "100px",
                overflow: "hidden",
                ...style,
            }}
        >
            {adFailed ? (
                <div className="flex items-center justify-center bg-muted/20 rounded-lg border border-dashed border-border/40 text-muted-foreground text-xs w-full min-h-[100px]">
                    Advertisement
                </div>
            ) : (
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
            )}
        </div>
    );
};
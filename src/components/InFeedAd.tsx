import { useEffect, useRef } from "react";
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

// In-feed ad slots
const IN_FEED_SLOTS = {
    desktop: "4739066253", // In feed app for desktop
    "desktop-2": "1968211491", // In feed ad 2 for desktop
};

export const InFeedAd = ({ className, style, slot, layout = "desktop" }: InFeedAdProps) => {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                if (adRef.current) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                }
            } catch (error) {
                console.error("AdSense in-feed error:", error);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const adSlot = slot || IN_FEED_SLOTS[layout];

    return (
        <div className={`in-feed-ad ${className || ""}`} style={style}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-format="fluid"
                data-ad-layout-key="-6t+ed+2i-1n-4w"
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot={adSlot}
            />
        </div>
    );
};

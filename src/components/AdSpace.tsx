import { useEffect } from "react";

interface AdSpaceProps {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
}

const adSizes = {
  banner: { width: 728, height: 90 },
  leaderboard: { width: 970, height: 90 },
  rectangle: { width: 300, height: 250 },
  skyscraper: { width: 300, height: 600 },
};

export const AdSpace = ({ size, className = "" }: AdSpaceProps) => {
  const dimensions = adSizes[size];

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        if (window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex items-center justify-center w-full min-h-[90px] ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          minHeight: "90px",
        }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot="1212397554"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

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
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: "inline-block",
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot="auto"
      />
    </div>
  );
};

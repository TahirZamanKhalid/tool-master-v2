import { useEffect } from "react";

interface AdSpaceProps {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
}

export const AdSpace = ({ size, className = "" }: AdSpaceProps) => {
  useEffect(() => {
    const loadAd = () => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    };

    // Wait for the component to fully render
    const timer = setTimeout(loadAd, 50);
    return () => clearTimeout(timer);
  }, [size]);

  return (
    <div className={`flex justify-center w-full ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          overflow: "hidden",
        }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

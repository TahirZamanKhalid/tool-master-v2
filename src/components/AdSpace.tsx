import { useEffect } from "react";

interface AdSpaceProps {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
}

export const AdSpace = ({ size, className = "" }: AdSpaceProps) => {
  useEffect(() => {
    // Auto Ads will handle the ad placement automatically
    // This is just to ensure the adsbygoogle script can target this container
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("AdSense loading:", err);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

// components/AdSpace.tsx
import { useEffect } from "react";

interface AdSpaceProps {
  adSlot: string;
  className?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
}

export const AdSpace = ({ adSlot, className = "", format = "auto" }: AdSpaceProps) => {
  useEffect(() => {
    // Wait for component to render then push ad
    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.log("AdSense loading");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [adSlot]);

  return (
    <div className={`flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

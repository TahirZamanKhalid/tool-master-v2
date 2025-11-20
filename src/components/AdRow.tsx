import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdRowProps {
  className?: string;
}

export const AdRow = ({ className = "" }: AdRowProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`w-full flex justify-center py-4 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "inline-block", width: "800px", height: "200px" }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot="4838473293"
      />
    </div>
  );
};

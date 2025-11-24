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
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error("AdSense row ad error:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full flex justify-center my-8 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "inline-block",
          width: "600px",
          height: "300px",
        }}
        data-ad-client="ca-pub-7382531001943020"
        data-ad-slot="2931558314"
      />
    </div>
  );
};

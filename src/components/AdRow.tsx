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
          console.log("AdSense row ad initialized");
        }
      } catch (error) {
        console.error("AdSense row ad error:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);


  return (
    <div className={`w-full flex justify-center py-4 ${className}`}>
      <div className="max-w-[600px] w-full min-h-[200px]">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: "block",
            minWidth: "300px",
            maxWidth: "600px",
            width: "100%",
            height: "200px",
          }}
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot="4838473293"
          data-ad-format="horizontal"
          data-full-width-responsive="false"
        />
      </div>
    </div>
  );
};

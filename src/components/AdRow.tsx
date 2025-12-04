import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdRowProps {
  className?: string;
  slot?: string;
}

// Display ad slots for row ads
const DISPLAY_SLOTS = [
  "9769564871", // testing adsssss - Display
  "1575962277", // Display ad 10
  "2889043946", // Display ad 9
  "4202125614", // Display ad 8
];

export const AdRow = ({ className = "", slot }: AdRowProps) => {
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

  // Use provided slot or pick from display slots
  const adSlot = slot || DISPLAY_SLOTS[0];

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
        data-ad-slot={adSlot}
      />
    </div>
  );
};

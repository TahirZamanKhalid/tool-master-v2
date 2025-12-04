import { useEffect, useRef, useState } from "react";

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
  const [adStatus, setAdStatus] = useState<string>("initializing");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current) {
          const adElement = adRef.current;
          
          // Debug logging
          console.log("[AdRow Debug] Attempting to push ad...");
          console.log("[AdRow Debug] adsbygoogle available:", typeof window.adsbygoogle);
          console.log("[AdRow Debug] Ad element dimensions:", {
            width: adElement.offsetWidth,
            height: adElement.offsetHeight,
            clientWidth: adElement.clientWidth,
            clientHeight: adElement.clientHeight,
          });
          console.log("[AdRow Debug] Ad element visible:", adElement.offsetParent !== null);
          console.log("[AdRow Debug] Ad element dataset:", adElement.dataset);
          
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdStatus("pushed");
          console.log("[AdRow Debug] Ad push successful, queue length:", window.adsbygoogle.length);
          
          // Check ad status after a delay
          setTimeout(() => {
            const computedStyle = window.getComputedStyle(adElement);
            console.log("[AdRow Debug] Post-push status:", {
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              height: computedStyle.height,
              dataAdStatus: adElement.getAttribute("data-ad-status"),
              innerHTML: adElement.innerHTML.substring(0, 100),
            });
          }, 2000);
        } else {
          console.log("[AdRow Debug] Ad ref is null");
          setAdStatus("ref-null");
        }
      } catch (error) {
        console.error("[AdRow Debug] AdSense error:", error);
        setAdStatus("error");
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
      {/* Debug indicator - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-0 right-0 text-xs bg-yellow-500 text-black px-1">
          {adStatus}
        </div>
      )}
    </div>
  );
};

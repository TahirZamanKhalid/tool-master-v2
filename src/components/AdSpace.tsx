// components/AdSpace.tsx - Fallback with image/video ads
import { useEffect, useRef } from "react";

type AdSpaceProps = {
  type: "display" | "infeed" | "multiplex";
  slot: string;
  layoutKey?: string;
  className?: string;
  position?: string;
  size?: string; // For backward compatibility
};

// Sample ad content with images and videos
const sampleAds = [
  {
    type: "image" as const,
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
    title: "Premium Development Tools",
    description: "Enhance your workflow with our pro features",
    cta: "Upgrade Now",
  },
  {
    type: "image" as const,
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
    title: "New AI Features",
    description: "Experience cutting-edge AI tools",
    cta: "Try Free",
  },
  {
    type: "video" as const,
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    title: "See How It Works",
    description: "Watch our product in action",
    cta: "Watch Demo",
  },
];

export const AdSpace = ({ type, slot, layoutKey, className = "", position }: AdSpaceProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const randomAd = sampleAds[Math.floor(Math.random() * sampleAds.length)];

  useEffect(() => {
    // Auto-play video ads
    if (videoRef.current && randomAd.type === "video") {
      videoRef.current.play().catch(console.error);
    }
  }, [randomAd.type]);

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 ${className}`}
    >
      {/* Ad Header */}
      <div className="px-3 py-1 bg-gray-50 border-b border-gray-200">
        <span className="text-xs text-gray-500 uppercase font-medium">Sponsored</span>
      </div>

      {/* Ad Content */}
      <div className="p-4">
        {randomAd.type === "video" ? (
          // Video Ad
          <div className="relative rounded-md overflow-hidden mb-3">
            <video
              ref={videoRef}
              className="w-full h-32 object-cover rounded"
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src={randomAd.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          // Image Ad
          <div className="relative rounded-md overflow-hidden mb-3">
            <img
              src={randomAd.image}
              alt={randomAd.title}
              className="w-full h-32 object-cover rounded"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <h4 className="text-white text-sm font-semibold">{randomAd.title}</h4>
            </div>
          </div>
        )}

        {/* Ad Text */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm">{randomAd.title}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{randomAd.description}</p>

          {/* CTA Button */}
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors duration-200 mt-2">
            {randomAd.cta}
          </button>
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      <div className="px-3 py-1 bg-gray-100 border-t border-gray-200 text-xs text-gray-500">
        Slot: {slot} | Type: {type} | Position: {position}
      </div>
    </div>
  );
};

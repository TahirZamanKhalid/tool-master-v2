import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdRow = ({ className = "" }) => {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [debugLog, setDebugLog] = useState<any[]>([]);
  const [adLoaded, setAdLoaded] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const addDebug = (step: string, status: string, message: string, details?: any) => {
    const debugInfo = { step, status, message, details, timestamp: new Date() };
    setDebugLog(prev => [...prev, debugInfo]);
    console.log(`[AdDebug] ${step}: ${message}`, details || '');
  };

  // Check container size and ensure it's visible
  useEffect(() => {
    const checkContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const styles = window.getComputedStyle(containerRef.current);
        
        setContainerSize({
          width: rect.width,
          height: rect.height
        });

        addDebug('CONTAINER_CHECK', 'info', 'Container dimensions', {
          width: rect.width,
          height: rect.height,
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          inViewport: rect.width > 0 && rect.height > 0
        });

        return rect.width > 0;
      }
      return false;
    };

    // Initial check
    checkContainerSize();

    // Check again after a delay to ensure CSS is applied
    const timer = setTimeout(() => {
      const hasWidth = checkContainerSize();
      if (!hasWidth) {
        addDebug('SIZE_ERROR', 'error', 'Container has zero width - ad will fail');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    addDebug('INIT', 'info', 'AdRow component mounted');

    const loadAd = () => {
      addDebug('LOAD_AD', 'info', 'Starting ad loading process');

      if (!adRef.current) {
        addDebug('ELEMENT_MISSING', 'error', 'Ad element reference is null');
        return;
      }

      // Final size check before loading ad
      if (containerSize.width === 0) {
        addDebug('ZERO_WIDTH', 'error', 'Container has zero width - delaying ad load');
        
        // Retry after a short delay
        setTimeout(loadAd, 500);
        return;
      }

      addDebug('SIZE_OK', 'success', 'Container has valid dimensions', containerSize);

      if (typeof window.adsbygoogle === 'undefined') {
        addDebug('ADSENSE_UNDEFINED', 'error', 'window.adsbygoogle is undefined');
        return;
      }

      try {
        addDebug('BEFORE_PUSH', 'info', 'Pushing ad to AdSense');
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
            addDebug('PUSH_SUCCESS', 'success', 'Ad pushed successfully!');
          } catch (error) {
            addDebug('PUSH_ERROR', 'error', 'Failed to push ad', error);
          }
        });

      } catch (error) {
        addDebug('OUTER_ERROR', 'error', 'Outer error in ad load', error);
      }
    };

    // Wait longer to ensure container is properly rendered
    const timer = setTimeout(loadAd, 1000);

    return () => clearTimeout(timer);
  }, [containerSize.width]);

  return (
    <div 
      ref={containerRef}
      className={`w-full flex justify-center my-8 ${className}`}
      style={{ 
        minWidth: '728px',
        minHeight: '90px'
      }}
    >
      {/* Debug Info */}
      {debugLog.some(log => log.status === 'error') && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-300 p-4 rounded-lg shadow-lg z-50">
          <h3 className="font-bold text-red-800">Ad Error Detected</h3>
          <p className="text-sm text-red-600">Container width: {containerSize.width}px</p>
          <p className="text-sm text-red-600">Fix: Ensure container has visible width</p>
        </div>
      )}

      {/* Ad Container with guaranteed dimensions */}
      <div 
        className="bg-gray-100 border-2 border-blue-500"
        style={{
          width: '728px',
          height: '90px',
          minWidth: '728px',
          minHeight: '90px',
          visibility: adLoaded ? 'visible' : 'visible'
        }}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '728px',
            height: '90px',
            minWidth: '728px',
            minHeight: '90px'
          }}
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot="2931558314"
          data-ad-format="rectangle"
          data-full-width-responsive="false"
        />
      </div>

      {/* Debug Panel */}
      <div className="fixed bottom-4 left-4 bg-white border border-gray-300 p-4 rounded-lg shadow-lg z-50 max-w-md">
        <h3 className="font-bold mb-2">Ad Debug</h3>
        <div className="text-sm space-y-1">
          <div>Container: {containerSize.width} × {containerSize.height}px</div>
          <div>Status: {adLoaded ? '✅ Loaded' : '🔄 Loading'}</div>
          <div>Errors: {debugLog.filter(log => log.status === 'error').length}</div>
        </div>
      </div>
    </div>
  );
};

export default AdRow;

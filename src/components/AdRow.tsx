import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
    adsbygoogleError?: boolean;
  }
}

interface DebugInfo {
  step: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: any;
  timestamp: number;
}

export const AdRow = ({ className = "" }) => {
  const adRef = useRef<HTMLModElement>(null);
  const [debugLog, setDebugLog] = useState<DebugInfo[]>([]);
  const [adLoaded, setAdLoaded] = useState(false);
  const [showDebug, setShowDebug] = useState(true);

  const addDebug = (step: string, status: DebugInfo['status'], message: string, details?: any) => {
    const debugInfo: DebugInfo = {
      step,
      status,
      message,
      details,
      timestamp: Date.now()
    };
    setDebugLog(prev => [...prev, debugInfo]);
    console.log(`[AdDebug] ${step}: ${message}`, details || '');
  };

  // Check if AdSense script is properly loaded
  const checkAdSenseScript = (): boolean => {
    const scripts = document.querySelectorAll('script');
    let adSenseLoaded = false;
    
    scripts.forEach(script => {
      if (script.src.includes('adsbygoogle.js')) {
        adSenseLoaded = true;
        addDebug('SCRIPT_CHECK', 'success', 'AdSense script found in DOM', {
          src: script.src,
          async: script.async,
          crossOrigin: script.crossOrigin
        });
      }
    });

    if (!adSenseLoaded) {
      addDebug('SCRIPT_CHECK', 'error', 'AdSense script NOT found in DOM');
      return false;
    }
    return true;
  };

  // Check CSP issues
  const checkCSPIssues = () => {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
      addDebug('CSP_CHECK', 'warning', 'CSP meta tag found - may block ads', {
        content: cspMeta.getAttribute('content')?.substring(0, 200) + '...'
      });
    } else {
      addDebug('CSP_CHECK', 'info', 'No CSP meta tag found');
    }
  };

  // Check ad element properties
  const checkAdElement = () => {
    if (!adRef.current) {
      addDebug('ELEMENT_CHECK', 'error', 'Ad element ref is null');
      return false;
    }

    const element = adRef.current;
    const styles = window.getComputedStyle(element);
    
    addDebug('ELEMENT_CHECK', 'info', 'Ad element properties', {
      display: styles.display,
      visibility: styles.visibility,
      width: styles.width,
      height: styles.height,
      position: styles.position,
      opacity: styles.opacity,
      inViewport: isElementInViewport(element)
    });

    return true;
  };

  const isElementInViewport = (el: Element) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  // Check network requests
  const checkNetworkRequests = () => {
    // Check if any ad requests were made
    setTimeout(() => {
      const performanceEntries = performance.getEntriesByType('resource');
      const adRequests = performanceEntries.filter(entry => 
        entry.name.includes('google') || 
        entry.name.includes('doubleclick') ||
        entry.name.includes('googlesyndication')
      );

      addDebug('NETWORK_CHECK', 'info', 'Ad network requests found', {
        totalRequests: adRequests.length,
        requests: adRequests.map(req => ({
          name: req.name,
          duration: req.duration,
          size: (req as any).transferSize
        }))
      });

      if (adRequests.length === 0) {
        addDebug('NETWORK_CHECK', 'error', 'No ad network requests detected');
      }
    }, 2000);
  };

  useEffect(() => {
    addDebug('INIT', 'info', 'AdRow component mounted');
    
    // Run initial checks
    checkAdSenseScript();
    checkCSPIssues();

    const loadAd = () => {
      addDebug('LOAD_AD', 'info', 'Starting ad loading process');

      // Check element first
      if (!checkAdElement()) {
        return;
      }

      // Check if adsbygoogle is available
      if (typeof window.adsbygoogle === 'undefined') {
        addDebug('ADSENSE_SCRIPT', 'error', 'window.adsbygoogle is undefined - script not loaded properly');
        
        // Try to detect why script didn't load
        const adScript = document.querySelector('script[src*="adsbygoogle"]') as HTMLScriptElement;
        if (adScript) {
          adScript.onerror = () => {
            addDebug('SCRIPT_LOAD', 'error', 'AdSense script failed to load', {
              src: adScript.src
            });
          };
        }
        return;
      }

      addDebug('ADSENSE_SCRIPT', 'success', 'window.adsbygoogle is available');

      try {
        if (adRef.current) {
          addDebug('PUSH_AD', 'info', 'Pushing ad to adsbygoogle queue');
          
          // Monitor ad loading
          const originalPush = window.adsbygoogle.push;
          window.adsbygoogle.push = function(adConfig: any) {
            addDebug('AD_PUSHED', 'info', 'Ad configuration pushed to queue', adConfig);
            return originalPush.apply(this, arguments as any);
          };

          (window.adsbygoogle = window.adsbygoogle || []).push({});
          
          // Reset after push
          window.adsbygoogle.push = originalPush;

          setAdLoaded(true);
          addDebug('AD_LOADED', 'success', 'Ad successfully pushed to AdSense');

          // Check network requests after a delay
          setTimeout(checkNetworkRequests, 1000);
        }
      } catch (error) {
        addDebug('PUSH_ERROR', 'error', 'Error pushing ad to AdSense', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    };

    // Wait a bit for scripts to load
    const timer = setTimeout(loadAd, 500);

    return () => {
      clearTimeout(timer);
      addDebug('CLEANUP', 'info', 'AdRow component unmounted');
    };
  }, []);

  // Check console for blocked resources
  useEffect(() => {
    const originalError = console.error;
    console.error = function(...args) {
      if (args.some(arg => 
        typeof arg === 'string' && (
          arg.includes('adsbygoogle') ||
          arg.includes('google') ||
          arg.includes('doubleclick') ||
          arg.includes('blocked') ||
          arg.includes('CSP') ||
          arg.includes('Content Security Policy')
        )
      )) {
        addDebug('CONSOLE_ERROR', 'error', 'Console error detected', { args });
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div className={`w-full flex flex-col items-center my-8 ${className}`}>
      {/* Debug Panel */}
      {showDebug && (
        <div className="w-full max-w-4xl mb-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Ad Debug Information</h3>
            <button 
              onClick={() => setShowDebug(false)}
              className="px-2 py-1 bg-gray-300 rounded text-sm"
            >
              Hide
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {debugLog.map((log, index) => (
              <div 
                key={index} 
                className={`p-2 rounded text-sm ${
                  log.status === 'success' ? 'bg-green-100 border border-green-200' :
                  log.status === 'error' ? 'bg-red-100 border border-red-200' :
                  log.status === 'warning' ? 'bg-yellow-100 border border-yellow-200' :
                  'bg-blue-100 border border-blue-200'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{log.step}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div>{log.message}</div>
                {log.details && (
                  <details className="mt-1 text-xs">
                    <summary>Details</summary>
                    <pre className="whitespace-pre-wrap mt-1">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {/* Quick Status */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className={`p-2 rounded ${
              debugLog.some(log => log.step === 'SCRIPT_CHECK' && log.status === 'success') 
                ? 'bg-green-200' : 'bg-red-200'
            }`}>
              Script: {debugLog.some(log => log.step === 'SCRIPT_CHECK' && log.status === 'success') ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${
              debugLog.some(log => log.step === 'ADSENSE_SCRIPT' && log.status === 'success') 
                ? 'bg-green-200' : 'bg-red-200'
            }`}>
              API: {debugLog.some(log => log.step === 'ADSENSE_SCRIPT' && log.status === 'success') ? '✓' : '✗'}
            </div>
            <div className={`p-2 rounded ${
              adLoaded ? 'bg-green-200' : 'bg-yellow-200'
            }`}>
              Ad: {adLoaded ? 'Loaded' : 'Loading...'}
            </div>
          </div>
        </div>
      )}

      {/* Ad Container */}
      <div className="relative">
        {!adLoaded && (
          <div className="absolute inset-0 bg-yellow-50 border-2 border-dashed border-yellow-300 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-yellow-600 font-medium">Ad Loading...</div>
              <div className="text-xs text-yellow-500 mt-1">
                Debug panel shows detailed status
              </div>
            </div>
          </div>
        )}
        
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '728px',
            height: '90px',
            backgroundColor: adLoaded ? 'transparent' : '#f9fafb',
            border: adLoaded ? 'none' : '1px solid #e5e7eb'
          }}
          data-ad-client="ca-pub-7382531001943020"
          data-ad-slot="2931558314"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      {!showDebug && (
        <button 
          onClick={() => setShowDebug(true)}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Show Debug Info
        </button>
      )}
    </div>
  );
};

export default AdRow;

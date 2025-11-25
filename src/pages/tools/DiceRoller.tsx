import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DiceRoller = () => {
  const [sides, setSides] = useState("6");
  const [result, setResult] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [adStatus, setAdStatus] = useState<string>("Initializing...");
  const adInitialized = useRef(false);
  const topAdRef = useRef<HTMLDivElement>(null);
  const bottomAdRef = useRef<HTMLDivElement>(null);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugInfo(prev => [...prev, logMessage]);
  };

  const rollDice = () => {
    const roll = Math.floor(Math.random() * parseInt(sides)) + 1;
    setResult(roll);
  };

  // Debug AdSense setup
  useEffect(() => {
    addDebugLog("🔍 Component mounted - Starting AdSense debug");
    
    // Check if script is loaded
    const scriptCheck = setInterval(() => {
      if (typeof window !== 'undefined') {
        const scripts = document.querySelectorAll('script[src*="adsbygoogle.js"]');
        addDebugLog(`📜 AdSense scripts found: ${scripts.length}`);
        
        if (scripts.length > 0) {
          addDebugLog("✅ AdSense script tag exists in DOM");
          scripts.forEach((script, index) => {
            addDebugLog(`   Script ${index + 1}: ${script.getAttribute('src')}`);
          });
        } else {
          addDebugLog("❌ AdSense script tag NOT found in DOM");
          addDebugLog("⚠️ Please add the script to your index.html <head> section");
        }
        
        // Check if adsbygoogle exists
        if (window.adsbygoogle) {
          addDebugLog("✅ window.adsbygoogle object exists");
          addDebugLog(`   Type: ${typeof window.adsbygoogle}`);
          addDebugLog(`   Length: ${window.adsbygoogle.length}`);
        } else {
          addDebugLog("❌ window.adsbygoogle object NOT found");
        }
        
        clearInterval(scriptCheck);
      }
    }, 500);

    return () => clearInterval(scriptCheck);
  }, []);

  // Initialize ads
  useEffect(() => {
    if (adInitialized.current) {
      addDebugLog("⏭️ Ads already initialized, skipping");
      return;
    }

    const initAds = async () => {
      try {
        addDebugLog("🚀 Starting ad initialization process");

        // Wait for DOM to be fully ready
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check ad containers
        const topAd = document.querySelector('.adsbygoogle[data-ad-slot="9769564871"]:first-of-type');
        const bottomAd = document.querySelector('.adsbygoogle[data-ad-slot="9769564871"]:last-of-type');
        
        addDebugLog(`📦 Top ad container found: ${!!topAd}`);
        addDebugLog(`📦 Bottom ad container found: ${!!bottomAd}`);

        if (topAd) {
          const computed = window.getComputedStyle(topAd as Element);
          addDebugLog(`   Top ad display: ${computed.display}`);
          addDebugLog(`   Top ad dimensions: ${computed.width} x ${computed.height}`);
        }

        // Check if window.adsbygoogle is available
        if (typeof window !== 'undefined') {
          if (!window.adsbygoogle) {
            addDebugLog("⚠️ Creating window.adsbygoogle array");
            window.adsbygoogle = [];
          }

          addDebugLog(`📊 Current adsbygoogle queue length: ${window.adsbygoogle.length}`);

          // Push ads to queue
          try {
            addDebugLog("📤 Pushing ads to AdSense queue...");
            
            const adsToLoad = document.querySelectorAll('.adsbygoogle:not([data-ad-status])');
            addDebugLog(`   Found ${adsToLoad.length} unloaded ad units`);

            adsToLoad.forEach((ad, index) => {
              (ad as HTMLElement).setAttribute('data-ad-status', 'loading');
              addDebugLog(`   Ad ${index + 1}: Marked as loading`);
            });

            (window.adsbygoogle = window.adsbygoogle || []).push({});
            
            addDebugLog("✅ Ads pushed to queue successfully");
            setAdStatus("Ads pushed to queue - waiting for Google response");
            
            // Check ad status after a delay
            setTimeout(() => {
              checkAdStatus();
            }, 3000);

          } catch (pushError) {
            addDebugLog(`❌ Error pushing to adsbygoogle: ${pushError}`);
            setAdStatus(`Error: ${pushError}`);
          }
        } else {
          addDebugLog("❌ Window object not available");
          setAdStatus("Error: Window object not available");
        }

        adInitialized.current = true;

      } catch (error) {
        addDebugLog(`❌ Ad initialization error: ${error}`);
        setAdStatus(`Error: ${error}`);
      }
    };

    initAds();
  }, []);

  // Check ad status
  const checkAdStatus = () => {
    addDebugLog("🔎 Checking ad status...");
    
    const allAds = document.querySelectorAll('.adsbygoogle');
    addDebugLog(`   Total ad units: ${allAds.length}`);

    allAds.forEach((ad, index) => {
      const adElement = ad as HTMLElement;
      const status = adElement.getAttribute('data-ad-status');
      const adClient = adElement.getAttribute('data-ad-client');
      const adSlot = adElement.getAttribute('data-ad-slot');
      
      addDebugLog(`   Ad ${index + 1}:`);
      addDebugLog(`      Status: ${status || 'unknown'}`);
      addDebugLog(`      Client: ${adClient}`);
      addDebugLog(`      Slot: ${adSlot}`);
      addDebugLog(`      innerHTML length: ${adElement.innerHTML.length}`);
      
      if (adElement.innerHTML.length > 0) {
        addDebugLog(`      ✅ Ad has content - likely loaded`);
        setAdStatus("Ads loaded successfully!");
      } else {
        addDebugLog(`      ⚠️ Ad is empty`);
      }

      // Check for ad iframe
      const iframe = adElement.querySelector('iframe');
      if (iframe) {
        addDebugLog(`      ✅ Ad iframe found`);
        addDebugLog(`         iframe src: ${iframe.src.substring(0, 50)}...`);
      } else {
        addDebugLog(`      ❌ No ad iframe found`);
      }
    });

    // Check for common issues
    addDebugLog("🔍 Checking for common issues:");
    
    // Check for ad blockers
    if (window.getComputedStyle(allAds[0] as Element).display === 'none') {
      addDebugLog("   ⚠️ Ad container is hidden - possible ad blocker");
      setAdStatus("Warning: Ad blocker may be active");
    }

    // Check network
    const isOnline = navigator.onLine;
    addDebugLog(`   Internet connection: ${isOnline ? '✅ Online' : '❌ Offline'}`);
    
    // Check domain
    const currentDomain = window.location.hostname;
    addDebugLog(`   Current domain: ${currentDomain}`);
    if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
      addDebugLog("   ⚠️ Running on localhost - ads may not display");
      setAdStatus("Warning: Localhost detected - ads may not show");
    }
  };

  // Manual refresh button
  const refreshAds = () => {
    addDebugLog("🔄 Manual ad refresh triggered");
    adInitialized.current = false;
    
    const allAds = document.querySelectorAll('.adsbygoogle');
    allAds.forEach(ad => {
      (ad as HTMLElement).removeAttribute('data-ad-status');
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <ToolLayout
      title="Dice Roller"
      description="Roll virtual dice with custom sides"
      category="Utilities"
    >
      {/* Debug Panel */}
      <Card className="mb-4 bg-gray-900 text-green-400 border-green-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">🔧 AdSense Debug Console</h3>
            <Button 
              onClick={refreshAds} 
              variant="outline" 
              size="sm"
              className="border-green-600 text-green-400 hover:bg-green-950"
            >
              🔄 Refresh Page
            </Button>
          </div>
          <div className="mb-2 p-2 bg-gray-800 rounded">
            <strong>Current Status:</strong> {adStatus}
          </div>
          <div className="max-h-60 overflow-y-auto font-mono text-xs space-y-1 bg-gray-800 p-2 rounded">
            {debugInfo.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap break-all">
                {log}
              </div>
            ))}
          </div>
          <Button 
            onClick={checkAdStatus} 
            variant="outline" 
            size="sm"
            className="mt-2 w-full border-green-600 text-green-400 hover:bg-green-950"
          >
            🔍 Re-check Ad Status
          </Button>
        </CardContent>
      </Card>

      {/* Top Ad with Visual Indicator */}
      <div className="mb-6 border-2 border-dashed border-yellow-500 p-4 rounded relative">
        <div className="absolute -top-3 left-4 bg-background px-2 text-yellow-500 text-sm font-bold">
          📢 TOP AD SLOT
        </div>
        <div ref={topAdRef}>
          <ins 
            className="adsbygoogle"
            style={{ 
              display: 'block',
              minWidth: '300px',
              minHeight: '100px',
              width: '100%',
              height: 'auto',
              backgroundColor: 'rgba(255, 255, 0, 0.1)'
            }}
            data-ad-client="ca-pub-7382531001943020"
            data-ad-slot="9769564871"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
        <div className="text-center text-sm text-gray-500 mt-2">
          If you see yellow background but no ad, the ad unit is loaded but not filled
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <Select value={sides} onValueChange={setSides}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">D4 (4 sides)</SelectItem>
              <SelectItem value="6">D6 (6 sides)</SelectItem>
              <SelectItem value="8">D8 (8 sides)</SelectItem>
              <SelectItem value="10">D10 (10 sides)</SelectItem>
              <SelectItem value="12">D12 (12 sides)</SelectItem>
              <SelectItem value="20">D20 (20 sides)</SelectItem>
              <SelectItem value="100">D100 (100 sides)</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={rollDice} className="w-full">
            Roll Dice
          </Button>
          {result !== null && (
            <div className="text-center p-12 bg-muted rounded">
              <p className="text-6xl font-bold text-primary">
                {result}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Ad with Visual Indicator */}
      <div className="mt-6 border-2 border-dashed border-yellow-500 p-4 rounded relative">
        <div className="absolute -top-3 left-4 bg-background px-2 text-yellow-500 text-sm font-bold">
          📢 BOTTOM AD SLOT
        </div>
        <div ref={bottomAdRef}>
          <ins 
            className="adsbygoogle"
            style={{ 
              display: 'block',
              minWidth: '300px',
              minHeight: '100px',
              width: '100%',
              height: 'auto',
              backgroundColor: 'rgba(255, 255, 0, 0.1)'
            }}
            data-ad-client="ca-pub-7382531001943020"
            data-ad-slot="9769564871"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
        <div className="text-center text-sm text-gray-500 mt-2">
          If you see yellow background but no ad, the ad unit is loaded but not filled
        </div>
      </div>

      {/* Instructions */}
      <Alert className="mt-6">
        <AlertDescription>
          <strong>Debug Instructions:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Check the debug console above for detailed logs</li>
            <li>Look for ✅ (success) and ❌ (error) indicators</li>
            <li>Yellow bordered boxes show where ads should appear</li>
            <li>If ads don't show, common reasons: ad blocker, localhost, pending approval, or no ad inventory</li>
            <li>Open browser DevTools (F12) → Console for additional errors</li>
          </ul>
        </AlertDescription>
      </Alert>
    </ToolLayout>
  );
};

export default DiceRoller;

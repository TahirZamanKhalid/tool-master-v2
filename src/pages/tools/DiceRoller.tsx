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
  const [isVisible, setIsVisible] = useState(false);

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

  // Check visibility and dimensions
  useEffect(() => {
    addDebugLog("🔍 Component mounted - Starting AdSense debug");
    
    // Wait for layout to render
    const checkVisibility = setInterval(() => {
      const container = document.querySelector('.ad-container-top');
      if (container) {
        const rect = container.getBoundingClientRect();
        addDebugLog(`📏 Ad container dimensions: ${rect.width}px x ${rect.height}px`);
        
        if (rect.width > 0) {
          addDebugLog("✅ Container has width, setting visible");
          setIsVisible(true);
          clearInterval(checkVisibility);
        } else {
          addDebugLog("⚠️ Container width is 0, waiting...");
        }
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkVisibility);
      if (!isVisible) {
        addDebugLog("❌ Container never got width, forcing visibility");
        setIsVisible(true);
      }
    }, 3000);

    return () => clearInterval(checkVisibility);
  }, []);

  // Debug AdSense setup
  useEffect(() => {
    if (!isVisible) return;

    const scriptCheck = () => {
      if (typeof window !== 'undefined') {
        const scripts = document.querySelectorAll('script[src*="adsbygoogle.js"]');
        addDebugLog(`📜 AdSense scripts found: ${scripts.length}`);
        
        if (scripts.length > 0) {
          addDebugLog("✅ AdSense script tag exists in DOM");
        } else {
          addDebugLog("❌ AdSense script tag NOT found in DOM");
        }
        
        if (window.adsbygoogle) {
          addDebugLog("✅ window.adsbygoogle object exists");
        } else {
          addDebugLog("❌ window.adsbygoogle object NOT found");
        }
      }
    };

    setTimeout(scriptCheck, 500);
  }, [isVisible]);

  // Initialize ads ONLY after visibility is confirmed
  useEffect(() => {
    if (!isVisible || adInitialized.current) {
      return;
    }

    const initAds = async () => {
      try {
        addDebugLog("🚀 Starting ad initialization process");

        // Extra wait to ensure layout is stable
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check container dimensions before loading ads
        const topAdContainer = document.querySelector('.ad-container-top');
        const bottomAdContainer = document.querySelector('.ad-container-bottom');
        
        if (topAdContainer) {
          const rect = topAdContainer.getBoundingClientRect();
          addDebugLog(`📦 Top ad container: ${rect.width}px x ${rect.height}px`);
          
          if (rect.width === 0) {
            addDebugLog("❌ Top ad container has 0 width - ABORTING ad load");
            setAdStatus("Error: Ad container has no width. Check ToolLayout CSS.");
            return;
          }
        }

        // Check all ad slots
        const allAdSlots = document.querySelectorAll('.adsbygoogle');
        addDebugLog(`📦 Found ${allAdSlots.length} ad slots`);

        allAdSlots.forEach((slot, index) => {
          const rect = slot.getBoundingClientRect();
          const computed = window.getComputedStyle(slot as Element);
          addDebugLog(`   Slot ${index + 1}: ${rect.width}px x ${rect.height}px, display: ${computed.display}`);
        });

        if (typeof window !== 'undefined') {
          try {
            addDebugLog("📤 Pushing ads to AdSense queue...");
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            
            addDebugLog("✅ Ads pushed successfully");
            setAdStatus("Ads loaded - waiting for Google to fill");
            
            setTimeout(() => checkAdStatus(), 3000);

          } catch (pushError: any) {
            addDebugLog(`❌ Error pushing to adsbygoogle: ${pushError.message || pushError}`);
            setAdStatus(`Error: ${pushError.message || pushError}`);
          }
        }

        adInitialized.current = true;

      } catch (error: any) {
        addDebugLog(`❌ Ad initialization error: ${error.message || error}`);
        setAdStatus(`Error: ${error.message || error}`);
      }
    };

    initAds();
  }, [isVisible]);

  const checkAdStatus = () => {
    addDebugLog("🔎 Checking ad status...");
    
    const allAds = document.querySelectorAll('.adsbygoogle');
    allAds.forEach((ad, index) => {
      const adElement = ad as HTMLElement;
      const rect = ad.getBoundingClientRect();
      
      addDebugLog(`   Ad ${index + 1}:`);
      addDebugLog(`      Dimensions: ${rect.width}px x ${rect.height}px`);
      addDebugLog(`      innerHTML length: ${adElement.innerHTML.length}`);
      
      const iframe = adElement.querySelector('iframe');
      if (iframe) {
        addDebugLog(`      ✅ Ad iframe found`);
        setAdStatus("Ads loaded successfully!");
      } else {
        addDebugLog(`      ⚠️ No ad iframe - may be empty or blocked`);
      }
    });
  };

  const refreshAds = () => {
    window.location.reload();
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
              🔄 Refresh
            </Button>
          </div>
          <div className="mb-2 p-2 bg-gray-800 rounded">
            <strong>Status:</strong> {adStatus}
          </div>
          <div className="mb-2 p-2 bg-gray-800 rounded">
            <strong>Layout Visible:</strong> {isVisible ? "✅ Yes" : "❌ No"}
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
            🔍 Check Status
          </Button>
        </CardContent>
      </Card>

      {/* Top Ad - FIXED DIMENSIONS */}
      <div className="ad-container-top mb-6 w-full" style={{ minHeight: '280px' }}>
        <div className="border-2 border-dashed border-yellow-500 p-4 rounded relative w-full">
          <div className="absolute -top-3 left-4 bg-background px-2 text-yellow-500 text-sm font-bold">
            📢 TOP AD SLOT
          </div>
          {isVisible && (
            <ins 
              className="adsbygoogle"
              style={{ 
                display: 'block',
                width: '100%',
                minHeight: '250px',
              }}
              data-ad-client="ca-pub-7382531001943020"
              data-ad-slot="9769564871"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          )}
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

      {/* Bottom Ad - FIXED DIMENSIONS */}
      <div className="ad-container-bottom mt-6 w-full" style={{ minHeight: '280px' }}>
        <div className="border-2 border-dashed border-yellow-500 p-4 rounded relative w-full">
          <div className="absolute -top-3 left-4 bg-background px-2 text-yellow-500 text-sm font-bold">
            📢 BOTTOM AD SLOT
          </div>
          {isVisible && (
            <ins 
              className="adsbygoogle"
              style={{ 
                display: 'block',
                width: '100%',
                minHeight: '250px',
              }}
              data-ad-client="ca-pub-7382531001943020"
              data-ad-slot="9769564871"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default DiceRoller;

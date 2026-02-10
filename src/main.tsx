import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ✅ Declare AdSense type for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

// ✅ FORCE initialize AdSense as proper array BEFORE React renders
(function initAdSense() {
  if (typeof window === 'undefined') return;

  // Check if adsbygoogle exists but is not a proper array
  if (window.adsbygoogle && !Array.isArray(window.adsbygoogle)) {
    console.warn('[Main] Removing invalid adsbygoogle object');
    delete window.adsbygoogle;
  }

  // Create fresh array if doesn't exist
  if (!window.adsbygoogle) {
    window.adsbygoogle = [];
  }

  // Log initialization status
  console.log('[Main] ✅ AdSense initialized:', {
    exists: !!window.adsbygoogle,
    isArray: Array.isArray(window.adsbygoogle),
    type: typeof window.adsbygoogle,
    length: window.adsbygoogle.length
  });
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
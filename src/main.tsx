import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ✅ Initialize AdSense BEFORE React renders
if (typeof window !== 'undefined') {
  window.adsbygoogle = window.adsbygoogle || [];
  console.log('[Main] AdSense initialized');
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
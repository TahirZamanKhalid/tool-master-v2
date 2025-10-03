import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BackgroundRemover from "./pages/tools/BackgroundRemover";
import QRCodeGenerator from "./pages/tools/QRCodeGenerator";
import PDFMerger from "./pages/tools/PDFMerger";
import ImageCompressor from "./pages/tools/ImageCompressor";
import WordCounter from "./pages/tools/WordCounter";
import PasswordGenerator from "./pages/tools/PasswordGenerator";
import JSONFormatter from "./pages/tools/JSONFormatter";
import ColorPicker from "./pages/tools/ColorPicker";
import CurrencyConverter from "./pages/tools/CurrencyConverter";
import Base64Encoder from "./pages/tools/Base64Encoder";
import URLEncoder from "./pages/tools/URLEncoder";
import HashGenerator from "./pages/tools/HashGenerator";
import UUIDGenerator from "./pages/tools/UUIDGenerator";
import CaseConverter from "./pages/tools/CaseConverter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
        <Route path="/tools/background-remover" element={<BackgroundRemover />} />
        <Route path="/tools/qr-code-generator" element={<QRCodeGenerator />} />
        <Route path="/tools/pdf-merger" element={<PDFMerger />} />
        <Route path="/tools/image-compressor" element={<ImageCompressor />} />
        <Route path="/tools/word-counter" element={<WordCounter />} />
        <Route path="/tools/password-generator" element={<PasswordGenerator />} />
        <Route path="/tools/json-formatter" element={<JSONFormatter />} />
        <Route path="/tools/color-picker" element={<ColorPicker />} />
        <Route path="/tools/currency-converter" element={<CurrencyConverter />} />
        <Route path="/tools/base64-encoder" element={<Base64Encoder />} />
        <Route path="/tools/url-encoder" element={<URLEncoder />} />
        <Route path="/tools/hash-generator" element={<HashGenerator />} />
        <Route path="/tools/uuid-generator" element={<UUIDGenerator />} />
        <Route path="/tools/case-converter" element={<CaseConverter />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

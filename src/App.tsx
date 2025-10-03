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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

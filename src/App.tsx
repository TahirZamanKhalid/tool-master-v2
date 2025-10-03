import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
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
import MarkdownPreview from "./pages/tools/MarkdownPreview";
import HTMLEncoder from "./pages/tools/HTMLEncoder";
import LoremIpsumGenerator from "./pages/tools/LoremIpsumGenerator";
import TimestampConverter from "./pages/tools/TimestampConverter";
import TextDiff from "./pages/tools/TextDiff";
import RegexTester from "./pages/tools/RegexTester";
import CodeBeautifier from "./pages/tools/CodeBeautifier";
import UnitConverter from "./pages/tools/UnitConverter";
import PercentageCalculator from "./pages/tools/PercentageCalculator";
import BMICalculator from "./pages/tools/BMICalculator";
import Blog from "./pages/Blog";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import ImageResizer from "./pages/tools/ImageResizer";
import ImageCropper from "./pages/tools/ImageCropper";
import MemeGenerator from "./pages/tools/MemeGenerator";
import ASCIIArtGenerator from "./pages/tools/ASCIIArtGenerator";
import CSVToJSON from "./pages/tools/CSVToJSON";
import JSONToCSV from "./pages/tools/JSONToCSV";
import XMLFormatter from "./pages/tools/XMLFormatter";
import YAMLFormatter from "./pages/tools/YAMLFormatter";
import SQLFormatter from "./pages/tools/SQLFormatter";
import IPLookup from "./pages/tools/IPLookup";
import PasswordStrengthChecker from "./pages/tools/PasswordStrengthChecker";
import Base64ImageEncoder from "./pages/tools/Base64ImageEncoder";
import ColorConverter from "./pages/tools/ColorConverter";
import GradientGenerator from "./pages/tools/GradientGenerator";
import TextToSlug from "./pages/tools/TextToSlug";
import RandomNumberGenerator from "./pages/tools/RandomNumberGenerator";
import DiceRoller from "./pages/tools/DiceRoller";
import CountdownTimer from "./pages/tools/CountdownTimer";
import StopwatchTimer from "./pages/tools/StopwatchTimer";
import AgeCalculator from "./pages/tools/AgeCalculator";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
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
        <Route path="/tools/markdown-preview" element={<MarkdownPreview />} />
        <Route path="/tools/html-encoder" element={<HTMLEncoder />} />
        <Route path="/tools/lorem-ipsum" element={<LoremIpsumGenerator />} />
        <Route path="/tools/timestamp-converter" element={<TimestampConverter />} />
        <Route path="/tools/text-diff" element={<TextDiff />} />
        <Route path="/tools/regex-tester" element={<RegexTester />} />
        <Route path="/tools/code-beautifier" element={<CodeBeautifier />} />
        <Route path="/tools/unit-converter" element={<UnitConverter />} />
        <Route path="/tools/percentage-calculator" element={<PercentageCalculator />} />
        <Route path="/tools/bmi-calculator" element={<BMICalculator />} />
        <Route path="/tools/image-resizer" element={<ImageResizer />} />
        <Route path="/tools/image-cropper" element={<ImageCropper />} />
        <Route path="/tools/meme-generator" element={<MemeGenerator />} />
        <Route path="/tools/ascii-art" element={<ASCIIArtGenerator />} />
        <Route path="/tools/csv-to-json" element={<CSVToJSON />} />
        <Route path="/tools/json-to-csv" element={<JSONToCSV />} />
        <Route path="/tools/xml-formatter" element={<XMLFormatter />} />
        <Route path="/tools/yaml-formatter" element={<YAMLFormatter />} />
        <Route path="/tools/sql-formatter" element={<SQLFormatter />} />
        <Route path="/tools/ip-lookup" element={<IPLookup />} />
        <Route path="/tools/password-strength" element={<PasswordStrengthChecker />} />
        <Route path="/tools/base64-image" element={<Base64ImageEncoder />} />
        <Route path="/tools/color-converter" element={<ColorConverter />} />
        <Route path="/tools/gradient-generator" element={<GradientGenerator />} />
        <Route path="/tools/text-to-slug" element={<TextToSlug />} />
        <Route path="/tools/random-number" element={<RandomNumberGenerator />} />
        <Route path="/tools/dice-roller" element={<DiceRoller />} />
        <Route path="/tools/countdown-timer" element={<CountdownTimer />} />
        <Route path="/tools/stopwatch" element={<StopwatchTimer />} />
        <Route path="/tools/age-calculator" element={<AgeCalculator />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

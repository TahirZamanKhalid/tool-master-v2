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
import AdvancedImageEditor from "./pages/tools/AdvancedImageEditor";
import WatermarkTool from "./pages/tools/WatermarkTool";
import PhotoCollageMaker from "./pages/tools/PhotoCollageMaker";
import GIFMaker from "./pages/tools/GIFMaker";
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
import MetaTagGenerator from "./pages/tools/MetaTagGenerator";
import BarcodeGenerator from "./pages/tools/BarcodeGenerator";
import QRScanner from "./pages/tools/QRScanner";
import BarcodeScanner from "./pages/tools/BarcodeScanner";
import WiFiQRGenerator from "./pages/tools/WiFiQRGenerator";
import CaptionGenerator from "./pages/tools/CaptionGenerator";
import PDFSplitter from "./pages/tools/PDFSplitter";
import PDFCompressor from "./pages/tools/PDFCompressor";
import PDFEditor from "./pages/tools/PDFEditor";
import PDFToText from "./pages/tools/PDFToText";
import ResumeBuilder from "./pages/tools/ResumeBuilder";
import ImagesToPDF from "./pages/tools/ImagesToPDF";
import Auth from "./pages/Auth";
import About from "./pages/About";
import CookiePolicy from "./pages/CookiePolicy";
import Disclaimer from "./pages/Disclaimer";
import DMCA from "./pages/DMCA";
import APITester from "./pages/tools/APITester";
import JSONToYAML from "./pages/tools/JSONToYAML";
import CSSMinifier from "./pages/tools/CSSMinifier";
import JavaScriptMinifier from "./pages/tools/JavaScriptMinifier";
import UserAgentParser from "./pages/tools/UserAgentParser";
import NumberBaseConverter from "./pages/tools/NumberBaseConverter";
import AIChat from "./pages/tools/AIChat";
import EmailValidator from "./pages/tools/EmailValidator";
import MarkdownToHTML from "./pages/tools/MarkdownToHTML";
import TextToSpeech from "./pages/tools/TextToSpeech";
import MorseCodeTranslator from "./pages/tools/MorseCodeTranslator";
import VideoTrimmer from "./pages/tools/VideoTrimmer";
import VideoToGIF from "./pages/tools/VideoToGIF";
import CreditCardValidator from "./pages/tools/CreditCardValidator";
import RomanNumeralConverter from "./pages/tools/RomanNumeralConverter";
import LoremIpsumAdvanced from "./pages/tools/LoremIpsumAdvanced";
import JSONMinifier from "./pages/tools/JSONMinifier";
import HTMLMinifier from "./pages/tools/HTMLMinifier";
import OpenGraphGenerator from "./pages/tools/OpenGraphGenerator";
import KeywordDensity from "./pages/tools/KeywordDensity";
import BacklinkChecker from "./pages/tools/BacklinkChecker";
import DomainAgeChecker from "./pages/tools/DomainAgeChecker";
import WebsiteSpeedTest from "./pages/tools/WebsiteSpeedTest";
import XMLSitemapGenerator from "./pages/tools/XMLSitemapGenerator";
import TextAnalyzer from "./pages/tools/TextAnalyzer";
import ColorPaletteGenerator from "./pages/tools/ColorPaletteGenerator";
import HTMLPreview from "./pages/tools/HTMLPreview";
import PomodoroTimer from "./pages/tools/PomodoroTimer";
import StringReverser from "./pages/tools/StringReverser";
import DuplicateRemover from "./pages/tools/DuplicateRemover";
import CharacterFrequency from "./pages/tools/CharacterFrequency";
import BinaryTranslator from "./pages/tools/BinaryTranslator";
import CaesarCipher from "./pages/tools/CaesarCipher";
import WhitespaceRemover from "./pages/tools/WhitespaceRemover";
import TextSorter from "./pages/tools/TextSorter";
import RandomStringGenerator from "./pages/tools/RandomStringGenerator";
import FindReplace from "./pages/tools/FindReplace";
import TextStatistics from "./pages/tools/TextStatistics";
import HTMLEntityEncoder from "./pages/tools/HTMLEntityEncoder";
import LineNumberAdder from "./pages/tools/LineNumberAdder";
import BracketMatcher from "./pages/tools/BracketMatcher";
import TextCompare from "./pages/tools/TextCompare";
import HexConverter from "./pages/tools/HexConverter";
import TemperatureConverter from "./pages/tools/TemperatureConverter";
import RGBConverter from "./pages/tools/RGBConverter";
import PlagiarismChecker from "./pages/tools/PlagiarismChecker";
import PlagiarismRemover from "./pages/tools/PlagiarismRemover";
import PremiumPlagiarismAITool from "./pages/tools/PremiumPlagiarismAITool";
import TextRephraser from "./pages/tools/TextRephraser";
import EssayWriter from "./pages/tools/EssayWriter";
import ThesisWriter from "./pages/tools/ThesisWriter";
import BlogArticleWriter from "./pages/tools/BlogArticleWriter";
import AllTools from "./pages/AllTools";
import CategoryTools from "./pages/CategoryTools";
import IPDetector from "./pages/tools/IPDetector";
import ScreenDetector from "./pages/tools/ScreenDetector";
import WordScrambler from "./pages/tools/WordScrambler";
import CoinFlip from "./pages/tools/CoinFlip";
import JSONValidator from "./pages/tools/JSONValidator";
// NEW HIGH-DEMAND TOOLS
import ExcelToCSV from "./pages/tools/ExcelToCSV";
import CSVToExcel from "./pages/tools/CSVToExcel";
import PNGToJPG from "./pages/tools/PNGToJPG";
import JPGToPNG from "./pages/tools/JPGToPNG";
import HEICToJPG from "./pages/tools/HEICToJPG";
import PDFToImages from "./pages/tools/PDFToImages";
import WebPToPNG from "./pages/tools/WebPToPNG";
import AdvancedImageCompressor from "./pages/tools/AdvancedImageCompressor";
import InvoiceGenerator from "./pages/tools/InvoiceGenerator";
import AdvancedPasswordGenerator from "./pages/tools/AdvancedPasswordGenerator";
import TipCalculator from "./pages/tools/TipCalculator";
import DiscountCalculator from "./pages/tools/DiscountCalculator";
import LoanCalculator from "./pages/tools/LoanCalculator";
import GPACalculator from "./pages/tools/GPACalculator";
import SVGToPNG from "./pages/tools/SVGToPNG";
import HashtagGenerator from "./pages/tools/HashtagGenerator";
import BusinessNameGenerator from "./pages/tools/BusinessNameGenerator";
import DomainNameGenerator from "./pages/tools/DomainNameGenerator";
import EmailSignatureGenerator from "./pages/tools/EmailSignatureGenerator";
import InstagramBioGenerator from "./pages/tools/InstagramBioGenerator";
import YouTubeTitleGenerator from "./pages/tools/YouTubeTitleGenerator";
import FakeDataGenerator from "./pages/tools/FakeDataGenerator";
import RandomNameGenerator from "./pages/tools/RandomNameGenerator";
import CompanyNameGenerator from "./pages/tools/CompanyNameGenerator";
import ProductNameGenerator from "./pages/tools/ProductNameGenerator";
import TaglineGenerator from "./pages/tools/TaglineGenerator";
import KeywordResearchTool from "./pages/tools/KeywordResearchTool";
import RobotsTxtGenerator from "./pages/tools/RobotsTxtGenerator";
import SchemaMarkupGenerator from "./pages/tools/SchemaMarkupGenerator";
import SEOContentAnalyzer from "./pages/tools/SEOContentAnalyzer";
import TitleMetaChecker from "./pages/tools/TitleMetaChecker";
import HeadingAnalyzer from "./pages/tools/HeadingAnalyzer";
import AltTextGenerator from "./pages/tools/AltTextGenerator";
import CanonicalURLGenerator from "./pages/tools/CanonicalURLGenerator";
import SitemapValidator from "./pages/tools/SitemapValidator";
import BreadcrumbGenerator from "./pages/tools/BreadcrumbGenerator";
// PREMIUM FINANCIAL & DATE TOOLS
import CompoundInterestCalculator from "./pages/tools/CompoundInterestCalculator";
import TDEECalculator from "./pages/tools/TDEECalculator";
import BudgetPlanner from "./pages/tools/BudgetPlanner";
import SavingsGoalCalculator from "./pages/tools/SavingsGoalCalculator";
import DateDifferenceCalculator from "./pages/tools/DateDifferenceCalculator";

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
          <Route path="/tools" element={<AllTools />} />
          <Route path="/category/:category" element={<CategoryTools />} />
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
        <Route path="/tools/advanced-image-editor" element={<AdvancedImageEditor />} />
        <Route path="/tools/watermark-tool" element={<WatermarkTool />} />
        <Route path="/tools/photo-collage-maker" element={<PhotoCollageMaker />} />
        <Route path="/tools/gif-maker" element={<GIFMaker />} />
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
        <Route path="/tools/meta-tag-generator" element={<MetaTagGenerator />} />
        <Route path="/tools/barcode-generator" element={<BarcodeGenerator />} />
        <Route path="/tools/qr-scanner" element={<QRScanner />} />
        <Route path="/tools/barcode-scanner" element={<BarcodeScanner />} />
        <Route path="/tools/wifi-qr" element={<WiFiQRGenerator />} />
        <Route path="/tools/caption-generator" element={<CaptionGenerator />} />
        <Route path="/tools/pdf-splitter" element={<PDFSplitter />} />
        <Route path="/tools/pdf-compressor" element={<PDFCompressor />} />
        <Route path="/tools/pdf-editor" element={<PDFEditor />} />
        <Route path="/tools/pdf-to-text" element={<PDFToText />} />
        <Route path="/tools/images-to-pdf" element={<ImagesToPDF />} />
        <Route path="/tools/resume-builder" element={<ResumeBuilder />} />
        <Route path="/tools/api-tester" element={<APITester />} />
        <Route path="/tools/json-to-yaml" element={<JSONToYAML />} />
        <Route path="/tools/css-minifier" element={<CSSMinifier />} />
        <Route path="/tools/javascript-minifier" element={<JavaScriptMinifier />} />
        <Route path="/tools/user-agent-parser" element={<UserAgentParser />} />
        <Route path="/tools/number-base-converter" element={<NumberBaseConverter />} />
        <Route path="/tools/ai-chat" element={<AIChat />} />
        <Route path="/tools/email-validator" element={<EmailValidator />} />
        <Route path="/tools/markdown-to-html" element={<MarkdownToHTML />} />
        <Route path="/tools/text-to-speech" element={<TextToSpeech />} />
        <Route path="/tools/morse-code" element={<MorseCodeTranslator />} />
        <Route path="/tools/credit-card-validator" element={<CreditCardValidator />} />
        <Route path="/tools/roman-numeral-converter" element={<RomanNumeralConverter />} />
        <Route path="/tools/lorem-ipsum-pro" element={<LoremIpsumAdvanced />} />
        <Route path="/tools/json-minifier" element={<JSONMinifier />} />
        <Route path="/tools/html-minifier" element={<HTMLMinifier />} />
        <Route path="/tools/video-trimmer" element={<VideoTrimmer />} />
        <Route path="/tools/video-to-gif" element={<VideoToGIF />} />
        <Route path="/tools/open-graph-generator" element={<OpenGraphGenerator />} />
        <Route path="/tools/keyword-density" element={<KeywordDensity />} />
        <Route path="/tools/backlink-checker" element={<BacklinkChecker />} />
        <Route path="/tools/domain-age-checker" element={<DomainAgeChecker />} />
        <Route path="/tools/website-speed-test" element={<WebsiteSpeedTest />} />
        <Route path="/tools/xml-sitemap-generator" element={<XMLSitemapGenerator />} />
        <Route path="/tools/text-analyzer" element={<TextAnalyzer />} />
        <Route path="/tools/color-palette-generator" element={<ColorPaletteGenerator />} />
        <Route path="/tools/html-preview" element={<HTMLPreview />} />
        <Route path="/tools/pomodoro-timer" element={<PomodoroTimer />} />
        <Route path="/tools/string-reverser" element={<StringReverser />} />
        <Route path="/tools/duplicate-remover" element={<DuplicateRemover />} />
        <Route path="/tools/character-frequency" element={<CharacterFrequency />} />
        <Route path="/tools/binary-translator" element={<BinaryTranslator />} />
        <Route path="/tools/caesar-cipher" element={<CaesarCipher />} />
        <Route path="/tools/whitespace-remover" element={<WhitespaceRemover />} />
        <Route path="/tools/text-sorter" element={<TextSorter />} />
        <Route path="/tools/random-string-generator" element={<RandomStringGenerator />} />
        <Route path="/tools/find-replace" element={<FindReplace />} />
        <Route path="/tools/text-statistics" element={<TextStatistics />} />
        <Route path="/tools/html-entity-encoder" element={<HTMLEntityEncoder />} />
        <Route path="/tools/line-number-adder" element={<LineNumberAdder />} />
        <Route path="/tools/bracket-matcher" element={<BracketMatcher />} />
        <Route path="/tools/text-compare" element={<TextCompare />} />
        <Route path="/tools/hex-converter" element={<HexConverter />} />
        <Route path="/tools/temperature-converter" element={<TemperatureConverter />} />
        <Route path="/tools/rgb-converter" element={<RGBConverter />} />
            <Route path="/tools/plagiarism-checker" element={<PlagiarismChecker />} />
            <Route path="/tools/plagiarism-remover" element={<PlagiarismRemover />} />
            <Route path="/tools/premium-plagiarism-ai-tool" element={<PremiumPlagiarismAITool />} />
            <Route path="/tools/text-rephraser" element={<TextRephraser />} />
            <Route path="/tools/essay-writer" element={<EssayWriter />} />
            <Route path="/tools/thesis-writer" element={<ThesisWriter />} />
            <Route path="/tools/blog-article-writer" element={<BlogArticleWriter />} />
            <Route path="/tools/ip-detector" element={<IPDetector />} />
            <Route path="/tools/screen-detector" element={<ScreenDetector />} />
            <Route path="/tools/word-scrambler" element={<WordScrambler />} />
            <Route path="/tools/coin-flip" element={<CoinFlip />} />
            <Route path="/tools/json-validator" element={<JSONValidator />} />
            <Route path="/tools/compound-interest-calculator" element={<CompoundInterestCalculator />} />
            <Route path="/tools/tdee-calculator" element={<TDEECalculator />} />
            <Route path="/tools/budget-planner" element={<BudgetPlanner />} />
            <Route path="/tools/savings-goal-calculator" element={<SavingsGoalCalculator />} />
            <Route path="/tools/date-difference-calculator" element={<DateDifferenceCalculator />} />

            {/* NEW HIGH-DEMAND TOOLS */}
            <Route path="/tools/excel-to-csv" element={<ExcelToCSV />} />
            <Route path="/tools/csv-to-excel" element={<CSVToExcel />} />
            <Route path="/tools/png-to-jpg" element={<PNGToJPG />} />
            <Route path="/tools/jpg-to-png" element={<JPGToPNG />} />
            <Route path="/tools/heic-to-jpg" element={<HEICToJPG />} />
            <Route path="/tools/pdf-to-images" element={<PDFToImages />} />
            <Route path="/tools/webp-to-png" element={<WebPToPNG />} />
            <Route path="/tools/advanced-image-compressor" element={<AdvancedImageCompressor />} />
            <Route path="/tools/invoice-generator" element={<InvoiceGenerator />} />
            <Route path="/tools/advanced-password-generator" element={<AdvancedPasswordGenerator />} />
            <Route path="/tools/tip-calculator" element={<TipCalculator />} />
            <Route path="/tools/discount-calculator" element={<DiscountCalculator />} />
            <Route path="/tools/loan-calculator" element={<LoanCalculator />} />
            <Route path="/tools/gpa-calculator" element={<GPACalculator />} />
            <Route path="/tools/svg-to-png" element={<SVGToPNG />} />
            <Route path="/tools/hashtag-generator" element={<HashtagGenerator />} />
            <Route path="/tools/business-name-generator" element={<BusinessNameGenerator />} />
            <Route path="/tools/domain-name-generator" element={<DomainNameGenerator />} />
            <Route path="/tools/email-signature-generator" element={<EmailSignatureGenerator />} />
            <Route path="/tools/instagram-bio-generator" element={<InstagramBioGenerator />} />
            <Route path="/tools/youtube-title-generator" element={<YouTubeTitleGenerator />} />
            <Route path="/tools/fake-data-generator" element={<FakeDataGenerator />} />
            <Route path="/tools/random-name-generator" element={<RandomNameGenerator />} />
            <Route path="/tools/company-name-generator" element={<CompanyNameGenerator />} />
            <Route path="/tools/product-name-generator" element={<ProductNameGenerator />} />
            <Route path="/tools/tagline-generator" element={<TaglineGenerator />} />
            <Route path="/tools/keyword-research" element={<KeywordResearchTool />} />
            <Route path="/tools/robots-txt-generator" element={<RobotsTxtGenerator />} />
            <Route path="/tools/schema-markup-generator" element={<SchemaMarkupGenerator />} />
            <Route path="/tools/seo-content-analyzer" element={<SEOContentAnalyzer />} />
            <Route path="/tools/title-meta-checker" element={<TitleMetaChecker />} />
            <Route path="/tools/heading-analyzer" element={<HeadingAnalyzer />} />
            <Route path="/tools/alt-text-generator" element={<AltTextGenerator />} />
            <Route path="/tools/canonical-url-generator" element={<CanonicalURLGenerator />} />
            <Route path="/tools/sitemap-validator" element={<SitemapValidator />} />
            <Route path="/tools/breadcrumb-generator" element={<BreadcrumbGenerator />} />
            <Route path="/tools/compound-interest-calculator" element={<CompoundInterestCalculator />} />
            <Route path="/tools/tdee-calculator" element={<TDEECalculator />} />
            <Route path="/tools/budget-planner" element={<BudgetPlanner />} />
            <Route path="/tools/savings-goal-calculator" element={<SavingsGoalCalculator />} />
            <Route path="/tools/date-difference-calculator" element={<DateDifferenceCalculator />} />

        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/dmca" element={<DMCA />} />
        <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

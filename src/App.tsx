import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { lazy, Suspense, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { CookieConsent } from "@/components/CookieConsent";
import { applyTheme, getInitialTheme } from "@/utils/theme";
import Index from "./pages/Index";

// Lazy-loaded basic pages
const NotFound = lazy(() => import("./pages/NotFound"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPostDetail = lazy(() => import("./pages/BlogPostDetail"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const DMCA = lazy(() => import("./pages/DMCA"));
const AllTools = lazy(() => import("./pages/AllTools"));
const CategoryTools = lazy(() => import("./pages/CategoryTools"));

// Lazy-loaded tools - Image
const BackgroundRemover = lazy(() => import("./pages/tools/BackgroundRemover"));
const ImageSizeReducer = lazy(() => import("./pages/tools/ImageSizeReducer"));
const ImageToText = lazy(() => import("./pages/tools/ImageToText"));
const ImageResizer = lazy(() => import("./pages/tools/ImageResizer"));
const ImageCropper = lazy(() => import("./pages/tools/ImageCropper"));
const AdvancedImageEditor = lazy(() => import("./pages/tools/AdvancedImageEditor"));
const WatermarkTool = lazy(() => import("./pages/tools/WatermarkTool"));
const PhotoCollageMaker = lazy(() => import("./pages/tools/PhotoCollageMaker"));
const GIFMaker = lazy(() => import("./pages/tools/GIFMaker"));
const MemeGenerator = lazy(() => import("./pages/tools/MemeGenerator"));
const Base64ImageEncoder = lazy(() => import("./pages/tools/Base64ImageEncoder"));
const PNGToJPG = lazy(() => import("./pages/tools/PNGToJPG"));
const JPGToPNG = lazy(() => import("./pages/tools/JPGToPNG"));
const HEICToJPG = lazy(() => import("./pages/tools/HEICToJPG"));
const WebPToPNG = lazy(() => import("./pages/tools/WebPToPNG"));
const AdvancedImageCompressor = lazy(() => import("./pages/tools/AdvancedImageCompressor"));
const SVGToPNG = lazy(() => import("./pages/tools/SVGToPNG"));

// Lazy-loaded tools - PDF
const PDFMerger = lazy(() => import("./pages/tools/PDFMerger"));
const PDFSplitter = lazy(() => import("./pages/tools/PDFSplitter"));
const PDFCompressor = lazy(() => import("./pages/tools/PDFCompressor"));
const PDFEditor = lazy(() => import("./pages/tools/PDFEditor"));
const PDFToText = lazy(() => import("./pages/tools/PDFToText"));
const ImagesToPDF = lazy(() => import("./pages/tools/ImagesToPDF"));
const PDFToImages = lazy(() => import("./pages/tools/PDFToImages"));

// Lazy-loaded tools - Text & Web
const WordCounter = lazy(() => import("./pages/tools/WordCounter"));
const PasswordGenerator = lazy(() => import("./pages/tools/PasswordGenerator"));
const JSONFormatter = lazy(() => import("./pages/tools/JSONFormatter"));
const Base64Encoder = lazy(() => import("./pages/tools/Base64Encoder"));
const URLEncoder = lazy(() => import("./pages/tools/URLEncoder"));
const HashGenerator = lazy(() => import("./pages/tools/HashGenerator"));
const UUIDGenerator = lazy(() => import("./pages/tools/UUIDGenerator"));
const CaseConverter = lazy(() => import("./pages/tools/CaseConverter"));
const MarkdownPreview = lazy(() => import("./pages/tools/MarkdownPreview"));
const HTMLEncoder = lazy(() => import("./pages/tools/HTMLEncoder"));
const LoremIpsumGenerator = lazy(() => import("./pages/tools/LoremIpsumGenerator"));
const TextDiff = lazy(() => import("./pages/tools/TextDiff"));
const RegexTester = lazy(() => import("./pages/tools/RegexTester"));
const CodeBeautifier = lazy(() => import("./pages/tools/CodeBeautifier"));
const ASCIIArtGenerator = lazy(() => import("./pages/tools/ASCIIArtGenerator"));
const CSVToJSON = lazy(() => import("./pages/tools/CSVToJSON"));
const JSONToCSV = lazy(() => import("./pages/tools/JSONToCSV"));
const XMLFormatter = lazy(() => import("./pages/tools/XMLFormatter"));
const YAMLFormatter = lazy(() => import("./pages/tools/YAMLFormatter"));
const SQLFormatter = lazy(() => import("./pages/tools/SQLFormatter"));
const TextToSlug = lazy(() => import("./pages/tools/TextToSlug"));
const APITester = lazy(() => import("./pages/tools/APITester"));
const JSONToYAML = lazy(() => import("./pages/tools/JSONToYAML"));
const CSSMinifier = lazy(() => import("./pages/tools/CSSMinifier"));
const JavaScriptMinifier = lazy(() => import("./pages/tools/JavaScriptMinifier"));
const MarkdownToHTML = lazy(() => import("./pages/tools/MarkdownToHTML"));
const TextToSpeech = lazy(() => import("./pages/tools/TextToSpeech"));
const MorseCodeTranslator = lazy(() => import("./pages/tools/MorseCodeTranslator"));
const LoremIpsumAdvanced = lazy(() => import("./pages/tools/LoremIpsumAdvanced"));
const JSONMinifier = lazy(() => import("./pages/tools/JSONMinifier"));
const HTMLMinifier = lazy(() => import("./pages/tools/HTMLMinifier"));
const XMLSitemapGenerator = lazy(() => import("./pages/tools/XMLSitemapGenerator"));
const TextAnalyzer = lazy(() => import("./pages/tools/TextAnalyzer"));
const HTMLPreview = lazy(() => import("./pages/tools/HTMLPreview"));
const StringReverser = lazy(() => import("./pages/tools/StringReverser"));
const DuplicateRemover = lazy(() => import("./pages/tools/DuplicateRemover"));
const CharacterFrequency = lazy(() => import("./pages/tools/CharacterFrequency"));
const BinaryTranslator = lazy(() => import("./pages/tools/BinaryTranslator"));
const CaesarCipher = lazy(() => import("./pages/tools/CaesarCipher"));
const WhitespaceRemover = lazy(() => import("./pages/tools/WhitespaceRemover"));
const TextSorter = lazy(() => import("./pages/tools/TextSorter"));
const RandomStringGenerator = lazy(() => import("./pages/tools/RandomStringGenerator"));
const FindReplace = lazy(() => import("./pages/tools/FindReplace"));
const TextStatistics = lazy(() => import("./pages/tools/TextStatistics"));
const HTMLEntityEncoder = lazy(() => import("./pages/tools/HTMLEntityEncoder"));
const LineNumberAdder = lazy(() => import("./pages/tools/LineNumberAdder"));
const BracketMatcher = lazy(() => import("./pages/tools/BracketMatcher"));
const TextCompare = lazy(() => import("./pages/tools/TextCompare"));
const TextRephraser = lazy(() => import("./pages/tools/TextRephraser"));
const EssayWriter = lazy(() => import("./pages/tools/EssayWriter"));
const ThesisWriter = lazy(() => import("./pages/tools/ThesisWriter"));
const BlogArticleWriter = lazy(() => import("./pages/tools/BlogArticleWriter"));
const WordScrambler = lazy(() => import("./pages/tools/WordScrambler"));
const JSONValidator = lazy(() => import("./pages/tools/JSONValidator"));

// Lazy-loaded tools - Converters & Utils
const CurrencyConverter = lazy(() => import("./pages/tools/CurrencyConverter"));
const TimestampConverter = lazy(() => import("./pages/tools/TimestampConverter"));
const UnitConverter = lazy(() => import("./pages/tools/UnitConverter"));
const PercentageCalculator = lazy(() => import("./pages/tools/PercentageCalculator"));
const BMICalculator = lazy(() => import("./pages/tools/BMICalculator"));
const IPLookup = lazy(() => import("./pages/tools/IPLookup"));
const PasswordStrengthChecker = lazy(() => import("./pages/tools/PasswordStrengthChecker"));
const ColorConverter = lazy(() => import("./pages/tools/ColorConverter"));
const GradientGenerator = lazy(() => import("./pages/tools/GradientGenerator"));
const ColorPicker = lazy(() => import("./pages/tools/ColorPicker"));
const QRCodeGenerator = lazy(() => import("./pages/tools/QRCodeGenerator"));
const BarcodeGenerator = lazy(() => import("./pages/tools/BarcodeGenerator"));
const QRScanner = lazy(() => import("./pages/tools/QRScanner"));
const BarcodeScanner = lazy(() => import("./pages/tools/BarcodeScanner"));
const WiFiQRGenerator = lazy(() => import("./pages/tools/WiFiQRGenerator"));
const UserAgentParser = lazy(() => import("./pages/tools/UserAgentParser"));
const NumberBaseConverter = lazy(() => import("./pages/tools/NumberBaseConverter"));
const HexConverter = lazy(() => import("./pages/tools/HexConverter"));
const TemperatureConverter = lazy(() => import("./pages/tools/TemperatureConverter"));
const RGBConverter = lazy(() => import("./pages/tools/RGBConverter"));
const IPDetector = lazy(() => import("./pages/tools/IPDetector"));
const ScreenDetector = lazy(() => import("./pages/tools/ScreenDetector"));
const ExcelToCSV = lazy(() => import("./pages/tools/ExcelToCSV"));
const CSVToExcel = lazy(() => import("./pages/tools/CSVToExcel"));
const InvoiceGenerator = lazy(() => import("./pages/tools/InvoiceGenerator"));
const TipCalculator = lazy(() => import("./pages/tools/TipCalculator"));
const DiscountCalculator = lazy(() => import("./pages/tools/DiscountCalculator"));
const LoanCalculator = lazy(() => import("./pages/tools/LoanCalculator"));
const GPACalculator = lazy(() => import("./pages/tools/GPACalculator"));

// Lazy-loaded tools - Video & Media
const VideoTrimmer = lazy(() => import("./pages/tools/VideoTrimmer"));
const VideoToGIF = lazy(() => import("./pages/tools/VideoToGIF"));
const PremiumVideoEditor = lazy(() => import("./pages/tools/PremiumVideoEditor"));
const PremiumVideoCompressor = lazy(() => import("./pages/tools/PremiumVideoCompressor"));
const PremiumVideoMerger = lazy(() => import("./pages/tools/PremiumVideoMerger"));
const PremiumVideoWatermark = lazy(() => import("./pages/tools/PremiumVideoWatermark"));

// Lazy-loaded tools - Generators
const RandomNumberGenerator = lazy(() => import("./pages/tools/RandomNumberGenerator"));
const DiceRoller = lazy(() => import("./pages/tools/DiceRoller"));
const CountdownTimer = lazy(() => import("./pages/tools/CountdownTimer"));
const StopwatchTimer = lazy(() => import("./pages/tools/StopwatchTimer"));
const AgeCalculator = lazy(() => import("./pages/tools/AgeCalculator"));
const PomodoroTimer = lazy(() => import("./pages/tools/PomodoroTimer"));
const CoinFlip = lazy(() => import("./pages/tools/CoinFlip"));
const AdvancedPasswordGenerator = lazy(() => import("./pages/tools/AdvancedPasswordGenerator"));
const HashtagGenerator = lazy(() => import("./pages/tools/HashtagGenerator"));
const BusinessNameGenerator = lazy(() => import("./pages/tools/BusinessNameGenerator"));
const DomainNameGenerator = lazy(() => import("./pages/tools/DomainNameGenerator"));
const EmailSignatureGenerator = lazy(() => import("./pages/tools/EmailSignatureGenerator"));
const InstagramBioGenerator = lazy(() => import("./pages/tools/InstagramBioGenerator"));
const YouTubeTitleGenerator = lazy(() => import("./pages/tools/YouTubeTitleGenerator"));
const FakeDataGenerator = lazy(() => import("./pages/tools/FakeDataGenerator"));
const RandomNameGenerator = lazy(() => import("./pages/tools/RandomNameGenerator"));
const CompanyNameGenerator = lazy(() => import("./pages/tools/CompanyNameGenerator"));
const ProductNameGenerator = lazy(() => import("./pages/tools/ProductNameGenerator"));
const TaglineGenerator = lazy(() => import("./pages/tools/TaglineGenerator"));

// Lazy-loaded tools - AI & SEO
const AIChat = lazy(() => import("./pages/tools/AIChat"));
const EmailValidator = lazy(() => import("./pages/tools/EmailValidator"));
const ResumeBuilder = lazy(() => import("./pages/tools/ResumeBuilder"));
const OpenGraphGenerator = lazy(() => import("./pages/tools/OpenGraphGenerator"));
const KeywordDensity = lazy(() => import("./pages/tools/KeywordDensity"));
const BacklinkChecker = lazy(() => import("./pages/tools/BacklinkChecker"));
const DomainAgeChecker = lazy(() => import("./pages/tools/DomainAgeChecker"));
const WebsiteSpeedTest = lazy(() => import("./pages/tools/WebsiteSpeedTest"));
const KeywordResearchTool = lazy(() => import("./pages/tools/KeywordResearchTool"));
const RobotsTxtGenerator = lazy(() => import("./pages/tools/RobotsTxtGenerator"));
const SchemaMarkupGenerator = lazy(() => import("./pages/tools/SchemaMarkupGenerator"));
const SEOContentAnalyzer = lazy(() => import("./pages/tools/SEOContentAnalyzer"));
const TitleMetaChecker = lazy(() => import("./pages/tools/TitleMetaChecker"));
const HeadingAnalyzer = lazy(() => import("./pages/tools/HeadingAnalyzer"));
const AltTextGenerator = lazy(() => import("./pages/tools/AltTextGenerator"));
const CanonicalURLGenerator = lazy(() => import("./pages/tools/CanonicalURLGenerator"));
const SitemapValidator = lazy(() => import("./pages/tools/SitemapValidator"));
const BreadcrumbGenerator = lazy(() => import("./pages/tools/BreadcrumbGenerator"));
const MetaTagGenerator = lazy(() => import("./pages/tools/MetaTagGenerator"));
const CaptionGenerator = lazy(() => import("./pages/tools/CaptionGenerator"));

// Lazy-loaded tools - Financial & Date
const CompoundInterestCalculator = lazy(() => import("./pages/tools/CompoundInterestCalculator"));
const TDEECalculator = lazy(() => import("./pages/tools/TDEECalculator"));
const BudgetPlanner = lazy(() => import("./pages/tools/BudgetPlanner"));
const SavingsGoalCalculator = lazy(() => import("./pages/tools/SavingsGoalCalculator"));
const DateDifferenceCalculator = lazy(() => import("./pages/tools/DateDifferenceCalculator"));

// Lazy-loaded tools - Others
const CreditCardValidator = lazy(() => import("./pages/tools/CreditCardValidator"));
const RomanNumeralConverter = lazy(() => import("./pages/tools/RomanNumeralConverter"));
const ColorPaletteGenerator = lazy(() => import("./pages/tools/ColorPaletteGenerator"));
const PremiumPlagiarismAITool = lazy(() => import("./pages/tools/PremiumPlagiarismAITool"));
const PremiumPlusWordCounter = lazy(() => import("./pages/tools/PremiumPlusWordCounter"));
const PremiumPlusBatchImageResizer = lazy(() => import("./pages/tools/PremiumPlusBatchImageResizer"));
const PremiumPlusUnitConverter = lazy(() => import("./pages/tools/PremiumPlusUnitConverter"));
const PremiumPlusRandomNumberGenerator = lazy(() => import("./pages/tools/PremiumPlusRandomNumberGenerator"));
const PremiumPlusMultiStopwatch = lazy(() => import("./pages/tools/PremiumPlusMultiStopwatch"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <CookieConsent />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/tools" element={<AllTools />} />
                <Route path="/category/:category" element={<CategoryTools />} />
                <Route path="/tools/background-remover" element={<BackgroundRemover />} />
                <Route path="/tools/qr-code-generator" element={<QRCodeGenerator />} />
                <Route path="/tools/pdf-merger" element={<PDFMerger />} />
                <Route path="/tools/image-size-reducer" element={<ImageSizeReducer />} />
                <Route path="/tools/image-to-text" element={<ImageToText />} />
                <Route path="/tools/word-counter" element={<Navigate to="/tools/premium-plus-word-counter/" replace />} />
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
                <Route path="/tools/unit-converter" element={<Navigate to="/tools/premium-plus-unit-converter/" replace />} />
                <Route path="/tools/percentage-calculator" element={<PercentageCalculator />} />
                <Route path="/tools/bmi-calculator" element={<BMICalculator />} />
                <Route path="/tools/image-resizer" element={<ImageResizer />} />
                <Route path="/tools/image-cropper" element={<ImageCropper />} />
                <Route path="/tools/advanced-image-editor" element={<AdvancedImageEditor />} />
                <Route path="/tools/watermark-tool" element={<WatermarkTool />} />
                <Route path="/tools/watermark" element={<Navigate to="/tools/watermark-tool/" replace />} />
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
                <Route path="/tools/random-number" element={<Navigate to="/tools/premium-plus-random-number-generator/" replace />} />
                <Route path="/tools/dice-roller" element={<DiceRoller />} />
                <Route path="/tools/countdown-timer" element={<CountdownTimer />} />
                <Route path="/tools/stopwatch" element={<Navigate to="/tools/premium-plus-multi-stopwatch/" replace />} />
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
                <Route path="/tools/premium-video-editor" element={<PremiumVideoEditor />} />
                <Route path="/tools/premium-video-compressor" element={<PremiumVideoCompressor />} />
                <Route path="/tools/premium-video-merger" element={<PremiumVideoMerger />} />
                <Route path="/tools/premium-video-watermark" element={<PremiumVideoWatermark />} />
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
                <Route path="/tools/premium-plagiarism-ai-tool" element={<PremiumPlagiarismAITool />} />
                <Route path="/tools/premium-plus-word-counter" element={<PremiumPlusWordCounter />} />
                <Route path="/tools/premium-plus-batch-image-resizer" element={<PremiumPlusBatchImageResizer />} />
                <Route path="/tools/premium-plus-unit-converter" element={<PremiumPlusUnitConverter />} />
                <Route path="/tools/premium-plus-random-number-generator" element={<PremiumPlusRandomNumberGenerator />} />
                <Route path="/tools/premium-plus-multi-stopwatch" element={<PremiumPlusMultiStopwatch />} />
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

                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPostDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/dmca" element={<DMCA />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;

import {
  MessageSquare, Eraser, QrCode, FileDown, Type, Image, DollarSign,
  Zap, Code, Captions, Shield, Wand2, RefreshCw, PenTool, BookOpen,
  Newspaper, Palette, Link2, Hash, Key, FileCode, AlignLeft, Clock,
  GitCompare, Regex, Scale, Percent, Activity, Crop, Laugh,
  FileSpreadsheet, FileJson, Database, Globe, Send, CreditCard,
  Link, Dices, Timer, Calendar, TrendingUp, Barcode, ScanLine,
  Wifi, Camera, Scissors, Minimize2, FileType, Images, Paintbrush,
  FileImage, Video, Brain, Monitor, Coins, Shuffle
} from "lucide-react";

export const allTools = [
  // AI & Content (9)
  { icon: MessageSquare, title: "AI Chat", description: "Chat with AI powered by Google Gemini 2.5 Pro", category: "AI & Content", path: "/tools/ai-chat", popular: true },
  { icon: Captions, title: "Caption Generator", description: "Generate engaging social media captions with AI", category: "AI & Content", path: "/tools/caption-generator" },
  { icon: Shield, title: "Plagiarism Checker", description: "Check text for plagiarism using AI analysis", category: "AI & Content", path: "/tools/plagiarism-checker", popular: true },
  { icon: Wand2, title: "Plagiarism Remover", description: "Rewrite text to remove plagiarism with AI", category: "AI & Content", path: "/tools/plagiarism-remover" },
  { icon: RefreshCw, title: "Text Rephraser", description: "Rephrase text with different tones using AI", category: "AI & Content", path: "/tools/text-rephraser" },
  { icon: PenTool, title: "Essay Writer", description: "Generate academic essays with AI", category: "AI & Content", path: "/tools/essay-writer", popular: true },
  { icon: BookOpen, title: "Thesis Writer", description: "Generate thesis and dissertation content with AI", category: "AI & Content", path: "/tools/thesis-writer" },
  { icon: Newspaper, title: "Blog Article Writer", description: "Generate SEO-optimized blog articles with AI", category: "AI & Content", path: "/tools/blog-article-writer", popular: true },
  { icon: Zap, title: "Text to Speech", description: "Convert text to natural-sounding speech", category: "AI & Content", path: "/tools/text-to-speech" },

  // Image Tools (11)
  { icon: Eraser, title: "Background Remover", description: "Remove image backgrounds instantly with AI", category: "Image Tools", path: "/tools/background-remover", popular: true },
  { icon: Image, title: "Image Compressor", description: "Reduce image file size without losing quality", category: "Image Tools", path: "/tools/image-compressor" },
  { icon: Palette, title: "Color Picker", description: "Pick colors and generate palettes", category: "Image Tools", path: "/tools/color-picker" },
  { icon: Image, title: "Image Resizer", description: "Resize images to custom dimensions", category: "Image Tools", path: "/tools/image-resizer" },
  { icon: Crop, title: "Image Cropper", description: "Crop images to your desired size", category: "Image Tools", path: "/tools/image-cropper" },
  { icon: Laugh, title: "Meme Generator", description: "Create funny memes with custom text", category: "Image Tools", path: "/tools/meme-generator" },
  { icon: FileImage, title: "Base64 Image Encoder", description: "Convert images to Base64 strings", category: "Image Tools", path: "/tools/base64-image" },
  { icon: Palette, title: "Color Converter", description: "Convert between color formats", category: "Image Tools", path: "/tools/color-converter" },
  { icon: Paintbrush, title: "Gradient Generator", description: "Create beautiful CSS gradients", category: "Image Tools", path: "/tools/gradient-generator" },
  { icon: Palette, title: "Color Palette Generator", description: "Generate color palettes from images", category: "Image Tools", path: "/tools/color-palette-generator" },
  { icon: Images, title: "Images to PDF", description: "Convert multiple images to PDF", category: "Image Tools", path: "/tools/images-to-pdf" },

  // Developer Tools (21)
  { icon: Code, title: "JSON Formatter", description: "Format and validate JSON data", category: "Developer Tools", path: "/tools/json-formatter" },
  { icon: Link2, title: "URL Encoder", description: "Encode and decode URLs safely", category: "Developer Tools", path: "/tools/url-encoder" },
  { icon: Hash, title: "Hash Generator", description: "Generate cryptographic hashes", category: "Developer Tools", path: "/tools/hash-generator" },
  { icon: Key, title: "UUID Generator", description: "Generate unique identifiers", category: "Developer Tools", path: "/tools/uuid-generator" },
  { icon: Code, title: "HTML Encoder", description: "Encode or decode HTML entities", category: "Developer Tools", path: "/tools/html-encoder" },
  { icon: Clock, title: "Timestamp Converter", description: "Convert Unix timestamps", category: "Developer Tools", path: "/tools/timestamp-converter" },
  { icon: Regex, title: "Regex Tester", description: "Test regular expressions", category: "Developer Tools", path: "/tools/regex-tester" },
  { icon: Wand2, title: "Code Beautifier", description: "Format JSON, HTML, CSS", category: "Developer Tools", path: "/tools/code-beautifier" },
  { icon: FileSpreadsheet, title: "CSV to JSON", description: "Convert CSV data to JSON format", category: "Developer Tools", path: "/tools/csv-to-json" },
  { icon: FileJson, title: "JSON to CSV", description: "Convert JSON data to CSV format", category: "Developer Tools", path: "/tools/json-to-csv" },
  { icon: Code, title: "XML Formatter", description: "Format and beautify XML code", category: "Developer Tools", path: "/tools/xml-formatter" },
  { icon: FileCode, title: "YAML Formatter", description: "Format and validate YAML files", category: "Developer Tools", path: "/tools/yaml-formatter" },
  { icon: Database, title: "SQL Formatter", description: "Format and beautify SQL queries", category: "Developer Tools", path: "/tools/sql-formatter" },
  { icon: Globe, title: "IP Lookup", description: "Get location and details of any IP", category: "Developer Tools", path: "/tools/ip-lookup" },
  { icon: Send, title: "API Tester", description: "Test REST APIs with custom headers and methods", category: "Developer Tools", path: "/tools/api-tester" },
  { icon: FileJson, title: "JSON to YAML", description: "Convert JSON to YAML format", category: "Developer Tools", path: "/tools/json-to-yaml" },
  { icon: Code, title: "CSS Minifier", description: "Minify CSS code", category: "Developer Tools", path: "/tools/css-minifier" },
  { icon: Code, title: "JavaScript Minifier", description: "Minify JavaScript code", category: "Developer Tools", path: "/tools/javascript-minifier" },
  { icon: Code, title: "JSON Minifier", description: "Minify JSON data", category: "Developer Tools", path: "/tools/json-minifier" },
  { icon: Code, title: "HTML Minifier", description: "Minify HTML code", category: "Developer Tools", path: "/tools/html-minifier" },
  { icon: Code, title: "JSON Validator", description: "Validate JSON syntax", category: "Developer Tools", path: "/tools/json-validator" },

  // QR & Barcodes (5)
  { icon: QrCode, title: "QR Code Generator", description: "Create custom QR codes with logos and colors", category: "QR & Barcodes", path: "/tools/qr-code-generator", popular: true },
  { icon: Barcode, title: "Barcode Generator", description: "Generate various barcode formats", category: "QR & Barcodes", path: "/tools/barcode-generator" },
  { icon: ScanLine, title: "QR Scanner", description: "Scan QR codes from images or camera", category: "QR & Barcodes", path: "/tools/qr-scanner" },
  { icon: ScanLine, title: "Barcode Scanner", description: "Scan and decode barcodes", category: "QR & Barcodes", path: "/tools/barcode-scanner" },
  { icon: Wifi, title: "WiFi QR Generator", description: "Generate WiFi QR codes", category: "QR & Barcodes", path: "/tools/wifi-qr" },

  // PDF Tools (5)
  { icon: FileDown, title: "PDF Merger", description: "Combine multiple PDFs into a single document", category: "PDF Tools", path: "/tools/pdf-merger", popular: true },
  { icon: Scissors, title: "PDF Splitter", description: "Split PDF into multiple files", category: "PDF Tools", path: "/tools/pdf-splitter" },
  { icon: Minimize2, title: "PDF Compressor", description: "Reduce PDF file size", category: "PDF Tools", path: "/tools/pdf-compressor" },
  { icon: FileType, title: "PDF to Text", description: "Extract text from PDF files", category: "PDF Tools", path: "/tools/pdf-to-text" },
  { icon: Images, title: "Images to PDF", description: "Convert images to PDF", category: "PDF Tools", path: "/tools/images-to-pdf" },

  // Text Tools (23)
  { icon: Type, title: "Word Counter", description: "Count words, characters, and analyze text", category: "Text Tools", path: "/tools/word-counter" },
  { icon: Type, title: "Case Converter", description: "Convert text between different cases", category: "Text Tools", path: "/tools/case-converter" },
  { icon: FileCode, title: "Markdown Preview", description: "Write and preview markdown in real-time", category: "Text Tools", path: "/tools/markdown-preview" },
  { icon: AlignLeft, title: "Lorem Ipsum", description: "Generate placeholder text", category: "Text Tools", path: "/tools/lorem-ipsum" },
  { icon: GitCompare, title: "Text Diff", description: "Compare text differences", category: "Text Tools", path: "/tools/text-diff" },
  { icon: Type, title: "ASCII Art Generator", description: "Convert text to ASCII art", category: "Text Tools", path: "/tools/ascii-art" },
  { icon: Link, title: "Text to Slug", description: "Convert text to URL-friendly slugs", category: "Text Tools", path: "/tools/text-to-slug" },
  { icon: FileCode, title: "Markdown to HTML", description: "Convert markdown to HTML", category: "Text Tools", path: "/tools/markdown-to-html" },
  { icon: Code, title: "Morse Code Translator", description: "Translate text to/from Morse code", category: "Text Tools", path: "/tools/morse-code" },
  { icon: Type, title: "Text Analyzer", description: "Analyze text statistics", category: "Text Tools", path: "/tools/text-analyzer" },
  { icon: Type, title: "String Reverser", description: "Reverse any text string", category: "Text Tools", path: "/tools/string-reverser" },
  { icon: Type, title: "Duplicate Remover", description: "Remove duplicate lines", category: "Text Tools", path: "/tools/duplicate-remover" },
  { icon: Type, title: "Character Frequency", description: "Count character frequency", category: "Text Tools", path: "/tools/character-frequency" },
  { icon: Type, title: "Binary Translator", description: "Convert text to/from binary", category: "Text Tools", path: "/tools/binary-translator" },
  { icon: Type, title: "Caesar Cipher", description: "Encrypt/decrypt with Caesar cipher", category: "Text Tools", path: "/tools/caesar-cipher" },
  { icon: Type, title: "Whitespace Remover", description: "Remove extra whitespace", category: "Text Tools", path: "/tools/whitespace-remover" },
  { icon: Type, title: "Text Sorter", description: "Sort lines alphabetically", category: "Text Tools", path: "/tools/text-sorter" },
  { icon: Type, title: "Find & Replace", description: "Find and replace text", category: "Text Tools", path: "/tools/find-replace" },
  { icon: Type, title: "Text Statistics", description: "Get detailed text statistics", category: "Text Tools", path: "/tools/text-statistics" },
  { icon: Type, title: "HTML Entity Encoder", description: "Encode/decode HTML entities", category: "Text Tools", path: "/tools/html-entity-encoder" },
  { icon: Type, title: "Line Number Adder", description: "Add line numbers to text", category: "Text Tools", path: "/tools/line-number-adder" },
  { icon: Type, title: "Text Compare", description: "Compare two texts side by side", category: "Text Tools", path: "/tools/text-compare" },
  { icon: Shuffle, title: "Word Scrambler", description: "Scramble words randomly", category: "Text Tools", path: "/tools/word-scrambler" },

  // Video Tools (3)
  { icon: Scissors, title: "Video Trimmer", description: "Trim and cut videos", category: "Video Tools", path: "/tools/video-trimmer" },
  { icon: Video, title: "Video to GIF", description: "Convert videos to GIF format", category: "Video Tools", path: "/tools/video-to-gif" },
  { icon: Camera, title: "Image to Base64", description: "Convert images to Base64", category: "Video Tools", path: "/tools/image-to-base64" },

  // SEO & Marketing (8)
  { icon: TrendingUp, title: "Meta Tag Generator", description: "Generate SEO meta tags", category: "SEO & Marketing", path: "/tools/meta-tag-generator" },
  { icon: TrendingUp, title: "Open Graph Generator", description: "Generate Open Graph tags", category: "SEO & Marketing", path: "/tools/open-graph-generator" },
  { icon: TrendingUp, title: "Keyword Density", description: "Analyze keyword frequency", category: "SEO & Marketing", path: "/tools/keyword-density" },
  { icon: Link2, title: "Backlink Checker", description: "Check website backlinks", category: "SEO & Marketing", path: "/tools/backlink-checker" },
  { icon: Globe, title: "Domain Age Checker", description: "Check domain age", category: "SEO & Marketing", path: "/tools/domain-age-checker" },
  { icon: Activity, title: "Website Speed Test", description: "Test website loading speed", category: "SEO & Marketing", path: "/tools/website-speed-test" },
  { icon: Code, title: "XML Sitemap Generator", description: "Generate XML sitemaps", category: "SEO & Marketing", path: "/tools/xml-sitemap-generator" },
  { icon: Code, title: "HTML Preview", description: "Preview HTML in real-time", category: "SEO & Marketing", path: "/tools/html-preview" },

  // Calculators (5)
  { icon: DollarSign, title: "Currency Converter", description: "Convert between world currencies", category: "Calculators", path: "/tools/currency-converter" },
  { icon: Scale, title: "Unit Converter", description: "Convert units of measurement", category: "Calculators", path: "/tools/unit-converter" },
  { icon: Percent, title: "Percentage Calculator", description: "Calculate percentages", category: "Calculators", path: "/tools/percentage-calculator" },
  { icon: Activity, title: "BMI Calculator", description: "Calculate Body Mass Index", category: "Calculators", path: "/tools/bmi-calculator" },
  { icon: Calendar, title: "Age Calculator", description: "Calculate your exact age", category: "Calculators", path: "/tools/age-calculator" },

  // Security Tools (3)
  { icon: Key, title: "Password Generator", description: "Generate secure passwords", category: "Security Tools", path: "/tools/password-generator" },
  { icon: Shield, title: "Password Strength", description: "Check password strength", category: "Security Tools", path: "/tools/password-strength" },
  { icon: CreditCard, title: "Credit Card Validator", description: "Validate credit card numbers", category: "Security Tools", path: "/tools/credit-card-validator" },

  // Utilities (9)
  { icon: Dices, title: "Random Number", description: "Generate random numbers", category: "Utilities", path: "/tools/random-number" },
  { icon: Dices, title: "Dice Roller", description: "Roll virtual dice", category: "Utilities", path: "/tools/dice-roller" },
  { icon: Timer, title: "Countdown Timer", description: "Set a countdown timer", category: "Utilities", path: "/tools/countdown-timer" },
  { icon: Clock, title: "Stopwatch", description: "Precise stopwatch timer", category: "Utilities", path: "/tools/stopwatch" },
  { icon: Timer, title: "Pomodoro Timer", description: "Productivity timer", category: "Utilities", path: "/tools/pomodoro-timer" },
  { icon: Type, title: "Random String Generator", description: "Generate random strings", category: "Utilities", path: "/tools/random-string-generator" },
  { icon: Monitor, title: "IP Address Detector", description: "Detect your IP address", category: "Utilities", path: "/tools/ip-detector" },
  { icon: Monitor, title: "Screen Size Detector", description: "Display screen dimensions", category: "Utilities", path: "/tools/screen-detector" },
  { icon: Coins, title: "Coin Flip", description: "Flip a virtual coin", category: "Utilities", path: "/tools/coin-flip" },
];

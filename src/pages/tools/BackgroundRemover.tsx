// pages/BackgroundRemover.tsx
import { useState, useRef } from "react";
import { Link } from "react-router-dom"; // or next/link
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Download,
  Eraser,
  RefreshCw,
  Shield,
  Zap,
  Star,
  CheckCircle2,
  ChevronDown,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SidebarAd } from "@/components/SidebarAd";
import { InFeedAd } from "@/components/InFeedAd";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { ImageEditor } from "@/components/ImageEditor";
import { removeBackground, validateImageFile } from "@/utils/backgroundRemoval";

// Ad slot configurations
const AD_SLOTS = {
  leftSidebar1: "5204253730",
  leftSidebar2: "8153850707",
  rightSidebar1: "4351073152",
  rightSidebar2: "1724909816",
  middle: "6510332635",
  processing: "4159501466",
};

const BackgroundRemover = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [backgroundColor, setBackgroundColor] = useState<string>("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setProcessedImage(null);
      setShowEditor(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile || !selectedImage) {
      toast({
        title: "No Image",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessingStage("Initializing AI model...");

    try {
      toast({
        title: "Processing Started",
        description: "AI is analyzing your image. This may take 10-30 seconds...",
      });

      const resultBlob = await removeBackground(
        selectedFile,
        backgroundColor || undefined,
        (progressValue, stage, message) => {
          setProgress(progressValue);
          setProcessingStage(message);
        }
      );

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProcessedImage(base64);
        setIsProcessing(false);
        setProgress(100);
        setProcessingStage("Complete!");

        toast({
          title: "Success!",
          description: "Background removed successfully!",
        });
      };
      reader.readAsDataURL(resultBlob);
    } catch (error) {
      console.error("Background removal error:", error);
      setIsProcessing(false);

      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove background. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    const timestamp = new Date().getTime();
    link.download = `background-removed-${timestamp}.png`;
    link.href = processedImage;
    link.click();

    toast({
      title: "Downloaded",
      description: "Image saved successfully!",
    });
  };

  const resetAll = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setProcessedImage(null);
    setShowEditor(false);
    setBackgroundColor("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const breadcrumbItems = [
    { label: "Tools", href: "/tools" },
    { label: "Image Tools", href: "/tools/image-tools" },
    { label: "Background Remover", href: "/tools/background-remover", current: true },
  ];

  const faqs = [
    {
      q: "Is this background remover completely free?",
      a: "Yes! Our AI background remover is 100% free with no signup required. You can process unlimited images without any cost, watermarks, or hidden fees.",
    },
    {
      q: "Is my image data safe and private?",
      a: "Absolutely! All image processing happens directly in your browser using client-side AI technology. Your images are never uploaded to any server, ensuring complete privacy and security.",
    },
    {
      q: "What image formats are supported?",
      a: "We support the most common image formats including PNG, JPG/JPEG, and WebP. The maximum file size is 10MB for optimal processing speed.",
    },
    {
      q: "How long does background removal take?",
      a: "Processing typically takes 10-30 seconds depending on the image size and complexity. The AI model runs entirely in your browser for fast, private results.",
    },
    {
      q: "Can I use the images for commercial purposes?",
      a: "Yes! Images you create with our tool are yours to use however you like, including for commercial purposes. We don't retain any rights to your images.",
    },
  ];

  const relatedTools = [
    {
      name: "Image Size Reducer",
      path: "/tools/image-size-reducer",
      desc: "Compress images without quality loss",
    },
    {
      name: "Image Resizer",
      path: "/tools/image-resizer",
      desc: "Resize images to any dimension",
    },
    {
      name: "Image Converter",
      path: "/tools/image-converter",
      desc: "Convert between image formats",
    },
    {
      name: "Image Cropper",
      path: "/tools/image-cropper",
      desc: "Crop images with precision",
    },
  ];

  return (
    <>
      <SEOHead
        title="Free AI Background Remover - Remove Image Background Online Instantly | ToolMaster"
        description="Remove image backgrounds instantly with powerful AI technology. 100% free, no signup required. Process images entirely in your browser for maximum privacy. Best online background remover tool."
        keywords="background remover, remove background, AI background removal, transparent background, free background remover, online background removal, remove image background, background eraser, photo background remover, automatic background removal, free transparent background maker"
        canonical="https://toolmaster.cloud/tools/background-remover"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* AdSense Script - Add to head/layout if not already present */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7382531001943020"
          crossOrigin="anonymous"
        />

        <div className="container mx-auto px-4 py-6 lg:py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />

          {/* Main Layout - 3 Columns on Desktop */}
          <div className="flex gap-6">
            {/* Left Sidebar - Hidden on mobile/tablet */}
            <aside className="hidden lg:flex flex-col gap-6 w-[200px] flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                <SidebarAd slot={AD_SLOTS.leftSidebar1} position="left" index={1} />
                <SidebarAd slot={AD_SLOTS.leftSidebar2} position="left" index={2} />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 max-w-[1000px] mx-auto lg:mx-0 px-4">
              {/* Hero Section */}
              <header className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-Powered Tool</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Free AI Background Remover
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Remove image backgrounds instantly with state-of-the-art AI technology.
                  100% free, no signup required!
                </p>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>100% Private</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>Instant Processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-sm">
                    <Star className="h-4 w-4 text-orange-500" />
                    <span>4.9/5 Rating</span>
                  </div>
                </div>
              </header>

              {/* Main Tool Card */}
              <Card className="p-4 sm:p-6 lg:p-8 space-y-6 shadow-xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                    aria-label="Upload image for background removal"
                  />

                  {!selectedImage ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                      className="border-2 border-dashed border-primary/30 rounded-xl p-8 sm:p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      role="button"
                      aria-label="Click to upload an image"
                      tabIndex={0}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                      </div>
                      <p className="text-lg sm:text-xl font-semibold mb-2">
                        Click to upload image
                      </p>
                      <p className="text-gray-500 mb-4 text-sm sm:text-base">
                        or drag and drop your image here
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Supports PNG, JPG, WebP (Max 10MB)
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm text-green-600 bg-green-50 dark:bg-green-950/30 px-4 py-2 rounded-full">
                        <Shield className="h-4 w-4" />
                        100% Private - All processing in your browser
                      </div>
                    </div>
                  ) : showEditor && processedImage ? (
                    <ImageEditor
                      originalImage={selectedImage}
                      processedImage={processedImage}
                      onDownload={downloadImage}
                    />
                  ) : (
                    <>
                      {!processedImage && (
                        <div className="space-y-3 bg-gradient-to-r from-primary/5 to-purple-500/5 p-4 rounded-xl border border-primary/10">
                          <Label htmlFor="bgColor" className="text-base font-medium">
                            Background Color (Optional)
                          </Label>
                          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <Input
                              id="bgColor"
                              type="color"
                              value={backgroundColor || "#ffffff"}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="w-16 h-10 cursor-pointer p-1 rounded-lg"
                              aria-label="Select background color"
                            />
                            <Input
                              type="text"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              placeholder="Leave empty for transparent"
                              className="flex-1"
                              aria-label="Enter hex color code"
                            />
                            {backgroundColor && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setBackgroundColor("")}
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            💡 Leave empty for transparent background (.png), or choose a
                            color
                          </p>
                        </div>
                      )}

                      {/* Image Preview Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <p className="font-medium mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Original Image
                          </p>
                          <div className="relative aspect-square sm:h-[350px] lg:h-[400px] rounded-xl border-2 shadow-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <img
                              src={selectedImage}
                              alt="Original uploaded image for background removal"
                              className="absolute inset-0 w-full h-full object-contain"
                              loading="eager"
                            />
                          </div>
                        </div>
                        {processedImage && (
                          <div>
                            <p className="font-medium mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              Background Removed
                            </p>
                            <div className="relative aspect-square sm:h-[350px] lg:h-[400px] rounded-xl overflow-hidden shadow-lg">
                              {/* Checkered background for transparency */}
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundImage:
                                    "linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0), linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0)",
                                  backgroundSize: "20px 20px",
                                  backgroundPosition: "0 0, 10px 10px",
                                }}
                                aria-hidden="true"
                              />
                              <img
                                src={processedImage}
                                alt="Image with background removed"
                                className="absolute inset-0 w-full h-full object-contain"
                                loading="eager"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                {!showEditor && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    {selectedImage && !processedImage && (
                      <Button
                        onClick={handleRemoveBackground}
                        disabled={isProcessing}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 w-full sm:w-auto"
                      >
                        <Eraser className="h-5 w-5 mr-2" />
                        {isProcessing ? "Processing..." : "Remove Background"}
                      </Button>
                    )}

                    {selectedImage && (
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="lg"
                        disabled={isProcessing}
                        className="w-full sm:w-auto"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Upload New
                      </Button>
                    )}

                    {processedImage && !showEditor && (
                      <>
                        <Button
                          onClick={downloadImage}
                          size="lg"
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg w-full sm:w-auto"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Download PNG
                        </Button>
                        <Button
                          onClick={() => setShowEditor(true)}
                          size="lg"
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          <ImageIcon className="h-5 w-5 mr-2" />
                          Edit Result
                        </Button>
                        <Button
                          onClick={resetAll}
                          size="lg"
                          variant="ghost"
                          className="w-full sm:w-auto"
                        >
                          <RefreshCw className="h-5 w-5 mr-2" />
                          Start Over
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Privacy Notice */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
                  <h2 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Your Privacy is Our Priority
                  </h2>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    All image processing happens locally in your browser using advanced AI.
                    Your images never leave your device - no uploads, no servers, 100%
                    private and secure.
                  </p>
                </div>
              </Card>

              {/* Middle Ad */}
              <InFeedAd className="my-8" />

              {/* SEO Content Sections */}
              <section className="space-y-8 mt-8">
                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[
                    {
                      icon: Zap,
                      color: "text-yellow-500",
                      bg: "bg-yellow-500/10",
                      title: "Lightning Fast",
                      desc: "Remove backgrounds in seconds with our advanced AI technology.",
                    },
                    {
                      icon: Shield,
                      color: "text-green-500",
                      bg: "bg-green-500/10",
                      title: "100% Private",
                      desc: "Your images are processed entirely in your browser. No uploads.",
                    },
                    {
                      icon: Star,
                      color: "text-orange-500",
                      bg: "bg-orange-500/10",
                      title: "Free Forever",
                      desc: "No signup required, no hidden fees. Use unlimited times free.",
                    },
                  ].map((feature) => (
                    <article
                      key={feature.title}
                      className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border"
                    >
                      <div
                        className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}
                      >
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {feature.desc}
                      </p>
                    </article>
                  ))}
                </div>

                {/* How It Works */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border">
                  <h2 className="text-2xl font-bold text-center mb-8">
                    How to Remove Background from Image
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { step: 1, title: "Upload", desc: "Upload your image (PNG, JPG, WebP)" },
                      { step: 2, title: "Options", desc: "Choose transparent or custom color" },
                      { step: 3, title: "Process", desc: "AI removes the background automatically" },
                      { step: 4, title: "Download", desc: "Get your image instantly" },
                    ].map((item) => (
                      <div key={item.step} className="text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4">
                          {item.step}
                        </div>
                        <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border">
                  <h2 className="text-2xl font-bold text-center mb-8">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3 max-w-3xl mx-auto">
                    {faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                          className="flex items-center justify-between w-full p-4 text-left font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          aria-expanded={expandedFaq === index}
                        >
                          <span className="pr-4">{faq.q}</span>
                          <ChevronDown
                            className={`h-5 w-5 flex-shrink-0 transition-transform ${expandedFaq === index ? "rotate-180" : ""
                              }`}
                          />
                        </button>
                        {expandedFaq === index && (
                          <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Tools - Dofollow Links */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border">
                  <h2 className="text-2xl font-bold text-center mb-8">
                    Related Image Tools
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {relatedTools.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary/5 hover:border-primary border-2 border-transparent transition-all group"
                        title={tool.name}
                      >
                        <h3 className="font-semibold text-primary group-hover:underline mb-1">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tool.desc}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* SEO Content Article */}
                <article className="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border prose prose-gray dark:prose-invert max-w-none">
                  <h2>Best Free Online Background Remover Tool</h2>
                  <p>
                    Our <strong>AI-powered background remover</strong> is the most advanced
                    free tool available online. Whether you need to remove backgrounds from{" "}
                    <strong>product photos</strong>, <strong>portraits</strong>,{" "}
                    <strong>pet pictures</strong>, or any other images, our tool delivers
                    professional-quality results in seconds.
                  </p>

                  <h3>Why Choose Our Background Remover?</h3>
                  <ul>
                    <li>
                      <strong>No signup required</strong> - Start removing backgrounds
                      immediately without creating an account
                    </li>
                    <li>
                      <strong>Unlimited usage</strong> - Process as many images as you need
                      completely free
                    </li>
                    <li>
                      <strong>High-quality results</strong> - Advanced AI for clean, precise
                      cutouts even with complex edges
                    </li>
                    <li>
                      <strong>Privacy-first</strong> - All processing happens locally in
                      your browser
                    </li>
                    <li>
                      <strong>Multiple export options</strong> - Transparent PNG or custom
                      background colors
                    </li>
                  </ul>

                  <h3>Perfect Use Cases</h3>
                  <p>
                    Our background remover is ideal for{" "}
                    <strong>e-commerce product photography</strong>,{" "}
                    <strong>social media content creation</strong>,{" "}
                    <strong>professional headshots</strong>,{" "}
                    <strong>marketing materials</strong>, and{" "}
                    <strong>creative design projects</strong>. The AI handles complex edges
                    like hair, fur, and semi-transparent objects with remarkable precision.
                  </p>

                  <h3>Supported Platforms</h3>
                  <p>
                    Works on all modern browsers including Chrome, Firefox, Safari, and
                    Edge. Fully compatible with Windows, macOS, Linux, iOS, and Android
                    devices.
                  </p>
                </article>
              </section>
            </main>

            {/* Right Sidebar - Hidden on mobile/tablet */}
            <aside className="hidden lg:flex flex-col gap-6 w-[200px] flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                <SidebarAd slot={AD_SLOTS.rightSidebar1} position="right" index={1} />
                <SidebarAd slot={AD_SLOTS.rightSidebar2} position="right" index={2} />
              </div>
            </aside>
          </div>

          {/* Footer with Internal Links */}
          <footer className="border-t mt-12 pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
              <div>
                <h4 className="font-bold mb-4 text-sm sm:text-base">Image Tools</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/tools/background-remover"
                      className="text-gray-600 hover:text-primary"
                    >
                      Background Remover
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/tools/image-resizer"
                      className="text-gray-600 hover:text-primary"
                    >
                      Image Resizer
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/tools/image-converter"
                      className="text-gray-600 hover:text-primary"
                    >
                      Image Converter
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/tools/image-compressor"
                      className="text-gray-600 hover:text-primary"
                    >
                      Image Compressor
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-sm sm:text-base">PDF Tools</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/tools/pdf-to-word"
                      className="text-gray-600 hover:text-primary"
                    >
                      PDF to Word
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/tools/merge-pdf"
                      className="text-gray-600 hover:text-primary"
                    >
                      Merge PDF
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/tools/compress-pdf"
                      className="text-gray-600 hover:text-primary"
                    >
                      Compress PDF
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-sm sm:text-base">Text Tools</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/tools/word-counter"
                      className="text-gray-600 hover:text-primary"
                    >
                      Word Counter
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/tools/case-converter"
                      className="text-gray-600 hover:text-primary"
                    >
                      Case Converter
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-sm sm:text-base">About</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/about" className="text-gray-600 hover:text-primary">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-gray-600 hover:text-primary">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-gray-600 hover:text-primary">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-gray-600 hover:text-primary">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center text-gray-500 text-xs sm:text-sm py-4 border-t">
              <p>© {new Date().getFullYear()} ToolMaster Cloud. All rights reserved.</p>
              <p className="mt-1">Free online tools for everyone. No signup required.</p>
            </div>
          </footer>
        </div>
      </div>

      {/* Processing Overlay with Video Ad */}
      <ProcessingOverlay
        isOpen={isProcessing}
        message={processingStage}
        progress={progress}
        adSlot={AD_SLOTS.processing}
      />
    </>
  );
};

export default BackgroundRemover;
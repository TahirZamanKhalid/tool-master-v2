import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileImage,
  Home,
  ImagePlus,
  Info,
  RefreshCcw,
  Upload,
  X,
  Sliders,
  Crop,
  Layers,
  Palette,
  ZoomIn,
  RotateCcw,
  FlipHorizontal,
  Sun,
  Contrast,
  Droplets,
} from "lucide-react";
import { toast } from "sonner";
 
//import { AdRow } from "@/components/AdRow";
import { ImageEditor } from "@/components/ImageEditor";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
 
/* ─── Types ─────────────────────────────────────────────────── */
 
type ImageMeta = {
  name: string;
  type: string;
  size: number;
  width: number | null;
  height: number | null;
};
 
type PanelKey = "adjust" | "crop" | "filters" | "transform" | "layers";
 
/* ─── Constants ─────────────────────────────────────────────── */
 
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
 
const FAQS = [
  {
    question: "Is the image processed locally in the browser?",
    answer:
      "Yes. The editor loads your file directly in the browser for preview and editing, keeping the experience fast and privacy-friendly.",
  },
  {
    question: "Which file formats are supported?",
    answer:
      "JPG, PNG, WebP, and AVIF uploads are accepted. You can export the final result as a downloadable PNG after editing.",
  },
  {
    question: "Will editing reduce image quality?",
    answer:
      "The editor aims to preserve quality as much as possible. Final quality depends on the adjustments applied and the export format chosen.",
  },
  {
    question: "Can I replace the image without refreshing the page?",
    answer:
      "Yes. Use the Replace button anytime to upload a different image and continue editing without leaving the tool.",
  },
] as const;
 
const TOOL_PANELS: { key: PanelKey; label: string; icon: React.ReactNode; description: string }[] = [
  {
    key: "adjust",
    label: "Adjustments",
    icon: <Sliders className="h-4 w-4" />,
    description: "Brightness, contrast, saturation",
  },
  {
    key: "crop",
    label: "Crop & Resize",
    icon: <Crop className="h-4 w-4" />,
    description: "Crop, rotate, flip, resize",
  },
  {
    key: "filters",
    label: "Filters",
    icon: <Palette className="h-4 w-4" />,
    description: "Presets and color grading",
  },
  {
    key: "transform",
    label: "Transform",
    icon: <ZoomIn className="h-4 w-4" />,
    description: "Scale, zoom, perspective",
  },
  {
    key: "layers",
    label: "Layers",
    icon: <Layers className="h-4 w-4" />,
    description: "Layer management and blend modes",
  },
];
 
const PAGE_TITLE = "Advanced Image Editor – Edit, Adjust and Download Images Online";
const PAGE_DESCRIPTION =
  "Use this advanced image editor to upload, adjust, enhance, and download images online. Fast, browser-based editing with collapsible controls and a clean layout.";
 
/* ─── Helpers ────────────────────────────────────────────────── */
 
const formatBytes = (bytes: number) => {
  if (!bytes) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
};
 
const getDownloadName = (fileName: string | null) => {
  if (!fileName) return "edited-image.png";
  const dotIndex = fileName.lastIndexOf(".");
  const nameWithoutExtension = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  return `${nameWithoutExtension}-edited.png`;
};
 
/* ─── Ad Placeholder ─────────────────────────────────────────── */
// Replace these divs with your real AdSense <ins> tags.
// Dimensions match Google's recommended sidebar slot (160×600 or 300×250).
 

 
/* ─── Collapsible Tool Panel ─────────────────────────────────── */
 
interface CollapsiblePanelProps {
  panelKey: PanelKey;
  label: string;
  icon: React.ReactNode;
  description: string;
  isOpen: boolean;
  onToggle: (key: PanelKey) => void;
  children: React.ReactNode;
  disabled?: boolean;
}
 
const CollapsiblePanel = ({
  panelKey,
  label,
  icon,
  description,
  isOpen,
  onToggle,
  children,
  disabled = false,
}: CollapsiblePanelProps) => (
  <div className="overflow-hidden rounded-xl border bg-card">
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(panelKey)}
      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-primary">{icon}</span>
        <div>
          <p className="text-sm font-medium leading-none">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ChevronDown
        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
 
    {isOpen && (
      <div className="border-t border-border bg-background/60 px-4 pb-4 pt-3">
        {children}
      </div>
    )}
  </div>
);
 
/* ─── Main Component ─────────────────────────────────────────── */
 
const AdvancedImageEditor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openPanel, setOpenPanel] = useState<PanelKey | null>("adjust");
 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
 
  const canonicalUrl = useMemo(() => {
    if (typeof window === "undefined") return "/tools/advanced-image-editor";
    return `${window.location.origin}/tools/advanced-image-editor`;
  }, []);
 
 
 
  const appSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Advanced Image Editor",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      description: PAGE_DESCRIPTION,
      url: canonicalUrl,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    }),
    [canonicalUrl]
  );
 
  /* ── File lifecycle ── */
 
  const clearImageState = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setOriginalImage(null);
    setProcessedImage(null);
    setImageMeta(null);
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);
 
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);
 
  const validateImage = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Unsupported format. Please upload JPG, PNG, WebP, or AVIF.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File too large. Please upload an image under 15 MB.");
      return false;
    }
    return true;
  }, []);
 
  const readImageMeta = useCallback((file: File, src: string) => {
    const img = new Image();
    img.onload = () => {
      setImageMeta({
        name: file.name,
        type: file.type,
        size: file.size,
        width: img.naturalWidth || null,
        height: img.naturalHeight || null,
      });
      setIsLoading(false);
      toast.success("Image uploaded successfully.");
    };
    img.onerror = () => {
      setImageMeta({ name: file.name, type: file.type, size: file.size, width: null, height: null });
      setIsLoading(false);
      toast.success("Image uploaded successfully.");
    };
    img.src = src;
  }, []);
 
  const loadFile = useCallback(
    (file: File) => {
      if (!validateImage(file)) return;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      setIsLoading(true);
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setOriginalImage(objectUrl);
      setProcessedImage(objectUrl);
      readImageMeta(file, objectUrl);
    },
    [readImageMeta, validateImage]
  );
 
  const handleImageUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      loadFile(file);
    },
    [loadFile]
  );
 
  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragActive(false);
      const file = event.dataTransfer.files?.[0];
      if (!file) return;
      loadFile(file);
    },
    [loadFile]
  );
 
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      const pastedFile = Array.from(event.clipboardData?.files || []).find((f) =>
        f.type.startsWith("image/")
      );
      if (!pastedFile) return;
      loadFile(pastedFile);
    },
    [loadFile]
  );
 
  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);
 
  const handleDownload = useCallback(
    (imageData: string) => {
      const link = document.createElement("a");
      link.download = getDownloadName(imageMeta?.name ?? null);
      link.href = imageData;
      link.click();
      toast.success("Image downloaded.");
    },
    [imageMeta?.name]
  );
 
  const togglePanel = useCallback((key: PanelKey) => {
    setOpenPanel((prev) => (prev === key ? null : key));
  }, []);
 
  /* ─── Render ─────────────────────────────────────────────── */
 
  return (
    <ToolLayout
      title="Advanced Image Editor"
      description="Professional browser-based image editor with collapsible controls."
      category="Image Tools"
    >
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta
          name="keywords"
          content="advanced image editor, online photo editor, edit image online, image adjustment tool, free image editor"
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(appSchema)}</script>
       
      </Helmet>
 
      <div className="space-y-4">
 
        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="overflow-x-auto">
          <ol className="flex min-w-max items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <Home className="h-3.5 w-3.5" />
                Home
              </Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
            <li>
              {/* ✅ Fixed: links to the correct Image Tools category page */}
              <Link to="/category/image-tools" className="hover:text-foreground transition-colors">
                Image Tools
              </Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
            <li className="font-medium text-foreground">Advanced Image Editor</li>
          </ol>
        </nav>
 
       
 
        {/* ── Three-column layout: left ad | canvas+tools | right ad ── */}
        <div className="space-y-3">
 
         
 
          {/* ── Centre column: canvas + collapsible tool panels ── */}
          <div className="min-w-0 space-y-3">
 
            {/* Upload zone / image header */}
            <section className="rounded-2xl border bg-card shadow-sm">
              {!originalImage ? (
                /* ── Drop zone ── */
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                    isDragActive ? "border-primary bg-primary/5" : "border-border bg-muted/10"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    onChange={handleImageUpload}
                    className="hidden"
                    aria-label="Upload image file"
                  />
                  <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                    <Upload className="h-7 w-7" />
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight">
                    Upload an image to start editing
                  </h1>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Drag and drop, choose a file, or paste an image directly from your clipboard.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <Button onClick={() => fileInputRef.current?.click()} size="lg" className="gap-2">
                      <ImagePlus className="h-4 w-4" />
                      Choose Image
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() =>
                        toast.info("Copy an image and press Ctrl / Cmd + V to paste it here.")
                      }
                    >
                      Paste Image
                    </Button>
                  </div>
                  <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                    {["JPG", "PNG", "WebP", "AVIF"].map((f) => (
                      <span key={f} className="rounded-full border px-3 py-1">{f}</span>
                    ))}
                    <span className="rounded-full border px-3 py-1">Up to 15 MB</span>
                  </div>
                </div>
              ) : (
                /* ── Image loaded: sticky header + canvas ── */
                <div className="space-y-0">
                  {/* Sticky meta / action bar */}
                  <div className="sticky top-2 z-10 flex flex-col gap-2 rounded-t-2xl border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{imageMeta?.name ?? "Selected image"}</p>
                      <p className="text-xs text-muted-foreground">
                        {imageMeta
                          ? `${formatBytes(imageMeta.size)}${
                              imageMeta.width && imageMeta.height
                                ? ` · ${imageMeta.width} × ${imageMeta.height} px`
                                : ""
                            }`
                          : "Ready for editing"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-1.5"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                        Replace
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearImageState}
                        className="gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear
                      </Button>
                    </div>
                  </div>
 
                  {/* Hidden replace input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    onChange={handleImageUpload}
                    className="hidden"
                    aria-label="Replace image file"
                  />
 
                  {/* Canvas */}
                  <div className="rounded-b-2xl bg-background p-3">
                    {isLoading ? (
                      <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
                        Loading image…
                      </div>
                    ) : (
                      <ImageEditor
                        originalImage={originalImage}
                        processedImage={processedImage}
                        onDownload={handleDownload}
                      />
                    )}
                  </div>
                </div>
              )}
            </section>
 
            {/* ── Collapsible tool panels (only when image loaded) ── */}
            {originalImage && (
              <div className="space-y-2">
                {TOOL_PANELS.map((panel) => (
                  <CollapsiblePanel
                    key={panel.key}
                    panelKey={panel.key}
                    label={panel.label}
                    icon={panel.icon}
                    description={panel.description}
                    isOpen={openPanel === panel.key}
                    onToggle={togglePanel}
                  >
                    {/* 
                      ── CONNECT YOUR REAL TOOL SUB-COMPONENTS HERE ──
                      Each panel passes control to the ImageEditor via props/callbacks.
                      These are placeholder UIs; replace with your actual controls.
                    */}
                    {panel.key === "adjust" && (
                      <div className="space-y-4">
                        {[
                          { label: "Brightness", icon: <Sun className="h-3.5 w-3.5" />, default: 100 },
                          { label: "Contrast", icon: <Contrast className="h-3.5 w-3.5" />, default: 100 },
                          { label: "Saturation", icon: <Droplets className="h-3.5 w-3.5" />, default: 100 },
                        ].map(({ label, icon, default: def }) => (
                          <div key={label}>
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                {icon}{label}
                              </span>
                              <span className="text-xs tabular-nums text-muted-foreground">{def}%</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={200}
                              defaultValue={def}
                              className="h-1.5 w-full cursor-pointer accent-primary"
                            />
                          </div>
                        ))}
                      </div>
                    )}
 
                    {panel.key === "crop" && (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">Aspect ratio presets:</p>
                        <div className="flex flex-wrap gap-2">
                          {["Free", "1:1", "4:3", "16:9", "3:2", "9:16"].map((ratio) => (
                            <button
                              key={ratio}
                              type="button"
                              className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted/40 transition-colors"
                            >
                              {ratio}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <RotateCcw className="h-3.5 w-3.5" />Rotate 90°
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <FlipHorizontal className="h-3.5 w-3.5" />Flip H
                          </Button>
                        </div>
                      </div>
                    )}
 
                    {panel.key === "filters" && (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {["None", "Vivid", "Cool", "Warm", "Mono", "Fade", "Noir", "Sepia"].map((f) => (
                          <button
                            key={f}
                            type="button"
                            className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors hover:bg-muted/40 ${
                              f === "None" ? "border-primary bg-primary/5 text-primary" : ""
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
 
                    {panel.key === "transform" && (
                      <div className="space-y-3">
                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Zoom</span>
                            <span className="text-xs tabular-nums text-muted-foreground">100%</span>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={400}
                            defaultValue={100}
                            className="h-1.5 w-full cursor-pointer accent-primary"
                          />
                        </div>
                      </div>
                    )}
 
                    {panel.key === "layers" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border bg-primary/5 px-3 py-2.5">
                          <span className="text-xs font-medium">Background</span>
                          <span className="text-xs text-muted-foreground">Opacity 100%</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                          + Add Layer
                        </Button>
                      </div>
                    )}
                  </CollapsiblePanel>
                ))}
              </div>
            )}
 
            {/* ── Image details (compact, shown after upload) ── */}
            {imageMeta && (
              <section className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">Image details</h2>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">Name</dt>
                    <dd className="truncate font-medium" title={imageMeta.name}>{imageMeta.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Format</dt>
                    <dd className="font-medium">{imageMeta.type.replace("image/", "").toUpperCase()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Size</dt>
                    <dd className="font-medium">{formatBytes(imageMeta.size)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Dimensions</dt>
                    <dd className="font-medium">
                      {imageMeta.width && imageMeta.height
                        ? `${imageMeta.width} × ${imageMeta.height} px`
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </section>
            )}
 
            {/* ── Quick info (shown before upload) ── */}
            {!originalImage && (
              <section className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">What you can do</h2>
                </div>
                <ul className="grid grid-cols-1 gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                  {[
                    "Drag and drop or paste to upload",
                    "Adjust brightness, contrast & saturation",
                    "Crop with social media presets",
                    "Apply filters and colour grades",
                    "Rotate, flip and transform",
                    "Download as high-quality PNG",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
 
            {/* ── Mid-page ad (between tool area and FAQs) ── */}
            <div className="flex justify-center">
              <div
                aria-label="Advertisement"
                className="flex h-[90px] w-full max-w-[728px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-xs text-muted-foreground"
              >
                <span className="mr-2 text-[10px] uppercase tracking-widest opacity-50">Advertisement</span>
                {/* Replace with real AdSense 728×90 leaderboard */}
                <span className="opacity-40">728 × 90</span>
              </div>
            </div>
 
           
 
          </div>
          {/* end centre column */}
 
          
 
        </div>
      
        {/* end 3-col grid */}
 
       
 
      </div>
    </ToolLayout>
  );
};
 
export default AdvancedImageEditor;
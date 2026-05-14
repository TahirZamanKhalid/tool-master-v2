import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Download,
  FileImage,
  Home,
  ImagePlus,
  Info,
  RefreshCcw,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AdRow } from "@/components/AdRow";
import { ImageEditor } from "@/components/ImageEditor";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";

type ImageMeta = {
  name: string;
  type: string;
  size: number;
  width: number | null;
  height: number | null;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

const FAQS = [
  {
    question: "Is the image processed locally in the browser?",
    answer:
      "Yes. The editor loads your file directly in the browser for preview and editing, which keeps the experience fast and privacy-friendly.",
  },
  {
    question: "Which file formats are supported?",
    answer:
      "This page accepts JPG, PNG, WebP, and AVIF uploads. You can export the final result as a downloadable image after editing.",
  },
  {
    question: "Will editing reduce image quality?",
    answer:
      "The editor aims to preserve quality as much as possible. Final quality depends on the adjustments applied and the export format you choose.",
  },
  {
    question: "Can I replace the image without refreshing the page?",
    answer:
      "Yes. Use the Replace button anytime to upload a different image and continue editing without leaving the tool.",
  },
] as const;

const COMPACT_FEATURES = [
  "Drag and drop upload",
  "Fast browser-based editing",
  "Quick replace and reset actions",
  "High-quality image download",
] as const;

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

const PAGE_TITLE = "Advanced Image Editor - Edit, Adjust and Download Images Online";
const PAGE_DESCRIPTION =
  "Use this advanced image editor to upload, adjust, enhance, and download images online. Fast, browser-based editing with a compact layout and easy controls.";

const AdvancedImageEditor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const canonicalUrl = useMemo(() => {
    if (typeof window === "undefined") return "/tools/advanced-image-editor";
    return `${window.location.origin}/tools/advanced-image-editor`;
  }, []);

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    }),
    []
  );

  const appSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Advanced Image Editor",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      description: PAGE_DESCRIPTION,
      url: canonicalUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [...COMPACT_FEATURES],
    }),
    [canonicalUrl]
  );

  const clearImageState = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setOriginalImage(null);
    setProcessedImage(null);
    setImageMeta(null);
    setIsLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const validateImage = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Unsupported file format. Please upload JPG, PNG, WebP, or AVIF.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("Image is too large. Please upload a file smaller than 15 MB.");
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
      setImageMeta({
        name: file.name,
        type: file.type,
        size: file.size,
        width: null,
        height: null,
      });
      setIsLoading(false);
      toast.success("Image uploaded successfully.");
    };

    img.src = src;
  }, []);

  const loadFile = useCallback(
    (file: File) => {
      if (!validateImage(file)) return;

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

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
      const pastedFile = Array.from(event.clipboardData?.files || []).find((file) =>
        file.type.startsWith("image/")
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
      toast.success("Image downloaded successfully.");
    },
    [imageMeta?.name]
  );

  return (
    <ToolLayout
      title="Advanced Image Editor"
      description="Professional image editing with a cleaner layout, faster upload flow, and SEO-friendly page structure."
      category="Image Tools"
    >
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta
          name="keywords"
          content="advanced image editor, online photo editor, edit image online, image adjustment tool, vite react image tool"
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
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="space-y-4">
        <nav aria-label="Breadcrumb" className="overflow-x-auto">
          <ol className="flex min-w-max items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li>
              <Link to="/tools" className="hover:text-foreground">
                Tools
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li className="text-foreground">Advanced Image Editor</li>
          </ol>
        </nav>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 rounded-2xl border bg-card p-3 shadow-sm sm:p-4 lg:p-5">
            {!originalImage ? (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleDrop}
                className={`flex min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors ${isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/20"
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
                  <Upload className="h-8 w-8" />
                </div>

                <h2 className="text-xl font-semibold tracking-tight">Upload an image to start editing</h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                  Drag and drop an image here, choose a file from your device, or paste an image directly from the clipboard.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Button onClick={() => fileInputRef.current?.click()} size="lg" className="gap-2">
                    <ImagePlus className="h-4 w-4" />
                    Choose Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => toast.info("Tip: copy an image and press Ctrl/Cmd + V to paste it here.")}
                  >
                    Paste Image
                  </Button>
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border px-3 py-1">JPG</span>
                  <span className="rounded-full border px-3 py-1">PNG</span>
                  <span className="rounded-full border px-3 py-1">WebP</span>
                  <span className="rounded-full border px-3 py-1">AVIF</span>
                  <span className="rounded-full border px-3 py-1">Up to 15 MB</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="sticky top-3 z-10 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{imageMeta?.name ?? "Selected image"}</p>
                      <p className="text-sm text-muted-foreground">
                        {imageMeta
                          ? `${formatBytes(imageMeta.size)}${imageMeta.width && imageMeta.height
                            ? ` • ${imageMeta.width} × ${imageMeta.height}px`
                            : ""
                          }`
                          : "Ready for editing"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Replace
                      </Button>
                      <Button variant="outline" onClick={clearImageState} className="gap-2">
                        <X className="h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Replace image file"
                />

                <div className="rounded-xl border bg-background p-2 sm:p-3 lg:p-4">
                  {isLoading ? (
                    <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
                      Loading image...
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

          <aside className="space-y-4">
            <section className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Quick info</h2>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                {COMPACT_FEATURES.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FileImage className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Image details</h2>
              </div>

              {imageMeta ? (
                <dl className="space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="max-w-[180px] truncate text-right font-medium">{imageMeta.name}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-muted-foreground">Format</dt>
                    <dd className="font-medium">{imageMeta.type.replace("image/", "").toUpperCase()}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-muted-foreground">Size</dt>
                    <dd className="font-medium">{formatBytes(imageMeta.size)}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-muted-foreground">Dimensions</dt>
                    <dd className="font-medium">
                      {imageMeta.width && imageMeta.height
                        ? `${imageMeta.width} × ${imageMeta.height}px`
                        : "Unavailable"}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Upload an image to view file size, format, and dimensions.
                </p>
              )}
            </section>

            <section className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Recommended next upgrades</h2>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Undo and redo history for every edit</li>
                <li>Crop presets for social media sizes</li>
                <li>Before/after compare slider</li>
                <li>Export format and quality controls</li>
                <li>Keyboard shortcuts for faster editing</li>
              </ul>
            </section>
          </aside>
        </div>

        <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-lg font-semibold">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.question} className="rounded-xl border bg-background p-4">
                <summary className="cursor-pointer list-none font-medium">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <AdRow />
      </div>
    </ToolLayout>
  );
};

export default AdvancedImageEditor;
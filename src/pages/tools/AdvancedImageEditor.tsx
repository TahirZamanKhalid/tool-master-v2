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
import { Link, Link as RouterLink } from "react-router-dom";
import {
  ChevronRight,
  FileImage,
  Home,
  ImagePlus,
  Info,
  RefreshCcw,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
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

const PAGE_TITLE = "Advanced Image Editor - Edit, Adjust and Download Images Online";
const PAGE_DESCRIPTION =
  "Use this advanced image editor to upload, adjust, enhance, and download images online. Fast, browser-based editing with a full-featured canvas editor.";

const FAQS = [
  {
    question: "Is the image processed locally in the browser?",
    answer:
      "Yes. The editor loads your file directly in the browser for preview and editing, keeping the experience fast and privacy-friendly.",
  },
  {
    question: "Which file formats are supported?",
    answer:
      "JPG, PNG, WebP, and AVIF uploads are accepted. You can export the final result as PNG, JPG, or WebP after editing.",
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

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
};

const AdvancedImageEditor = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Single file input ref, no duplicates.
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
    [canonicalUrl],
  );

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const clearImageState = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImageSrc(null);
    setImageMeta(null);
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      toast.success("Image uploaded.");
    };
    img.src = src;
  }, []);

  const loadFile = useCallback(
    (file: File) => {
      if (!validateImage(file)) return;
      // Revoke previous object URL before creating a new one
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      setIsLoading(true);
      // FIX: clear previous src first so ImageEditor re-mounts cleanly
      setImageSrc(null);
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      // Defer setting src so the null render clears the editor first
      setTimeout(() => {
        setImageSrc(objectUrl);
        readImageMeta(file, objectUrl);
      }, 0);
    },
    [readImageMeta, validateImage],
  );

  const handleImageUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      loadFile(file);
      // FIX: reset input value so same file can be re-selected
      event.target.value = "";
    },
    [loadFile],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragActive(false);
      const file = event.dataTransfer.files?.[0];
      if (!file) return;
      loadFile(file);
    },
    [loadFile],
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      const pastedFile = Array.from(event.clipboardData?.files || []).find((f) =>
        f.type.startsWith("image/"),
      );
      if (!pastedFile) return;
      loadFile(pastedFile);
    },
    [loadFile],
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  return (
    <ToolLayout
      title="Advanced Image Editor"
      description="Professional browser-based image editor with layers, adjustments, filters, and more."
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
        {/* Breadcrumb */}
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
              <Link to="/category/image-tools" className="hover:text-foreground transition-colors">
                Image Tools
              </Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
            <li className="font-medium text-foreground">Advanced Image Editor</li>
          </ol>
        </nav>

        {/* Hidden file input, single instance */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleImageUpload}
          className="hidden"
          aria-label="Upload image file"
        />

        <div className="space-y-3">
          {/* Upload zone OR editor */}
          <section className="rounded-2xl border bg-card shadow-sm">
            {!imageSrc ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={handleDrop}
                className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-border bg-muted/10"
                }`}
              >
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
                    onClick={() => toast.info("Copy an image and press Ctrl / Cmd + V to paste it here.")}
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
              <div className="space-y-0">
                {/* Sticky meta / action bar */}
                <div className="sticky top-2 z-10 flex flex-col gap-2 rounded-t-2xl border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{imageMeta?.name ?? "Selected image"}</p>
                    <p className="text-xs text-muted-foreground">
                      {imageMeta
                        ? `${formatBytes(imageMeta.size)}${
                            imageMeta.width && imageMeta.height
                              ? ` - ${imageMeta.width} x ${imageMeta.height} px`
                              : ""
                          }`
                        : "Ready for editing"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {/* FIX: single Replace button using the single file input ref */}
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

                {/* FIX: ImageEditor receives only the props it actually accepts: src + fileName */}
                <div className="rounded-b-2xl bg-background p-3">
                  {isLoading ? (
                    <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
                      Loading image…
                    </div>
                  ) : (
                    <ImageEditor
                      src={imageSrc}
                      fileName={imageMeta?.name ?? "image"}
                    />
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Image details */}
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
                      ? `${imageMeta.width}  x  ${imageMeta.height} px`
                      : "-"}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {/* Feature list (shown before upload) */}
          {!imageSrc && (
            <section className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">What you can do</h2>
              </div>
              <ul className="grid grid-cols-1 gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                {[
                  "Drag and drop or paste to upload",
                  "Brush, erase, restore and blur tools",
                  "Layers with blend modes and opacity",
                  "Adjustments: brightness, contrast, hue, etc.",
                  "Filters: vivid, sepia, noir, cyberpunk and more",
                  "Crop, rotate, flip, zoom and pan",
                  "Shape and text drawing tools",
                  "Full undo / redo history",
                  "Export as PNG, JPG, or WebP",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* FAQ */}
          <section className="rounded-2xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Frequently asked questions</h2>
            <div className="space-y-3">
              {FAQS.map(({ question, answer }) => (
                <div key={question}>
                  <p className="text-sm font-medium">{question}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Articles & Guides — internal link for SEO */}
          <section className="mt-12 mb-8 w-full">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RouterLink
                to="/blog/advanced-image-editor-free-online-photo-editing"
                className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
              >
                <span className="text-primary font-semibold hover:underline text-lg block">
                  Advanced Image Editor: Free Online Photo Editing
                </span>
                <p className="text-muted-foreground mt-2 text-sm">
                  Edit photos with advanced features like filters, adjustments, and cropper without installing any software.
                </p>
              </RouterLink>
            </div>
          </section>

          {/* Ad placeholder */}
          <div className="flex justify-center">
            <div
              aria-label="Advertisement"
              className="flex h-[90px] w-full max-w-[728px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-xs text-muted-foreground"
            >
              <span className="mr-2 text-[10px] uppercase tracking-widest opacity-50">Advertisement</span>
              <span className="opacity-40">728  x  90</span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default AdvancedImageEditor;

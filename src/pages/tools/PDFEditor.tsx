import { useState, useRef, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
import {
  FileText,
  Download,
  Upload,
  Bold,
  Italic,
  Loader2,
  MousePointer2,
  Type,
  Eraser,
  ZoomIn,
  ZoomOut,
  Trash2,
  Maximize,
} from "lucide-react";
import { AdWatchModal } from "@/components/AdWatchModal";
import { SEOHead } from "@/components/SEOHead";

// Set up PDF.js worker from the local bundle so editing works without a CDN.
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface TextAnnotation {
  id: string;
  type: "text";
  pageIndex: number;
  /** PDF points from left edge (scale-1 coordinates). */
  x: number;
  /** PDF points from top edge — screen-style Y (scale-1 coordinates). */
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold: boolean;
  isItalic: boolean;
}

interface WhiteoutAnnotation {
  id: string;
  type: "whiteout";
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

type Annotation = TextAnnotation | WhiteoutAnnotation;

interface PageDimensions {
  /** Width in PDF points (72 points = 1 inch). */
  width: number;
  /** Height in PDF points. */
  height: number;
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

/** Short random id. */
const uid = () => Math.random().toString(36).slice(2, 10);

/** Convert "#rrggbb" hex to [0‑1, 0‑1, 0‑1]. */
const hexToRgb01 = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
};

/** Map a font family + bold/italic combination to a pdf-lib StandardFont. */
const getStandardFont = (
  family: string,
  bold: boolean,
  italic: boolean,
): string => {
  if (family.includes("Times") || family.includes("Georgia")) {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }
  if (family.includes("Courier")) {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold) return StandardFonts.CourierBold;
    if (italic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }
  // Default — Helvetica (covers Arial, Verdana, etc.)
  if (bold && italic) return StandardFonts.HelveticaBoldOblique;
  if (bold) return StandardFonts.HelveticaBold;
  if (italic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
};

/** Map fontFamily stored in annotation to a CSS font-family string. */
const cssFontFamily = (f: string) => {
  if (f === "Helvetica") return "Arial, Helvetica, sans-serif";
  if (f === "Times New Roman") return "'Times New Roman', Times, serif";
  if (f === "Courier New") return "'Courier New', Courier, monospace";
  return f;
};

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

const PDFEditor = () => {
  /* ── File / PDF state ─────────────────────────────────────────── */
  const [fileName, setFileName] = useState("");
  const [originalPdfBytes, setOriginalPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageDims, setPageDims] = useState<PageDimensions[]>([]);

  /* ── View state ───────────────────────────────────────────────── */
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(false);

  /* ── Tool state ───────────────────────────────────────────────── */
  const [activeTool, setActiveTool] = useState<"select" | "text" | "whiteout">("select");

  /* ── Annotation state ─────────────────────────────────────────── */
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ── Whiteout drawing refs ────────────────────────────────────── */
  const drawRef = useRef<{
    active: boolean;
    pageIndex: number;
    sx: number; sy: number;
    cx: number; cy: number;
  } | null>(null);
  const [drawPreview, setDrawPreview] = useState<{
    pageIndex: number;
    x: number; y: number; w: number; h: number;
  } | null>(null);

  /* ── Annotation drag ref ──────────────────────────────────────── */
  const dragRef = useRef<{
    id: string;
    pageIndex: number;
    offX: number;
    offY: number;
  } | null>(null);

  /* ── Font controls (toolbar state) ────────────────────────────── */
  const [fontSize, setFontSizeStr] = useState("16");
  const [fontFamily, setFontFamily] = useState("Helvetica");
  const [textColor, setTextColor] = useState("#000000");
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);

  /* ── Ad modal ─────────────────────────────────────────────────── */
  const [showAdModal, setShowAdModal] = useState(false);
  const [canDownload, setCanDownload] = useState(false);

  /* ── Refs ──────────────────────────────────────────────────────── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasMap = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  /** Callback-ref factory — stores each page's canvas in a map. */
  const setCanvasRef = useCallback(
    (idx: number) => (el: HTMLCanvasElement | null) => {
      if (el) canvasMap.current.set(idx, el);
      else canvasMap.current.delete(idx);
    },
    [],
  );

  /* ================================================================ */
  /*  Render all PDF pages onto canvases                               */
  /* ================================================================ */

  const renderAllPages = useCallback(async () => {
    if (!pdfDocProxy || numPages === 0) return;
    for (let i = 0; i < numPages; i++) {
      const canvas = canvasMap.current.get(i);
      if (!canvas) continue;
      const page = await pdfDocProxy.getPage(i + 1);
      const vp = page.getViewport({ scale });
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
    }
  }, [pdfDocProxy, numPages, scale]);

  // Re-render whenever the document or zoom changes.
  useEffect(() => {
    if (pdfDocProxy && numPages > 0) {
      const t = setTimeout(() => renderAllPages(), 60);
      return () => clearTimeout(t);
    }
  }, [pdfDocProxy, numPages, scale, renderAllPages]);

  /* ================================================================ */
  /*  Load PDF from raw bytes                                          */
  /* ================================================================ */

  const loadPdfFromBytes = useCallback(
    async (bytes: Uint8Array, name: string, isNew = false) => {
      setIsLoading(true);
      setAnnotations([]);
      setSelectedId(null);
      setEditingId(null);
      drawRef.current = null;
      dragRef.current = null;
      setDrawPreview(null);

      try {
        const task = pdfjsLib.getDocument({ data: bytes.slice() });
        const doc = await task.promise;

        // Pre-compute page dimensions at scale 1.0
        const dims: PageDimensions[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const p = await doc.getPage(i);
          const v = p.getViewport({ scale: 1.0 });
          dims.push({ width: v.width, height: v.height });
        }

        setPageDims(dims);
        setOriginalPdfBytes(bytes);
        setPdfDocProxy(doc);
        setNumPages(doc.numPages);
        setFileName(name);

        toast.success(
          isNew
            ? "New blank document created"
            : `PDF loaded — ${doc.numPages} page${doc.numPages > 1 ? "s" : ""}`,
        );
      } catch (err) {
        console.error("Error loading PDF:", err);
        toast.error("Failed to load PDF. Please try a different file.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /* ================================================================ */
  /*  File upload handler                                              */
  /* ================================================================ */

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !file.type.includes("pdf") &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Please upload a PDF file");
      return;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    await loadPdfFromBytes(bytes, file.name.replace(/\.pdf$/i, ""));
    e.target.value = "";
  };

  /* ================================================================ */
  /*  New blank document                                               */
  /* ================================================================ */

  const createNewDocument = async () => {
    const newDoc = await PDFDocument.create();
    newDoc.addPage([595.28, 841.89]); // A4 in points
    const bytes = await newDoc.save();
    await loadPdfFromBytes(new Uint8Array(bytes), "new-document", true);
  };

  /* ================================================================ */
  /*  Coordinate helper                                                */
  /* ================================================================ */

  /** Convert a mouse event on a page-wrapper to PDF-point coords. */
  const pdfCoords = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  /* ================================================================ */
  /*  Page-level mouse handlers                                        */
  /* ================================================================ */

  const handlePageMouseDown = (e: React.MouseEvent, pageIdx: number) => {
    // Only react to clicks landing directly on the canvas / wrapper
    const t = e.target as HTMLElement;
    if (!t.closest("canvas") && !t.classList.contains("pdf-page-wrapper"))
      return;

    const { x, y } = pdfCoords(e);

    if (activeTool === "text") {
      const ann: TextAnnotation = {
        id: uid(),
        type: "text",
        pageIndex: pageIdx,
        x, y,
        text: "",
        fontSize: parseInt(fontSize),
        fontFamily,
        color: textColor,
        isBold: isBoldActive,
        isItalic: isItalicActive,
      };
      setAnnotations((prev) => [...prev, ann]);
      setSelectedId(ann.id);
      setEditingId(ann.id);
      return;
    }

    if (activeTool === "whiteout") {
      drawRef.current = {
        active: true,
        pageIndex: pageIdx,
        sx: x, sy: y,
        cx: x, cy: y,
      };
      return;
    }

    // Select tool on empty space — deselect
    setSelectedId(null);
    setEditingId(null);
  };

  const handlePageMouseMove = (e: React.MouseEvent, pageIdx: number) => {
    const { x, y } = pdfCoords(e);

    // Whiteout drawing
    if (drawRef.current?.active && drawRef.current.pageIndex === pageIdx) {
      drawRef.current.cx = x;
      drawRef.current.cy = y;
      const d = drawRef.current;
      setDrawPreview({
        pageIndex: pageIdx,
        x: Math.min(d.sx, x),
        y: Math.min(d.sy, y),
        w: Math.abs(x - d.sx),
        h: Math.abs(y - d.sy),
      });
    }

    // Annotation drag
    if (dragRef.current && dragRef.current.pageIndex === pageIdx) {
      const nx = Math.max(0, x - dragRef.current.offX);
      const ny = Math.max(0, y - dragRef.current.offY);
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === dragRef.current!.id ? { ...a, x: nx, y: ny } : a,
        ),
      );
    }
  };

  /* Global mouseup — finalise drawing / dragging regardless of target */
  useEffect(() => {
    const onUp = () => {
      // Finalise whiteout rectangle
      if (drawRef.current?.active) {
        const d = drawRef.current;
        const w = Math.abs(d.cx - d.sx);
        const h = Math.abs(d.cy - d.sy);
        if (w > 3 && h > 3) {
          const ann: WhiteoutAnnotation = {
            id: uid(),
            type: "whiteout",
            pageIndex: d.pageIndex,
            x: Math.min(d.sx, d.cx),
            y: Math.min(d.sy, d.cy),
            width: w,
            height: h,
          };
          setAnnotations((prev) => [...prev, ann]);
          setSelectedId(ann.id);
        }
        drawRef.current = null;
        setDrawPreview(null);
      }
      // End drag
      dragRef.current = null;
    };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);

  /* ================================================================ */
  /*  Annotation interaction                                           */
  /* ================================================================ */

  const handleAnnotationMouseDown = (
    e: React.MouseEvent,
    ann: Annotation,
  ) => {
    e.stopPropagation(); // don't let the page handler fire

    if (activeTool !== "select" && activeTool !== "text") return;

    setSelectedId(ann.id);

    // If we're not already editing this one, close editing and start drag
    if (editingId !== ann.id) {
      setEditingId(null);
      const wrapper = (e.currentTarget as HTMLElement).closest(
        ".pdf-page-wrapper",
      );
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / scale;
        const my = (e.clientY - rect.top) / scale;
        dragRef.current = {
          id: ann.id,
          pageIndex: ann.pageIndex,
          offX: mx - ann.x,
          offY: my - ann.y,
        };
      }
    }
  };

  const handleAnnotationDblClick = (
    e: React.MouseEvent,
    ann: Annotation,
  ) => {
    e.stopPropagation();
    if (ann.type === "text") {
      setSelectedId(ann.id);
      setEditingId(ann.id);
    }
  };

  const handleTextInput = (id: string, text: string) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id && a.type === "text" ? { ...a, text } : a)),
    );
  };

  const handleTextBlur = (id: string) => {
    if (editingId === id) setEditingId(null);
  };

  const deleteSelected = useCallback(() => {
    setAnnotations((prev) => prev.filter((a) => a.id !== selectedId));
    setSelectedId(null);
    setEditingId(null);
  }, [selectedId]);

  /* ================================================================ */
  /*  Update the selected text annotation's styles                     */
  /* ================================================================ */

  const updateSelected = (patch: Partial<TextAnnotation>) => {
    if (!selectedId) return;
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id === selectedId && a.type === "text" ? { ...a, ...patch } : a,
      ),
    );
  };

  /** Sync toolbar controls when a new annotation is selected. */
  useEffect(() => {
    if (!selectedId) return;
    const ann = annotations.find((a) => a.id === selectedId);
    if (ann?.type === "text") {
      setFontSizeStr(String(ann.fontSize));
      setFontFamily(ann.fontFamily);
      setTextColor(ann.color);
      setIsBoldActive(ann.isBold);
      setIsItalicActive(ann.isItalic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  /* ================================================================ */
  /*  Keyboard shortcuts                                               */
  /* ================================================================ */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedId && editingId !== selectedId) {
        e.preventDefault();
        deleteSelected();
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        setEditingId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, editingId, deleteSelected]);

  /* ================================================================ */
  /*  Download / generate modified PDF                                 */
  /* ================================================================ */

  const handleDownload = () => {
    if (!originalPdfBytes) {
      toast.error("No PDF loaded");
      return;
    }
    if (!canDownload) {
      setShowAdModal(true);
      return;
    }
    generatePDF();
  };

  const generatePDF = async () => {
    if (!originalPdfBytes) return;

    try {
      const doc = await PDFDocument.load(originalPdfBytes);
      const pages = doc.getPages();

      // Cache embedded fonts to avoid re-embedding
      const fontCache = new Map<string, Awaited<ReturnType<typeof doc.embedFont>>>();

      for (const ann of annotations) {
        const page = pages[ann.pageIndex];
        if (!page) continue;
        const { height: ph } = page.getSize();

        if (ann.type === "whiteout") {
          // Draw a filled white rectangle (covers original content)
          page.drawRectangle({
            x: ann.x,
            y: ph - ann.y - ann.height,
            width: ann.width,
            height: ann.height,
            color: rgb(1, 1, 1),
            borderWidth: 0,
          });
        } else if (ann.type === "text" && ann.text.trim()) {
          const fk = getStandardFont(ann.fontFamily, ann.isBold, ann.isItalic);
          if (!fontCache.has(fk)) {
            fontCache.set(fk, await doc.embedFont(fk));
          }
          const font = fontCache.get(fk)!;
          const [r, g, b] = hexToRgb01(ann.color);

          // Handle multi-line text
          const lines = ann.text.split("\n");
          let yOff = 0;
          for (const line of lines) {
            if (line.length > 0) {
              page.drawText(line, {
                x: ann.x,
                y: ph - ann.y - ann.fontSize - yOff,
                size: ann.fontSize,
                font,
                color: rgb(r, g, b),
              });
            }
            yOff += ann.fontSize * 1.3; // matches CSS lineHeight: 1.3
          }
        }
      }

      const modified = await doc.save();
      const blob = new Blob([modified], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName || "edited-document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to generate PDF");
    }
  };

  /* ================================================================ */
  /*  Zoom controls                                                    */
  /* ================================================================ */

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const fitWidth = () => {
    if (!containerRef.current || pageDims.length === 0) return;
    const cw = containerRef.current.clientWidth - 48; // account for padding
    const pw = pageDims[0].width;
    if (pw > 0) setScale(cw / pw);
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  const TOOLS: { key: typeof activeTool; Icon: typeof Type; label: string }[] = [
    { key: "select", Icon: MousePointer2, label: "Select" },
    { key: "text", Icon: Type, label: "Text" },
    { key: "whiteout", Icon: Eraser, label: "Whiteout" },
  ];

  return (
    <>
      <SEOHead
        title="PDF Editor - Edit PDF Documents Online"
        description="Edit PDF files online. Add text, whiteout content, and download with original formatting preserved."
        keywords="pdf editor, edit pdf, online pdf editor, modify pdf, annotate pdf"
        canonical="https://toolmaster.cloud/tools/pdf-editor"
      />

      <ToolLayout
        title="PDF Editor"
        description="Edit PDF documents — add text, whiteout content, and download with original formatting preserved"
        category="PDF Tools"
        instructions={[
          "Upload a PDF file to see it rendered exactly as-is",
          "Use the Text tool to click anywhere and add text",
          "Use the Whiteout tool to cover original content (click & drag)",
          "Use Select to move or edit annotations (double-click to edit text)",
          "Download your modified PDF with all changes applied",
        ]}
        relatedTools={[
          { name: "PDF Merger", path: "/tools/pdf-merger" },
          { name: "PDF Splitter", path: "/tools/pdf-splitter" },
          { name: "Resume Builder", path: "/tools/resume-builder" },
        ]}
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            {/* ─── File Operations ─────────────────────────────── */}
            <div className="flex flex-wrap gap-2 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload PDF
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={createNewDocument}
                disabled={isLoading}
              >
                <FileText className="h-4 w-4 mr-2" />
                New Document
              </Button>

              <Button
                size="sm"
                className="ml-auto"
                onClick={handleDownload}
                disabled={isLoading || !originalPdfBytes}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <Separator />

            {/* ─── Tools & Formatting Toolbar ──────────────────── */}
            {originalPdfBytes && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Tool selector group */}
                  <div className="flex gap-0.5 border rounded-lg p-0.5 bg-muted/40">
                    {TOOLS.map(({ key, Icon, label }) => (
                      <Button
                        key={key}
                        variant={activeTool === key ? "default" : "ghost"}
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => setActiveTool(key)}
                        title={label}
                      >
                        <Icon className="h-3.5 w-3.5 mr-1" />
                        {label}
                      </Button>
                    ))}
                  </div>

                  <div className="h-6 w-px bg-border" />

                  {/* Font family */}
                  <Select
                    value={fontFamily}
                    onValueChange={(v) => {
                      setFontFamily(v);
                      updateSelected({ fontFamily: v });
                    }}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Font size */}
                  <Select
                    value={fontSize}
                    onValueChange={(v) => {
                      setFontSizeStr(v);
                      updateSelected({ fontSize: parseInt(v) });
                    }}
                  >
                    <SelectTrigger className="w-[65px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map(
                        (s) => (
                          <SelectItem key={s} value={String(s)}>
                            {s}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>

                  <div className="h-6 w-px bg-border" />

                  {/* Bold */}
                  <Button
                    variant={isBoldActive ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const next = !isBoldActive;
                      setIsBoldActive(next);
                      updateSelected({ isBold: next });
                    }}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>

                  {/* Italic */}
                  <Button
                    variant={isItalicActive ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const next = !isItalicActive;
                      setIsItalicActive(next);
                      updateSelected({ isItalic: next });
                    }}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>

                  {/* Color */}
                  <div className="flex items-center gap-1">
                    <Label className="text-xs">Color:</Label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        updateSelected({ color: e.target.value });
                      }}
                      className="h-8 w-10 cursor-pointer rounded border"
                    />
                  </div>

                  <div className="h-6 w-px bg-border" />

                  {/* Zoom */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={zoomOut}
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-mono w-12 text-center select-none">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={zoomIn}
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={fitWidth}
                    title="Fit Width"
                  >
                    <Maximize className="h-3.5 w-3.5" />
                  </Button>

                  <div className="h-6 w-px bg-border" />

                  {/* Delete selected */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={deleteSelected}
                    disabled={!selectedId}
                    title="Delete (Del)"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />
              </>
            )}

            {/* ─── PDF Pages Area ──────────────────────────────── */}
            <div
              ref={containerRef}
              className="overflow-auto rounded-lg"
              style={{
                maxHeight: "75vh",
                background: originalPdfBytes
                  ? "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)"
                  : undefined,
              }}
            >
              {/* Loading spinner */}
              {isLoading && (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading PDF…</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This may take a moment for large files
                    </p>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !originalPdfBytes && (
                <div
                  className="flex flex-col items-center justify-center min-h-[500px] cursor-pointer border-2 border-dashed border-muted-foreground/30 rounded-lg m-4 hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">
                    Upload a PDF to get started
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Or click &quot;New Document&quot; to create a blank page
                  </p>
                </div>
              )}

              {/* Rendered pages */}
              {!isLoading && numPages > 0 && (
                <div className="flex flex-col items-center gap-6 py-6 px-4">
                  {Array.from({ length: numPages }, (_, pageIdx) => {
                    const dim = pageDims[pageIdx];
                    const wPx = dim ? dim.width * scale : undefined;
                    const hPx = dim ? dim.height * scale : undefined;

                    return (
                      <div
                        key={pageIdx}
                        className="pdf-page-wrapper relative bg-white shadow-xl rounded-sm"
                        style={{
                          width: wPx,
                          height: hPx,
                          cursor:
                            activeTool === "text" || activeTool === "whiteout"
                              ? "crosshair"
                              : "default",
                          overflow: "hidden",
                        }}
                        onMouseDown={(e) => handlePageMouseDown(e, pageIdx)}
                        onMouseMove={(e) => handlePageMouseMove(e, pageIdx)}
                      >
                        {/* The PDF page canvas */}
                        <canvas
                          ref={setCanvasRef(pageIdx)}
                          style={{ display: "block" }}
                        />

                        {/* ── Whiteout annotations ─────────────── */}
                        {annotations
                          .filter(
                            (a) =>
                              a.pageIndex === pageIdx && a.type === "whiteout",
                          )
                          .map((a) => {
                            const wa = a as WhiteoutAnnotation;
                            return (
                              <div
                                key={wa.id}
                                style={{
                                  position: "absolute",
                                  left: wa.x * scale,
                                  top: wa.y * scale,
                                  width: wa.width * scale,
                                  height: wa.height * scale,
                                  backgroundColor: "white",
                                  cursor:
                                    activeTool === "select" ? "move" : undefined,
                                  boxShadow:
                                    selectedId === wa.id
                                      ? "0 0 0 2px #3b82f6"
                                      : undefined,
                                }}
                                onMouseDown={(e) =>
                                  handleAnnotationMouseDown(e, wa)
                                }
                              />
                            );
                          })}

                        {/* ── Text annotations ─────────────────── */}
                        {annotations
                          .filter(
                            (a) =>
                              a.pageIndex === pageIdx && a.type === "text",
                          )
                          .map((a) => {
                            const ta = a as TextAnnotation;
                            const isEd = editingId === ta.id;
                            const isSel = selectedId === ta.id;

                            const textStyle: React.CSSProperties = {
                              fontSize: ta.fontSize * scale,
                              fontFamily: cssFontFamily(ta.fontFamily),
                              fontWeight: ta.isBold ? "bold" : "normal",
                              fontStyle: ta.isItalic ? "italic" : "normal",
                              color: ta.color,
                              lineHeight: 1.3,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            };

                            return (
                              <div
                                key={ta.id}
                                style={{
                                  position: "absolute",
                                  left: ta.x * scale,
                                  top: ta.y * scale,
                                  cursor:
                                    activeTool === "select"
                                      ? "move"
                                      : "text",
                                  boxShadow: isSel
                                    ? "0 0 0 2px #3b82f6"
                                    : undefined,
                                  borderRadius: 2,
                                  minWidth: 4,
                                  minHeight: ta.fontSize * scale,
                                }}
                                onMouseDown={(e) =>
                                  handleAnnotationMouseDown(e, ta)
                                }
                                onDoubleClick={(e) =>
                                  handleAnnotationDblClick(e, ta)
                                }
                              >
                                {isEd ? (
                                  /* Editing mode — contentEditable div */
                                  <div
                                    key={`edit-${ta.id}`}
                                    contentEditable
                                    suppressContentEditableWarning
                                    ref={(el) => {
                                      if (el && !el.dataset.init) {
                                        el.innerText = ta.text;
                                        el.dataset.init = "1";
                                        requestAnimationFrame(() => {
                                          el.focus();
                                          const r = document.createRange();
                                          r.selectNodeContents(el);
                                          r.collapse(false);
                                          const s = window.getSelection();
                                          s?.removeAllRanges();
                                          s?.addRange(r);
                                        });
                                      }
                                    }}
                                    onInput={(e) =>
                                      handleTextInput(
                                        ta.id,
                                        (e.target as HTMLElement).innerText,
                                      )
                                    }
                                    onBlur={() => handleTextBlur(ta.id)}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    style={{
                                      ...textStyle,
                                      outline: "none",
                                      minWidth: 60,
                                      padding: "2px 4px",
                                      background: "rgba(255,255,255,0.9)",
                                      borderRadius: 2,
                                    }}
                                  />
                                ) : (
                                  /* Display mode */
                                  <div
                                    style={{
                                      ...textStyle,
                                      userSelect: "none",
                                      padding: 0,
                                    }}
                                  >
                                    {ta.text || "\u00A0"}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                        {/* ── Whiteout draw preview ────────────── */}
                        {drawPreview && drawPreview.pageIndex === pageIdx && (
                          <div
                            style={{
                              position: "absolute",
                              left: drawPreview.x * scale,
                              top: drawPreview.y * scale,
                              width: drawPreview.w * scale,
                              height: drawPreview.h * scale,
                              border: "2px dashed #3b82f6",
                              backgroundColor: "rgba(255,255,255,0.7)",
                              pointerEvents: "none",
                            }}
                          />
                        )}

                        {/* ── Page number badge ────────────────── */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            background: "rgba(0,0,0,0.5)",
                            color: "white",
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 4,
                            pointerEvents: "none",
                            userSelect: "none",
                          }}
                        >
                          Page {pageIdx + 1} / {numPages}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─── Tips ─────────────────────────────────────────── */}
            <div className="text-sm text-muted-foreground">
              <strong>Tips:</strong> Use the <strong>Text</strong> tool to click
              anywhere and add text. Use <strong>Whiteout</strong> to cover
              original content (click &amp; drag). Use <strong>Select</strong>{" "}
              to move annotations. Double-click text to edit. Press{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Del</kbd>{" "}
              to remove selected annotation.
            </div>
          </CardContent>
        </Card>

        {/* ─── Help Card ───────────────────────────────────────── */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              How to Use PDF Editor
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Adding Text
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Select the <strong>Text</strong> tool</li>
                  <li>Click anywhere on the PDF page</li>
                  <li>Type your text in the box that appears</li>
                  <li>Use the toolbar to change font, size, and color</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Whiteout / Erase
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Select the <strong>Whiteout</strong> tool</li>
                  <li>Click &amp; drag to draw a white rectangle</li>
                  <li>This covers the original content underneath</li>
                  <li>Add new text on top if needed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Select &amp; Move
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use the <strong>Select</strong> tool</li>
                  <li>Click an annotation to select it</li>
                  <li>Drag to reposition it</li>
                  <li>Double-click text to edit it</li>
                  <li>
                    Press{" "}
                    <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                      Del
                    </kbd>{" "}
                    to delete
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </ToolLayout>

      {/* ─── Ad Watch Modal ────────────────────────────────────── */}
      <AdWatchModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        onAdWatched={() => {
          setCanDownload(true);
          setShowAdModal(false);
          generatePDF();
        }}
        title="Watch ad to download your PDF"
        description="Please watch this short ad to download your edited PDF document."
      />
    </>
  );
};

export default PDFEditor;

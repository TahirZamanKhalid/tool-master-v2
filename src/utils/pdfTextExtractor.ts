// utils/pdfTextExtractor.ts
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

export interface TextStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: "normal" | "bold";
    fontStyle: "normal" | "italic";
    color: string;
    backgroundColor?: string;
    letterSpacing?: number;
    transform?: string;
}

export interface StyledTextItem {
    text: string;
    style: TextStyle;
    x: number;
    y: number;
    width: number;
    height: number;
    pageIndex: number;
    lineIndex: number;
}

export interface TextLine {
    items: StyledTextItem[];
    y: number;
    pageIndex: number;
}

export interface PageContent {
    pageNumber: number;
    width: number;
    height: number;
    lines: TextLine[];
    rawText: string;
}

export interface ExtractionResult {
    pages: PageContent[];
    totalPages: number;
    metadata: {
        title?: string;
        author?: string;
        subject?: string;
        creator?: string;
        creationDate?: string;
        modificationDate?: string;
    };
    fonts: Map<string, FontInfo>;
}

export interface FontInfo {
    name: string;
    family: string;
    weight: string;
    style: string;
    isMonospace: boolean;
    isSerif: boolean;
}

// Font mapping for common PDF fonts to web fonts
const FONT_MAPPING: Record<string, string> = {
    "Helvetica": "Arial, Helvetica, sans-serif",
    "Helvetica-Bold": "Arial, Helvetica, sans-serif",
    "Helvetica-Oblique": "Arial, Helvetica, sans-serif",
    "Helvetica-BoldOblique": "Arial, Helvetica, sans-serif",
    "Times-Roman": "Times New Roman, Times, serif",
    "Times-Bold": "Times New Roman, Times, serif",
    "Times-Italic": "Times New Roman, Times, serif",
    "Times-BoldItalic": "Times New Roman, Times, serif",
    "Courier": "Courier New, Courier, monospace",
    "Courier-Bold": "Courier New, Courier, monospace",
    "Courier-Oblique": "Courier New, Courier, monospace",
    "Courier-BoldOblique": "Courier New, Courier, monospace",
    "Arial": "Arial, Helvetica, sans-serif",
    "Arial-Bold": "Arial, Helvetica, sans-serif",
    "Georgia": "Georgia, serif",
    "Verdana": "Verdana, sans-serif",
    "Tahoma": "Tahoma, sans-serif",
    "Trebuchet": "Trebuchet MS, sans-serif",
    "Symbol": "Symbol, serif",
    "ZapfDingbats": "ZapfDingbats, serif",
};

// Parse font name to extract weight and style
function parseFontName(fontName: string): { family: string; weight: string; style: string } {
    const name = fontName.toLowerCase();
    let weight = "normal";
    let style = "normal";
    let family = fontName;

    // Check for weight indicators
    if (name.includes("bold") || name.includes("black") || name.includes("heavy")) {
        weight = "bold";
    } else if (name.includes("light") || name.includes("thin")) {
        weight = "300";
    } else if (name.includes("medium")) {
        weight = "500";
    } else if (name.includes("semibold") || name.includes("demibold")) {
        weight = "600";
    }

    // Check for style indicators
    if (name.includes("italic") || name.includes("oblique")) {
        style = "italic";
    }

    // Clean up family name
    family = fontName
        .replace(/[-_](bold|italic|oblique|light|medium|regular|normal|thin|black|heavy|semibold|demibold)/gi, "")
        .replace(/,.*$/, "")
        .replace(/\+/g, " ")
        .trim();

    // Map to web-safe font
    const mappedFont = FONT_MAPPING[fontName] || FONT_MAPPING[family];
    if (mappedFont) {
        family = mappedFont;
    } else {
        // Add fallback fonts based on characteristics
        if (name.includes("mono") || name.includes("courier") || name.includes("console")) {
            family = `"${family}", Courier New, monospace`;
        } else if (name.includes("serif") || name.includes("times") || name.includes("georgia")) {
            family = `"${family}", Times New Roman, serif`;
        } else {
            family = `"${family}", Arial, sans-serif`;
        }
    }

    return { family, weight, style };
}

// Convert PDF color array to CSS color
function pdfColorToCSS(color: number[] | undefined): string {
    if (!color || color.length === 0) return "#000000";

    if (color.length === 1) {
        // Grayscale
        const gray = Math.round(color[0] * 255);
        return `rgb(${gray}, ${gray}, ${gray})`;
    } else if (color.length === 3) {
        // RGB
        const r = Math.round(color[0] * 255);
        const g = Math.round(color[1] * 255);
        const b = Math.round(color[2] * 255);
        return `rgb(${r}, ${g}, ${b})`;
    } else if (color.length === 4) {
        // CMYK - convert to RGB
        const c = color[0];
        const m = color[1];
        const y = color[2];
        const k = color[3];
        const r = Math.round(255 * (1 - c) * (1 - k));
        const g = Math.round(255 * (1 - m) * (1 - k));
        const b = Math.round(255 * (1 - y) * (1 - k));
        return `rgb(${r}, ${g}, ${b})`;
    }

    return "#000000";
}

// Group text items into lines based on Y position
function groupIntoLines(items: StyledTextItem[], tolerance: number = 5): TextLine[] {
    if (items.length === 0) return [];

    // Sort by Y position (top to bottom), then X (left to right)
    const sorted = [...items].sort((a, b) => {
        if (Math.abs(a.y - b.y) < tolerance) {
            return a.x - b.x;
        }
        return b.y - a.y; // PDF coordinates are bottom-up
    });

    const lines: TextLine[] = [];
    let currentLine: StyledTextItem[] = [sorted[0]];
    let currentY = sorted[0].y;

    for (let i = 1; i < sorted.length; i++) {
        const item = sorted[i];
        if (Math.abs(item.y - currentY) < tolerance) {
            currentLine.push(item);
        } else {
            lines.push({
                items: currentLine,
                y: currentY,
                pageIndex: currentLine[0].pageIndex,
            });
            currentLine = [item];
            currentY = item.y;
        }
    }

    // Don't forget the last line
    if (currentLine.length > 0) {
        lines.push({
            items: currentLine,
            y: currentY,
            pageIndex: currentLine[0].pageIndex,
        });
    }

    return lines;
}

// Main extraction function
export async function extractPDFWithStyles(
    file: File,
    onProgress?: (progress: number, message: string) => void
): Promise<ExtractionResult> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({ data: arrayBuffer });

    onProgress?.(10, "Loading PDF document...");

    const pdf: PDFDocumentProxy = await loadingTask.promise;
    const numPages = pdf.numPages;

    // Get metadata
    const metadata = await pdf.getMetadata();
    const info = metadata.info as any;

    const extractedMetadata = {
        title: info?.Title || undefined,
        author: info?.Author || undefined,
        subject: info?.Subject || undefined,
        creator: info?.Creator || undefined,
        creationDate: info?.CreationDate || undefined,
        modificationDate: info?.ModDate || undefined,
    };

    const pages: PageContent[] = [];
    const fonts = new Map<string, FontInfo>();

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        onProgress?.(10 + (pageNum / numPages) * 80, `Processing page ${pageNum} of ${numPages}...`);

        const page: PDFPageProxy = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1 });
        const textContent = await page.getTextContent();

        const styledItems: StyledTextItem[] = [];
        let lineIndex = 0;

        for (const item of textContent.items) {
            if (!("str" in item)) continue;

            const textItem = item as any;
            const text = textItem.str;

            if (!text.trim()) continue;

            // Get font information
            const fontName = textItem.fontName || "Helvetica";
            const { family, weight, style } = parseFontName(fontName);

            // Store font info
            if (!fonts.has(fontName)) {
                fonts.set(fontName, {
                    name: fontName,
                    family,
                    weight,
                    style,
                    isMonospace: family.toLowerCase().includes("mono") || family.toLowerCase().includes("courier"),
                    isSerif: family.toLowerCase().includes("serif") || family.toLowerCase().includes("times"),
                });
            }

            // Calculate position and dimensions
            const transform = textItem.transform;
            const x = transform[4];
            const y = transform[5];
            const fontSize = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]);
            const width = textItem.width;
            const height = textItem.height || fontSize;

            // Get color (default to black if not available)
            let color = "#000000";
            if (textItem.color) {
                color = pdfColorToCSS(textItem.color);
            }

            styledItems.push({
                text,
                style: {
                    fontFamily: family,
                    fontSize: Math.round(fontSize * 10) / 10,
                    fontWeight: weight as "normal" | "bold",
                    fontStyle: style as "normal" | "italic",
                    color,
                },
                x,
                y,
                width,
                height,
                pageIndex: pageNum - 1,
                lineIndex,
            });
        }

        // Group into lines
        const lines = groupIntoLines(styledItems);

        // Generate raw text
        const rawText = lines
            .map((line) => line.items.map((item) => item.text).join(" "))
            .join("\n");

        pages.push({
            pageNumber: pageNum,
            width: viewport.width,
            height: viewport.height,
            lines,
            rawText,
        });
    }

    onProgress?.(100, "Extraction complete!");

    return {
        pages,
        totalPages: numPages,
        metadata: extractedMetadata,
        fonts,
    };
}

// Convert extraction result to HTML
export function toHTML(result: ExtractionResult): string {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${result.metadata.title || "Extracted PDF"}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 900px; margin: 0 auto; }
    .page { margin-bottom: 40px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fff; }
    .page-header { font-size: 12px; color: #666; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
    .line { margin-bottom: 0.5em; }
    .text-item { display: inline; }
  </style>
</head>
<body>
`;

    for (const page of result.pages) {
        html += `  <div class="page">
    <div class="page-header">Page ${page.pageNumber}</div>
`;

        for (const line of page.lines) {
            html += `    <div class="line">`;

            for (const item of line.items) {
                const style = `font-family: ${item.style.fontFamily}; font-size: ${item.style.fontSize}px; font-weight: ${item.style.fontWeight}; font-style: ${item.style.fontStyle}; color: ${item.style.color};`;
                html += `<span class="text-item" style="${style}">${escapeHTML(item.text)}</span> `;
            }

            html += `</div>\n`;
        }

        html += `  </div>\n`;
    }

    html += `</body>
</html>`;

    return html;
}

// Convert to plain text
export function toPlainText(result: ExtractionResult): string {
    return result.pages
        .map((page) => {
            const header = `--- Page ${page.pageNumber} ---\n`;
            return header + page.rawText;
        })
        .join("\n\n");
}

// Convert to RTF (basic)
export function toRTF(result: ExtractionResult): string {
    let rtf = `{\\rtf1\\ansi\\deff0\n`;

    // Font table
    const fontNames = Array.from(result.fonts.values()).map((f) => f.family.split(",")[0].replace(/"/g, ""));
    rtf += `{\\fonttbl`;
    fontNames.forEach((font, i) => {
        rtf += `{\\f${i} ${font};}`;
    });
    rtf += `}\n`;

    // Color table
    rtf += `{\\colortbl;\\red0\\green0\\blue0;}\n`;

    for (const page of result.pages) {
        rtf += `\\page\n`;
        rtf += `{\\b Page ${page.pageNumber}}\\par\\par\n`;

        for (const line of page.lines) {
            for (const item of line.items) {
                const isBold = item.style.fontWeight === "bold" ? "\\b" : "\\b0";
                const isItalic = item.style.fontStyle === "italic" ? "\\i" : "\\i0";
                const fontSize = Math.round(item.style.fontSize * 2);

                rtf += `{${isBold}${isItalic}\\fs${fontSize} ${escapeRTF(item.text)}} `;
            }
            rtf += `\\par\n`;
        }
    }

    rtf += `}`;
    return rtf;
}

function escapeHTML(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeRTF(text: string): string {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}");
}
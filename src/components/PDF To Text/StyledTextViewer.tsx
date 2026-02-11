// components/StyledTextViewer.tsx
import { useRef, useState, useEffect } from "react";
import { PageContent, TextLine, StyledTextItem } from "../../utils/pdfTextExtractor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
} from "lucide-react";

interface StyledTextViewerProps {
    pages: PageContent[];
    currentPage: number;
    onPageChange: (page: number) => void;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    searchQuery?: string;
    highlightColor?: string;
}

export const StyledTextViewer = ({
    pages,
    currentPage,
    onPageChange,
    zoom,
    onZoomChange,
    searchQuery = "",
    highlightColor = "#ffeb3b",
}: StyledTextViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [searchMatches, setSearchMatches] = useState<number[]>([]);
    const [currentMatch, setCurrentMatch] = useState(0);

    // Find search matches
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchMatches([]);
            return;
        }

        const matches: number[] = [];
        pages.forEach((page, pageIndex) => {
            const text = page.rawText.toLowerCase();
            const query = searchQuery.toLowerCase();
            let pos = 0;
            while ((pos = text.indexOf(query, pos)) !== -1) {
                matches.push(pageIndex);
                pos += query.length;
            }
        });
        setSearchMatches(matches);
        setCurrentMatch(0);
    }, [searchQuery, pages]);

    // Navigate to match
    const goToMatch = (index: number) => {
        if (searchMatches.length === 0) return;
        const pageIndex = searchMatches[index];
        if (pageIndex !== undefined) {
            onPageChange(pageIndex);
            setCurrentMatch(index);
        }
    };

    // Highlight text matching search query
    const highlightText = (text: string): React.ReactNode => {
        if (!searchQuery.trim()) return text;

        const parts = text.split(new RegExp(`(${escapeRegex(searchQuery)})`, "gi"));
        return parts.map((part, i) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
                <mark key={i} style={{ backgroundColor: highlightColor, padding: "0 2px", borderRadius: "2px" }}>
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const page = pages[currentPage];
    if (!page) return null;

    return (
        <div className="flex flex-col h-full">
            {/* Search Results Bar */}
            {searchQuery && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 border-b text-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>
                        {searchMatches.length > 0 ? (
                            <>
                                {currentMatch + 1} of {searchMatches.length} matches
                            </>
                        ) : (
                            "No matches found"
                        )}
                    </span>
                    {searchMatches.length > 0 && (
                        <div className="flex gap-1 ml-auto">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => goToMatch(Math.max(0, currentMatch - 1))}
                                disabled={currentMatch === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => goToMatch(Math.min(searchMatches.length - 1, currentMatch + 1))}
                                disabled={currentMatch === searchMatches.length - 1}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Text Content */}
            <ScrollArea className="flex-1">
                <div
                    ref={containerRef}
                    className="p-6 min-h-full"
                    style={{
                        fontSize: `${14 * zoom}px`,
                        lineHeight: 1.6,
                    }}
                >
                    {/* Page Header */}
                    <div className="text-xs text-muted-foreground mb-4 pb-2 border-b flex items-center justify-between">
                        <span>Page {page.pageNumber} of {pages.length}</span>
                        <span>{page.width.toFixed(0)} × {page.height.toFixed(0)} pts</span>
                    </div>

                    {/* Styled Lines */}
                    <div className="space-y-1">
                        {page.lines.map((line, lineIndex) => (
                            <div key={lineIndex} className="flex flex-wrap">
                                {line.items.map((item, itemIndex) => (
                                    <span
                                        key={itemIndex}
                                        style={{
                                            fontFamily: item.style.fontFamily,
                                            fontSize: `${item.style.fontSize * zoom}px`,
                                            fontWeight: item.style.fontWeight,
                                            fontStyle: item.style.fontStyle,
                                            color: item.style.color,
                                            letterSpacing: item.style.letterSpacing ? `${item.style.letterSpacing}px` : undefined,
                                            marginRight: "0.2em",
                                        }}
                                    >
                                        {highlightText(item.text)}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>

                    {page.lines.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No text content on this page.</p>
                            <p className="text-sm">This page may contain only images or scanned content.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Page Navigation */}
            <div className="flex items-center justify-between p-2 border-t bg-muted/30">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(pages.length - 1, currentPage + 1))}
                    disabled={currentPage === pages.length - 1}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
};
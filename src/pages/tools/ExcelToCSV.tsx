import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Download, Upload, FileSpreadsheet, File, Files } from "lucide-react";
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

interface SheetData {
  name: string;
  data: string;
  rows: number;
  cols: number;
}

const ExcelToCSV = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [delimiter, setDelimiter] = useState<string>(",");
  const [encoding, setEncoding] = useState<string>("UTF-8");
  const [includeHeaders, setIncludeHeaders] = useState<boolean>(true);
  const [quoteFields, setQuoteFields] = useState<boolean>(false);
  const [converting, setConverting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file =>
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.xlsm')
    );

    if (validFiles.length === 0) {
      toast.error("Please select valid Excel files (.xlsx, .xls, .xlsm)");
      return;
    }

    setFiles(validFiles);
    setSheets([]);
    setSelectedSheets([]);
    toast.success(`${validFiles.length} Excel file(s) loaded successfully!`);
  };

  const processFiles = async () => {
    if (files.length === 0) {
      toast.error("Please select Excel files first");
      return;
    }

    setConverting(true);
    const allSheets: SheetData[] = [];

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          const rows = range.e.r - range.s.r + 1;
          const cols = range.e.c - range.s.c + 1;

          // Convert to CSV with custom delimiter
          let csv = XLSX.utils.sheet_to_csv(worksheet, { FS: delimiter });

          // Apply quote fields if needed
          if (quoteFields) {
            csv = csv.split('\n').map(row =>
              row.split(delimiter).map(field => `"${field}"`).join(delimiter)
            ).join('\n');
          }

          // Remove headers if needed
          if (!includeHeaders && csv) {
            csv = csv.split('\n').slice(1).join('\n');
          }

          allSheets.push({
            name: `${file.name.replace(/\.(xlsx|xls|xlsm)$/i, '')}_${sheetName}`,
            data: csv,
            rows,
            cols
          });
        });
      }

      setSheets(allSheets);
      setSelectedSheets(allSheets.map(s => s.name));
      toast.success(`Processed ${allSheets.length} sheet(s) successfully!`);
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Failed to process Excel files");
    } finally {
      setConverting(false);
    }
  };

  const downloadSingleCSV = (sheet: SheetData) => {
    const blob = new Blob([sheet.data], { type: `text/csv;charset=${encoding};` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${sheet.name}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`Downloaded ${sheet.name}.csv`);
  };

  const downloadAllAsZip = async () => {
    if (selectedSheets.length === 0) {
      toast.error("Please select sheets to download");
      return;
    }

    const zip = new JSZip();
    const selectedData = sheets.filter(s => selectedSheets.includes(s.name));

    selectedData.forEach(sheet => {
      zip.file(`${sheet.name}.csv`, sheet.data);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `csv_files_${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`Downloaded ${selectedSheets.length} CSV file(s) as ZIP`);
  };

  const toggleSheetSelection = (sheetName: string) => {
    setSelectedSheets(prev =>
      prev.includes(sheetName)
        ? prev.filter(s => s !== sheetName)
        : [...prev, sheetName]
    );
  };

  const selectAllSheets = () => {
    setSelectedSheets(sheets.map(s => s.name));
  };

  const deselectAllSheets = () => {
    setSelectedSheets([]);
  };

  return (
    <ToolLayout
      title="Excel to CSV Converter"
      description="Convert Excel files (.xlsx, .xls) to CSV format with advanced options. Batch processing, multiple sheets, custom delimiters, and more. 100% free and secure."
      category="File Converters"
      instructions={[
        "Upload one or more Excel files (.xlsx, .xls, .xlsm)",
        "Choose delimiter (comma, semicolon, tab, pipe)",
        "Select encoding and other advanced options",
        "Click 'Process Files' to convert all sheets",
        "Select which sheets to download",
        "Download individual CSV files or all as ZIP"
      ]}
      relatedTools={[
        { name: "CSV to Excel", path: "/tools/csv-to-excel" },
        { name: "JSON to CSV", path: "/tools/json-to-csv" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* File Upload Section */}
            <div>
              <Label htmlFor="excel-files">Upload Excel Files (Multiple Supported)</Label>
              <div className="mt-2">
                <label
                  htmlFor="excel-files"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="text-center">
                    {files.length > 0 ? (
                      <>
                        <Files className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">{files.length} file(s) selected</p>
                        <p className="text-xs text-muted-foreground">
                          {files.map(f => f.name).join(', ')}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload Excel files
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports .xlsx, .xls, .xlsm (multiple files)
                        </p>
                      </>
                    )}
                  </div>
                  <Input
                    id="excel-files"
                    type="file"
                    accept=".xlsx,.xls,.xlsm"
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                </label>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Delimiter</Label>
                <Select value={delimiter} onValueChange={setDelimiter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">Comma (,)</SelectItem>
                    <SelectItem value=";">Semicolon (;)</SelectItem>
                    <SelectItem value="\t">Tab (\t)</SelectItem>
                    <SelectItem value="|">Pipe (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Encoding</Label>
                <Select value={encoding} onValueChange={setEncoding}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTF-8">UTF-8</SelectItem>
                    <SelectItem value="UTF-16">UTF-16</SelectItem>
                    <SelectItem value="ISO-8859-1">ISO-8859-1</SelectItem>
                    <SelectItem value="Windows-1252">Windows-1252</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-headers"
                  checked={includeHeaders}
                  onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
                />
                <label
                  htmlFor="include-headers"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include column headers (first row)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="quote-fields"
                  checked={quoteFields}
                  onCheckedChange={(checked) => setQuoteFields(checked as boolean)}
                />
                <label
                  htmlFor="quote-fields"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Quote all fields with double quotes
                </label>
              </div>
            </div>

            {/* Process Button */}
            <Button
              onClick={processFiles}
              disabled={files.length === 0 || converting}
              size="lg"
              className="w-full"
            >
              {converting ? "Processing..." : "Process Files & Convert"}
            </Button>
          </CardContent>
        </Card>

        {/* Sheets Selection and Download */}
        {sheets.length > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Converted Sheets ({sheets.length})
                </h3>
                <div className="flex gap-2">
                  <Button onClick={selectAllSheets} variant="outline" size="sm">
                    Select All
                  </Button>
                  <Button onClick={deselectAllSheets} variant="outline" size="sm">
                    Deselect All
                  </Button>
                </div>
              </div>

              {/* Sheets List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sheets.map((sheet) => (
                  <div
                    key={sheet.name}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={selectedSheets.includes(sheet.name)}
                        onCheckedChange={() => toggleSheetSelection(sheet.name)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{sheet.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sheet.rows} rows × {sheet.cols} columns | {sheet.data.length} chars
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => downloadSingleCSV(sheet)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>

              {/* Download All Button */}
              {selectedSheets.length > 0 && (
                <div className="pt-4 border-t">
                  <Button onClick={downloadAllAsZip} className="w-full" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download Selected ({selectedSheets.length}) as ZIP
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Batch Processing:</strong> Convert multiple Excel files at once</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Multiple Sheets:</strong> Extract all sheets from workbooks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Custom Delimiters:</strong> Comma, semicolon, tab, or pipe</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Encoding Options:</strong> UTF-8, UTF-16, ISO-8859-1, Windows-1252</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Field Quoting:</strong> Optional double quotes around fields</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>ZIP Download:</strong> Download all CSV files as single ZIP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>100% Secure:</strong> All processing happens in your browser</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Related Articles & Guides — internal link for SEO */}
      <section className="mt-12 mb-8 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RouterLink
            to="/blog/free-online-excel-to-csv-converter"
            className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
          >
            <span className="text-primary font-semibold hover:underline text-lg block">
              Best Free Online Excel to CSV Converter (No Signup)
            </span>
            <p className="text-muted-foreground mt-2 text-sm">
              Learn how to convert Excel (.xlsx or .xls) spreadsheets into clean, comma-separated values (CSV) instantly without losing data formatting.
            </p>
          </RouterLink>
        </div>
      </section>
    </ToolLayout>
  );
};

export default ExcelToCSV;

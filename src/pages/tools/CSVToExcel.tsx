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
import { Download, Upload, FileSpreadsheet, Files } from "lucide-react";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface CSVFileData {
  fileName: string;
  sheetName: string;
  data: any[][];
  rows: number;
  cols: number;
}

const CSVToExcel = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<CSVFileData[]>([]);
  const [delimiter, setDelimiter] = useState<string>("auto");
  const [outputFormat, setOutputFormat] = useState<string>("xlsx");
  const [autoFitColumns, setAutoFitColumns] = useState<boolean>(true);
  const [freezeHeader, setFreezeHeader] = useState<boolean>(true);
  const [boldHeader, setBoldHeader] = useState<boolean>(true);
  const [convertNumbers, setConvertNumbers] = useState<boolean>(true);
  const [convertDates, setConvertDates] = useState<boolean>(true);
  const [outputFileName, setOutputFileName] = useState<string>("converted-file");
  const [converting, setConverting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file =>
      file.name.endsWith('.csv') ||
      file.type === 'text/csv' ||
      file.type === 'text/plain'
    );

    if (validFiles.length === 0) {
      toast.error("Please select valid CSV files");
      return;
    }

    setFiles(validFiles);
    setProcessedFiles([]);

    // Set default output filename from first file
    if (validFiles.length === 1) {
      setOutputFileName(validFiles[0].name.replace(/\.csv$/i, ''));
    } else {
      setOutputFileName('converted-files');
    }

    toast.success(`${validFiles.length} CSV file(s) loaded successfully!`);
  };

  const detectDelimiter = (text: string): string => {
    const firstLine = text.split('\n')[0];
    const delimiters = [',', ';', '\t', '|'];
    const counts = delimiters.map(d => ({
      delimiter: d,
      count: firstLine.split(d).length
    }));

    // Return delimiter with highest count (most columns)
    const detected = counts.reduce((max, curr) =>
      curr.count > max.count ? curr : max
    );

    return detected.delimiter;
  };

  const getDelimiterValue = (selected: string, text: string): string => {
    if (selected === 'auto') {
      return detectDelimiter(text);
    }
    switch (selected) {
      case 'comma': return ',';
      case 'semicolon': return ';';
      case 'tab': return '\t';
      case 'pipe': return '|';
      default: return ',';
    }
  };

  const processFiles = async () => {
    if (files.length === 0) {
      toast.error("Please select CSV files first");
      return;
    }

    setConverting(true);
    const processed: CSVFileData[] = [];

    try {
      for (const file of files) {
        const text = await file.text();
        const delim = getDelimiterValue(delimiter, text);

        // Parse CSV using PapaParse
        const parsed = Papa.parse(text, {
          delimiter: delim,
          skipEmptyLines: true,
          dynamicTyping: convertNumbers || convertDates,
        });

        if (parsed.errors.length > 0 && parsed.errors.some(e => e.type === 'Quotes')) {
          toast.error(`Warning: ${file.name} may have formatting issues`);
        }

        const data = parsed.data as any[][];
        const rows = data.length;
        const cols = rows > 0 ? Math.max(...data.map(row => row.length)) : 0;

        processed.push({
          fileName: file.name,
          sheetName: file.name.replace(/\.csv$/i, '').substring(0, 31), // Excel sheet name limit
          data,
          rows,
          cols
        });
      }

      setProcessedFiles(processed);
      toast.success(`Processed ${processed.length} CSV file(s) successfully!`);
    } catch (error) {
      console.error("Error processing CSV files:", error);
      toast.error("Failed to process CSV files");
    } finally {
      setConverting(false);
    }
  };

  const downloadExcel = () => {
    if (processedFiles.length === 0) {
      toast.error("Please process CSV files first");
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      processedFiles.forEach((fileData) => {
        // Create worksheet from data
        const worksheet = XLSX.utils.aoa_to_sheet(fileData.data);

        // Apply column auto-fit
        if (autoFitColumns) {
          const colWidths = fileData.data[0]?.map((_, colIndex) => {
            const maxWidth = fileData.data.reduce((max, row) => {
              const cellValue = String(row[colIndex] || '');
              return Math.max(max, cellValue.length);
            }, 10);
            return { wch: Math.min(maxWidth + 2, 50) }; // Max width of 50
          });
          if (colWidths) {
            worksheet['!cols'] = colWidths;
          }
        }

        // Apply header freeze
        if (freezeHeader && fileData.rows > 1) {
          worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
        }

        // Apply header bold formatting
        if (boldHeader && fileData.rows > 0) {
          const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!worksheet[cellAddress]) continue;

            worksheet[cellAddress].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "E0E0E0" } },
              alignment: { horizontal: "center", vertical: "center" }
            };
          }
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, fileData.sheetName);
      });

      // Generate and download file
      const extension = outputFormat === 'xlsx' ? '.xlsx' : '.xls';
      const bookType = outputFormat === 'xlsx' ? 'xlsx' : 'xls';

      XLSX.writeFile(workbook, `${outputFileName}${extension}`, {
        bookType: bookType as XLSX.BookType,
        cellStyles: true
      });

      toast.success(`Excel file downloaded successfully!`);
    } catch (error) {
      console.error("Error creating Excel file:", error);
      toast.error("Failed to create Excel file");
    }
  };

  return (
    <ToolLayout
      title="CSV to Excel Converter"
      description="Convert CSV files to Excel (.xlsx, .xls) format with advanced options. Batch processing, auto-formatting, multiple sheets, and more. 100% free and secure."
      category="File Converters"
      instructions={[
        "Upload one or more CSV files",
        "Choose delimiter (auto-detect or manual selection)",
        "Configure formatting options (bold headers, freeze panes, auto-fit)",
        "Select output format (XLSX or XLS)",
        "Click 'Process Files' to parse CSV data",
        "Download the formatted Excel file"
      ]}
      relatedTools={[
        { name: "Excel to CSV", path: "/tools/excel-to-csv" },
        { name: "CSV to JSON", path: "/tools/csv-to-json" },
        { name: "JSON to Excel", path: "/tools/json-to-excel" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* File Upload Section */}
            <div>
              <Label htmlFor="csv-files">Upload CSV Files (Multiple Supported)</Label>
              <div className="mt-2">
                <label
                  htmlFor="csv-files"
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
                          Click to upload CSV files
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports .csv files (multiple files)
                        </p>
                      </>
                    )}
                  </div>
                  <Input
                    id="csv-files"
                    type="file"
                    accept=".csv,text/csv,text/plain"
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
                    <SelectItem value="auto">Auto-Detect</SelectItem>
                    <SelectItem value="comma">Comma (,)</SelectItem>
                    <SelectItem value="semicolon">Semicolon (;)</SelectItem>
                    <SelectItem value="tab">Tab (\t)</SelectItem>
                    <SelectItem value="pipe">Pipe (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel 2007+ (.xlsx)</SelectItem>
                    <SelectItem value="xls">Excel 97-2003 (.xls)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Output Filename */}
            <div>
              <Label htmlFor="output-name">Output File Name (without extension)</Label>
              <Input
                id="output-name"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder="converted-file"
                className="mt-2"
              />
            </div>

            {/* Formatting Options */}
            <div className="space-y-3">
              <Label className="text-base">Formatting Options</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-fit"
                  checked={autoFitColumns}
                  onCheckedChange={(checked) => setAutoFitColumns(checked as boolean)}
                />
                <label
                  htmlFor="auto-fit"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Auto-fit column widths
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="freeze-header"
                  checked={freezeHeader}
                  onCheckedChange={(checked) => setFreezeHeader(checked as boolean)}
                />
                <label
                  htmlFor="freeze-header"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Freeze header row (first row)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bold-header"
                  checked={boldHeader}
                  onCheckedChange={(checked) => setBoldHeader(checked as boolean)}
                />
                <label
                  htmlFor="bold-header"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Bold header row with gray background
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="convert-numbers"
                  checked={convertNumbers}
                  onCheckedChange={(checked) => setConvertNumbers(checked as boolean)}
                />
                <label
                  htmlFor="convert-numbers"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Auto-convert text to numbers where possible
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="convert-dates"
                  checked={convertDates}
                  onCheckedChange={(checked) => setConvertDates(checked as boolean)}
                />
                <label
                  htmlFor="convert-dates"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Auto-detect and convert date formats
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
              {converting ? "Processing..." : "Process Files"}
            </Button>
          </CardContent>
        </Card>

        {/* Processed Files Preview */}
        {processedFiles.length > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Processed Files ({processedFiles.length})
                </h3>
              </div>

              {/* Files List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {processedFiles.map((fileData, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{fileData.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          Sheet: "{fileData.sheetName}" | {fileData.rows} rows × {fileData.cols} columns
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Download Button */}
              <div className="pt-4 border-t">
                <Button onClick={downloadExcel} className="w-full" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download Excel File ({processedFiles.length} sheet{processedFiles.length > 1 ? 's' : ''})
                </Button>
              </div>
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
                <span><strong>Batch Processing:</strong> Convert multiple CSV files into multiple Excel sheets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Smart Delimiter Detection:</strong> Auto-detect comma, semicolon, tab, or pipe delimiters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Multiple Formats:</strong> Export as .xlsx (modern) or .xls (legacy Excel)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Auto-Formatting:</strong> Auto-fit columns, freeze header, bold styling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Data Type Conversion:</strong> Auto-detect and convert numbers and dates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Professional Output:</strong> Create Excel files ready for business use</span>
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
            to="/blog/convert-csv-to-excel-online"
            className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
          >
            <span className="text-primary font-semibold hover:underline text-lg block">
              How to Convert CSV to Excel (.xlsx) Online for Free
            </span>
            <p className="text-muted-foreground mt-2 text-sm">
              Struggling with messy CSV files where all the data is crammed into one column? Learn how to convert CSV to Excel cleanly and instantly.
            </p>
          </RouterLink>
        </div>
      </section>
    </ToolLayout>
  );
};

export default CSVToExcel;

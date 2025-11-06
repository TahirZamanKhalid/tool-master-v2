import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const CSVToExcel = () => {
  const [csvText, setCsvText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("converted-file.xlsx");
  const [converting, setConverting] = useState(false);
  const [sheetName, setSheetName] = useState<string>("Sheet1");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv') || selectedFile.type === 'text/csv') {
        setFile(selectedFile);
        setFileName(selectedFile.name.replace(/\.csv$/i, '.xlsx'));

        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setCsvText(text);
        };
        reader.readAsText(selectedFile);

        toast.success("CSV file loaded successfully!");
      } else {
        toast.error("Please select a valid CSV file");
      }
    }
  };

  const convertToExcel = () => {
    if (!csvText.trim()) {
      toast.error("Please provide CSV data");
      return;
    }

    setConverting(true);

    try {
      // Parse CSV using PapaParse
      const parsed = Papa.parse(csvText, {
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        console.warn("CSV parsing warnings:", parsed.errors);
      }

      // Create workbook and worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(parsed.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || "Sheet1");

      // Generate Excel file
      XLSX.writeFile(workbook, fileName);

      toast.success("Excel file created and downloaded!");
    } catch (error) {
      console.error("Error converting CSV to Excel:", error);
      toast.error("Failed to convert CSV to Excel");
    } finally {
      setConverting(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCsvText(text);
      toast.success("CSV data pasted from clipboard!");
    } catch (error) {
      toast.error("Failed to read clipboard. Please paste manually.");
    }
  };

  return (
    <ToolLayout
      title="CSV to Excel Converter"
      description="Convert CSV files to Excel (.xlsx) format instantly. Free, fast, and secure - all processing happens in your browser."
      category="File Converters"
      instructions={[
        "Upload a CSV file or paste CSV data directly",
        "Optionally customize the Excel sheet name",
        "Click 'Convert to Excel' to process",
        "Excel file will download automatically",
        "Works with any CSV format - comma, semicolon, or tab separated"
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
              <Label htmlFor="csv-file">Upload CSV File</Label>
              <div className="mt-2">
                <label
                  htmlFor="csv-file"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="text-center">
                    {file ? (
                      <>
                        <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload CSV file
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Or paste CSV data below
                        </p>
                      </>
                    )}
                  </div>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* CSV Text Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="csv-text">Or Paste CSV Data</Label>
                <Button
                  onClick={handlePasteFromClipboard}
                  variant="outline"
                  size="sm"
                >
                  Paste from Clipboard
                </Button>
              </div>
              <Textarea
                id="csv-text"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="name,email,phone&#10;John Doe,john@example.com,123-456-7890&#10;Jane Smith,jane@example.com,098-765-4321"
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {csvText.split('\n').filter(line => line.trim()).length} rows detected
              </p>
            </div>

            {/* Sheet Name Input */}
            <div>
              <Label htmlFor="sheet-name">Excel Sheet Name (Optional)</Label>
              <Input
                id="sheet-name"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Sheet1"
                className="mt-2"
              />
            </div>

            {/* File Name Input */}
            <div>
              <Label htmlFor="file-name">Output File Name</Label>
              <Input
                id="file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="output.xlsx"
                className="mt-2"
              />
            </div>

            {/* Convert Button */}
            <Button
              onClick={convertToExcel}
              disabled={!csvText.trim() || converting}
              size="lg"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {converting ? "Converting..." : "Convert to Excel"}
            </Button>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Why Use Our CSV to Excel Converter?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>100% Free:</strong> No registration, no limits, no hidden fees</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Secure & Private:</strong> All conversion happens in your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Fast Processing:</strong> Instant conversion, no upload delays</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Flexible Input:</strong> Upload file or paste CSV data directly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Smart Parsing:</strong> Handles comma, semicolon, and tab delimiters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Customizable:</strong> Set your own sheet name and file name</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>No Software Needed:</strong> Works directly in your web browser</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default CSVToExcel;

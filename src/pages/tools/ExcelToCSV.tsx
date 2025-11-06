import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

const ExcelToCSV = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [converting, setConverting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.name.endsWith('.xlsx') ||
        selectedFile.name.endsWith('.xls') ||
        selectedFile.name.endsWith('.xlsm')
      ) {
        setFile(selectedFile);
        setFileName(selectedFile.name.replace(/\.(xlsx|xls|xlsm)$/i, '.csv'));
        setCsvData("");
        toast.success("Excel file loaded successfully!");
      } else {
        toast.error("Please select a valid Excel file (.xlsx, .xls, .xlsm)");
      }
    }
  };

  const convertToCSV = async () => {
    if (!file) {
      toast.error("Please select an Excel file first");
      return;
    }

    setConverting(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to CSV
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      setCsvData(csv);

      toast.success(`Converted successfully! Sheet: ${firstSheetName}`);
    } catch (error) {
      console.error("Error converting file:", error);
      toast.error("Failed to convert Excel to CSV");
    } finally {
      setConverting(false);
    }
  };

  const downloadCSV = () => {
    if (!csvData) {
      toast.error("Please convert the file first");
      return;
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);

    toast.success("CSV file downloaded!");
  };

  const copyToClipboard = () => {
    if (!csvData) {
      toast.error("No CSV data to copy");
      return;
    }

    navigator.clipboard.writeText(csvData);
    toast.success("CSV data copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Excel to CSV Converter"
      description="Convert Excel files (.xlsx, .xls) to CSV format instantly. Free, fast, and secure - all processing happens in your browser."
      category="File Converters"
      instructions={[
        "Click 'Choose File' and select your Excel file (.xlsx, .xls, .xlsm)",
        "Click 'Convert to CSV' to process the file",
        "Preview the CSV data in the output area",
        "Click 'Download CSV' to save the converted file",
        "Or click 'Copy CSV' to copy data to clipboard"
      ]}
      relatedTools={[
        { name: "CSV to Excel", path: "/tools/csv-to-excel" },
        { name: "JSON to CSV", path: "/tools/json-to-csv" },
        { name: "Excel to JSON", path: "/tools/excel-to-json" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* File Upload Section */}
            <div>
              <Label htmlFor="excel-file">Upload Excel File</Label>
              <div className="mt-2">
                <label
                  htmlFor="excel-file"
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
                          Click to upload Excel file
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports .xlsx, .xls, .xlsm
                        </p>
                      </>
                    )}
                  </div>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls,.xlsm"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Convert Button */}
            <Button
              onClick={convertToCSV}
              disabled={!file || converting}
              size="lg"
              className="w-full"
            >
              {converting ? "Converting..." : "Convert to CSV"}
            </Button>

            {/* CSV Preview and Download */}
            {csvData && (
              <div className="space-y-4">
                <div>
                  <Label>CSV Preview</Label>
                  <textarea
                    value={csvData.slice(0, 1000) + (csvData.length > 1000 ? '\n...(truncated)' : '')}
                    readOnly
                    className="w-full h-64 p-3 mt-2 font-mono text-sm border rounded-lg bg-muted/30"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Total size: {csvData.length} characters
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={downloadCSV} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    Copy CSV
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Why Use Our Excel to CSV Converter?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>100% Free:</strong> No registration, no hidden fees</span>
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
                <span><strong>Multiple Formats:</strong> Supports .xlsx, .xls, and .xlsm files</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>No Software Needed:</strong> Works directly in your web browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Preserves Data:</strong> Maintains cell values and formatting</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default ExcelToCSV;

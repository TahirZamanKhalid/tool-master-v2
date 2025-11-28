import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";

const CSVToJSON = () => {
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");

  const convertToJSON = () => {
    if (!csvInput.trim()) {
      toast.error("Please enter CSV data");
      return;
    }

    try {
      const lines = csvInput.trim().split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("CSV must have at least a header row and one data row");
        return;
      }

      // Parse CSV properly handling quoted values
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"';
              i++; // Skip next quote
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
      
      if (headers.length === 0 || headers.every(h => !h)) {
        toast.error("CSV header row is invalid or empty");
        return;
      }

      const result = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const obj: any = {};
        headers.forEach((header, i) => {
          if (header) {
            obj[header] = values[i]?.replace(/^"|"$/g, '') || "";
          }
        });
        return obj;
      });

      setJsonOutput(JSON.stringify(result, null, 2));
      toast.success("Converted to JSON successfully!");
    } catch (error) {
      toast.error("Invalid CSV format. Please check your data.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="CSV to JSON Converter"
      description="Convert CSV data to JSON format"
      category="Developer Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="name,age,city&#10;John,25,NYC&#10;Jane,30,LA"
              className="min-h-[300px] font-mono text-sm"
            />
            <Button onClick={convertToJSON} className="w-full">
              Convert to JSON
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={jsonOutput}
              readOnly
              placeholder="JSON output will appear here..."
              className="min-h-[300px] font-mono text-sm bg-muted"
            />
            <Button onClick={copyToClipboard} className="w-full" disabled={!jsonOutput}>
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default CSVToJSON;

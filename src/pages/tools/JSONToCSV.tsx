import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";

const JSONToCSV = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");

  const convertToCSV = () => {
    if (!jsonInput.trim()) {
      toast.error("Please enter JSON data");
      return;
    }

    try {
      const data = JSON.parse(jsonInput);
      if (!Array.isArray(data) || data.length === 0) {
        toast.error("JSON must be an array of objects");
        return;
      }

      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(","),
        ...data.map(row => headers.map(h => row[h] || "").join(","))
      ].join("\n");

      setCsvOutput(csv);
      toast.success("Converted to CSV successfully!");
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(csvOutput);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="JSON to CSV Converter"
      description="Convert JSON data to CSV format"
      category="Developer Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{"name":"John","age":25},{"name":"Jane","age":30}]'
              className="min-h-[300px] font-mono text-sm"
            />
            <Button onClick={convertToCSV} className="w-full">
              Convert to CSV
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={csvOutput}
              readOnly
              placeholder="CSV output will appear here..."
              className="min-h-[300px] font-mono text-sm bg-muted"
            />
            <Button onClick={copyToClipboard} className="w-full" disabled={!csvOutput}>
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default JSONToCSV;

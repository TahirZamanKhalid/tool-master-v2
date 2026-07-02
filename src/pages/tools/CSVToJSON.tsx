import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";
import { parseCSV } from "@/utils/developerText";

const CSVToJSON = () => {
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");

  const convertToJSON = () => {
    if (!csvInput.trim()) {
      toast.error("Please enter CSV data");
      return;
    }

    try {
      const result = parseCSV(csvInput.trim());
      setJsonOutput(JSON.stringify(result, null, 2));
      toast.success("Converted to JSON successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid CSV format. Please check your data.");
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

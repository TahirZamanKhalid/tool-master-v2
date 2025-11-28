import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";

const SQLFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const formatSQL = () => {
    if (!input.trim()) {
      toast.error("Please enter SQL query");
      return;
    }

    // Basic SQL formatting
    const formatted = input
      .replace(/\s+/g, " ")
      .replace(/SELECT/gi, "\nSELECT")
      .replace(/FROM/gi, "\nFROM")
      .replace(/WHERE/gi, "\nWHERE")
      .replace(/ORDER BY/gi, "\nORDER BY")
      .replace(/GROUP BY/gi, "\nGROUP BY")
      .replace(/JOIN/gi, "\nJOIN")
      .trim();
    
    setOutput(formatted);
    toast.success("SQL formatted successfully!");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  return (
    <ToolLayout
      title="SQL Formatter"
      description="Format and beautify SQL queries"
      category="Developer Tools"
    >
      <AdSpace className="mb-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="SELECT * FROM users WHERE id = 1"
              className="min-h-[300px] font-mono text-sm"
            />
            <Button onClick={formatSQL} className="w-full">
              Format SQL
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              value={output}
              readOnly
              placeholder="Formatted SQL will appear here..."
              className="min-h-[300px] font-mono text-sm bg-muted"
            />
            <Button onClick={copyToClipboard} className="w-full" disabled={!output}>
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default SQLFormatter;

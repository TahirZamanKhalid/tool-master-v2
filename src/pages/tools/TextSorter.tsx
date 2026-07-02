import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { toast } from "sonner";
import { Copy } from "lucide-react";

const TextSorter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const sortAsc = () => {
    if (!input) {
      toast.error("Please enter text");
      return;
    }
    const lines = input.split("\n");
    setOutput(lines.sort((a, b) => a.localeCompare(b)).join("\n"));
  };

  const sortDesc = () => {
    if (!input) {
      toast.error("Please enter text");
      return;
    }
    const lines = input.split("\n");
    setOutput(lines.sort((a, b) => b.localeCompare(a)).join("\n"));
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <ToolLayout
      title="Text Sorter"
      description="Sort lines of text alphabetically"
      category="Text Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter lines to sort..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
          />
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={sortAsc}>Sort A-Z</Button>
            <Button onClick={sortDesc} variant="outline">Sort Z-A</Button>
          </div>
          {output && (
            <>
              <Textarea value={output} readOnly rows={8} />
              <Button onClick={copyOutput} variant="outline" className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default TextSorter;

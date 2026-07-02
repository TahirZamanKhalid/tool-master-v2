import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { toast } from "sonner";
import { Copy } from "lucide-react";

const FindReplace = () => {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [result, setResult] = useState("");

  const replaceAll = () => {
    if (!text) {
      toast.error("Please enter text");
      return;
    }
    if (!find) {
      toast.error("Please enter text to find");
      return;
    }
    const matches = text.split(find).length - 1;
    setResult(text.split(find).join(replace));
    toast.success(`Replaced ${matches} match${matches === 1 ? "" : "es"}`);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard");
  };

  return (
    <ToolLayout
      title="Find and Replace"
      description="Find and replace text in bulk"
      category="Text Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Find</Label>
              <Input value={find} onChange={(e) => setFind(e.target.value)} />
            </div>
            <div>
              <Label>Replace with</Label>
              <Input value={replace} onChange={(e) => setReplace(e.target.value)} />
            </div>
          </div>
          <Button onClick={replaceAll} className="w-full">Replace All</Button>
          {result && (
            <>
              <Textarea value={result} readOnly rows={6} />
              <Button onClick={copyResult} variant="outline" className="w-full">
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

export default FindReplace;

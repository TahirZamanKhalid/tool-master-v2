import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { jsonToYaml as stringifyYaml, simpleYamlToJson } from "@/utils/developerText";

const JSONToYAML = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [yamlInput, setYamlInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [yamlOutput, setYamlOutput] = useState("");

  const handleJSONToYAML = () => {
    if (!jsonInput.trim()) {
      toast.error("Please enter JSON to convert");
      return;
    }

    try {
      const yaml = stringifyYaml(JSON.parse(jsonInput)).trim();
      setYamlOutput(yaml);
      toast.success("Successfully converted JSON to YAML");
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  };

  const handleYAMLToJSON = () => {
    if (!yamlInput.trim()) {
      toast.error("Please enter YAML to convert");
      return;
    }

    try {
      const json = JSON.stringify(simpleYamlToJson(yamlInput), null, 2);
      setJsonOutput(json);
      toast.success("Successfully converted YAML to JSON");
    } catch (error) {
      toast.error("Invalid YAML format");
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  return (
    <ToolLayout
      title="JSON to YAML Converter"
      description="Convert between JSON and YAML formats instantly"
      category="Developer Tools"
      instructions={[
        "Paste your JSON in the left panel to convert to YAML",
        "Paste your YAML in the right panel to convert to JSON",
        "Click the convert button to transform the data",
        "Copy the result with one click",
      ]}
      relatedTools={[
        { name: "JSON Formatter", path: "/tools/json-formatter" },
        { name: "YAML Formatter", path: "/tools/yaml-formatter" },
        { name: "XML Formatter", path: "/tools/xml-formatter" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">JSON Input</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleJSONToYAML}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Convert to YAML
              </Button>
            </div>
            <Textarea
              placeholder='{"name": "John", "age": 30}'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
            />
            {yamlOutput && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">YAML Output</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(yamlOutput, "YAML")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap">{yamlOutput}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">YAML Input</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleYAMLToJSON}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Convert to JSON
              </Button>
            </div>
            <Textarea
              placeholder="name: John&#10;age: 30"
              value={yamlInput}
              onChange={(e) => setYamlInput(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
            />
            {jsonOutput && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">JSON Output</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(jsonOutput, "JSON")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap">{jsonOutput}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Related Articles & Guides — internal link for SEO */}
      <section className="mt-12 mb-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Related Articles & Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RouterLink
            to="/blog/free-online-json-to-yaml-converter"
            className="p-4 border border-border/60 rounded-lg bg-card/80 shadow-sm hover:shadow-card-hover transition-shadow no-underline block"
          >
            <span className="text-primary font-semibold hover:underline text-lg block">
              Free Online JSON to YAML Converter
            </span>
            <p className="text-muted-foreground mt-2 text-sm">
              Convert complex JSON payloads into human-readable YAML configurations instantly.
            </p>
          </RouterLink>
        </div>
      </section>
    </ToolLayout>
  );
};

export default JSONToYAML;

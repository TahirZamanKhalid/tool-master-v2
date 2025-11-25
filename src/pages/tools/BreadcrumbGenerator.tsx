import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { List, Copy, Plus, Trash2 } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

const BreadcrumbGenerator = () => {
  const [items, setItems] = useState<BreadcrumbItem[]>([
    { name: "Home", url: "https://example.com" },
    { name: "", url: "" }
  ]);
  const [format, setFormat] = useState("json-ld");
  const [generatedCode, setGeneratedCode] = useState("");

  const addItem = () => {
    setItems([...items, { name: "", url: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: "name" | "url", value: string) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const generateBreadcrumb = () => {
    const validItems = items.filter(item => item.name.trim() && item.url.trim());

    if (validItems.length < 2) {
      toast.error("Please add at least 2 breadcrumb items");
      return;
    }

    let code = "";

    if (format === "json-ld") {
      const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": validItems.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      };

      code = `<script type="application/ld+json">\n${JSON.stringify(breadcrumb, null, 2)}\n</script>`;
    } else if (format === "microdata") {
      code = '<div itemscope itemtype="https://schema.org/BreadcrumbList">\n';
      validItems.forEach((item, index) => {
        code += `  <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">\n`;
        code += `    <a itemprop="item" href="${item.url}">\n`;
        code += `      <span itemprop="name">${item.name}</span>\n`;
        code += `    </a>\n`;
        code += `    <meta itemprop="position" content="${index + 1}" />\n`;
        if (index < validItems.length - 1) {
          code += `    <span> > </span>\n`;
        }
        code += `  </span>\n`;
      });
      code += '</div>';
    } else if (format === "html") {
      code = '<nav aria-label="Breadcrumb">\n  <ol class="breadcrumb">\n';
      validItems.forEach((item, index) => {
        const isLast = index === validItems.length - 1;
        if (isLast) {
          code += `    <li class="breadcrumb-item active" aria-current="page">${item.name}</li>\n`;
        } else {
          code += `    <li class="breadcrumb-item"><a href="${item.url}">${item.name}</a></li>\n`;
        }
      });
      code += '  </ol>\n</nav>';
    }

    setGeneratedCode(code);
    toast.success("Breadcrumb code generated!");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Code copied to clipboard!");
  };

  return (
    <ToolLayout
      title="Breadcrumb Generator"
      description="Generate breadcrumb navigation with structured data for SEO. Create breadcrumb schema markup easily."
      category="SEO & Marketing"
      instructions={[
        "Add breadcrumb items from top to bottom (Home → Category → Page)",
        "Enter name and URL for each item",
        "Select output format (JSON-LD, Microdata, or HTML)",
        "Generate and copy the code",
        "Add to your website for better navigation and SEO"
      ]}
      relatedTools={[
        { name: "Schema Markup Generator", path: "/tools/schema-markup-generator" },
        { name: "Canonical URL Generator", path: "/tools/canonical-url-generator" },
        { name: "Meta Tag Generator", path: "/tools/meta-tag-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label>Output Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json-ld">JSON-LD (Recommended for SEO)</SelectItem>
                  <SelectItem value="microdata">Microdata</SelectItem>
                  <SelectItem value="html">HTML Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Breadcrumb Items</Label>
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    {items.length > 1 && (
                      <Button
                        onClick={() => removeItem(index)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    placeholder="Name (e.g., Home, Products, Category)"
                  />

                  <Input
                    value={item.url}
                    onChange={(e) => updateItem(index, "url", e.target.value)}
                    placeholder="URL (e.g., https://example.com/category)"
                  />
                </div>
              ))}

              <Button onClick={addItem} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Button onClick={generateBreadcrumb} className="w-full" size="lg">
              <List className="h-4 w-4 mr-2" />
              Generate Breadcrumb Code
            </Button>
          </CardContent>
        </Card>

        {generatedCode && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Generated Code</h3>
                </div>
                <Button onClick={copyCode} size="sm" variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>

              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                <code>{generatedCode}</code>
              </pre>

              {format === "json-ld" && (
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Where to place:</strong> Add this JSON-LD script in the &lt;head&gt; or &lt;body&gt;
                    section of your HTML. It won't be visible to users but will be read by search engines.
                  </p>
                </div>
              )}

              {format === "html" && (
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>CSS needed:</strong> Style the breadcrumb with CSS. For Bootstrap, the classes
                    are already included. For custom styling, target .breadcrumb class.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Breadcrumb Benefits</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Better UX:</strong> Help users understand site structure and navigate easily</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Rich snippets:</strong> Breadcrumbs can appear in Google search results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Lower bounce rate:</strong> Easy navigation keeps users on your site</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Internal linking:</strong> Distributes page authority across your site</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Mobile friendly:</strong> Compact navigation perfect for small screens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Accessibility:</strong> Screen reader support with proper ARIA labels</span>
              </li>
            </ul>

            <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Pro Tip:</strong> Always start with Home and end with the current page. Keep the
                hierarchy logical and don't skip levels. Test with Google Rich Results Test tool.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default BreadcrumbGenerator;

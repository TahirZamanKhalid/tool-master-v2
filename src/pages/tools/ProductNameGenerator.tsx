import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Package, Copy, RefreshCw } from "lucide-react";

const ProductNameGenerator = () => {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("general");
  const [style, setStyle] = useState("creative");
  const [useAlliteration, setUseAlliteration] = useState(false);
  const [names, setNames] = useState<string[]>([]);

  const prefixes = {
    general: ["Super", "Ultra", "Mega", "Pro", "Elite", "Prime", "Max", "Plus", "Smart", "Quick"],
    tech: ["Tech", "Digital", "Cyber", "Smart", "Cloud", "Net", "Data", "Sync", "Link", "Stream"],
    health: ["Pure", "Vital", "Fresh", "Natural", "Organic", "Life", "Wellness", "Active", "Fit", "Peak"],
    beauty: ["Glow", "Shine", "Radiant", "Silk", "Pearl", "Velvet", "Luxe", "Bloom", "Aura", "Grace"],
    food: ["Tasty", "Fresh", "Crispy", "Savory", "Deluxe", "Gourmet", "Prime", "Gold", "Royal", "Chef"],
    home: ["Comfort", "Cozy", "Elite", "Perfect", "Smart", "Easy", "Simple", "Modern", "Classic", "Prime"],
    kids: ["Happy", "Fun", "Bright", "Sweet", "Little", "Mini", "Junior", "Tiny", "Baby", "Cute"],
    sports: ["Power", "Speed", "Force", "Turbo", "Rapid", "Swift", "Strong", "Flex", "Dynamic", "Peak"]
  };

  const suffixes = {
    creative: ["Wave", "Flow", "Spark", "Boost", "Dash", "Edge", "Core", "Zen", "Vibe", "Pulse"],
    descriptive: ["Master", "Expert", "Solution", "System", "Tool", "Kit", "Helper", "Manager", "Optimizer", "Builder"],
    brandable: ["ify", "ly", "io", "able", "wise", "ease", "ness", "hub", "box", "pro"],
    playful: ["Pop", "Snap", "Zip", "Buzz", "Fizz", "Zoom", "Wow", "Blast", "Joy", "Fun"]
  };

  const modifiers = ["Easy", "Quick", "Smart", "Fast", "Simple", "Perfect", "Best", "Top", "Premium", "Ultimate"];

  const generateNames = () => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    const generated: string[] = [];
    const baseKeyword = keyword.trim();
    const categoryPrefixes = prefixes[category as keyof typeof prefixes];
    const styleSuffixes = suffixes[style as keyof typeof suffixes];

    // Type 1: Prefix + Keyword
    categoryPrefixes.forEach(prefix => {
      generated.push(`${prefix}${baseKeyword}`);
      generated.push(`${prefix} ${baseKeyword}`);
    });

    // Type 2: Keyword + Suffix
    styleSuffixes.forEach(suffix => {
      generated.push(`${baseKeyword}${suffix}`);
      generated.push(`${baseKeyword} ${suffix}`);
    });

    // Type 3: Modifier + Keyword
    modifiers.forEach(modifier => {
      generated.push(`${modifier} ${baseKeyword}`);
    });

    // Type 4: Prefix + Keyword + Suffix combinations
    for (let i = 0; i < 10; i++) {
      const prefix = categoryPrefixes[Math.floor(Math.random() * categoryPrefixes.length)];
      const suffix = styleSuffixes[Math.floor(Math.random() * styleSuffixes.length)];
      generated.push(`${prefix}${baseKeyword}${suffix}`);
    }

    // Type 5: Alliteration if enabled
    if (useAlliteration && baseKeyword.length > 0) {
      const firstLetter = baseKeyword[0].toUpperCase();
      const alliterativeWords = [
        "Perfect", "Power", "Prime", "Pro", "Plus", "Peak",
        "Smart", "Super", "Swift", "Stellar", "Supreme",
        "Magic", "Master", "Mighty", "Modern", "Mega",
        "Quick", "Quality", "Quest",
        "Rapid", "Royal", "Radiant",
        "Elite", "Epic", "Easy", "Express",
        "Fast", "Fresh", "Flex", "Fine",
        "Bright", "Bold", "Best", "Boost",
        "Cool", "Crisp", "Classic", "Clear"
      ];

      alliterativeWords
        .filter(word => word[0] === firstLetter)
        .forEach(word => {
          generated.push(`${word} ${baseKeyword}`);
        });
    }

    // Remove duplicates and limit to 50
    const unique = Array.from(new Set(generated)).slice(0, 50);
    setNames(unique);
    toast.success(`Generated ${unique.length} product names!`);
  };

  const copyName = (name: string) => {
    navigator.clipboard.writeText(name);
    toast.success(`Copied: ${name}`);
  };

  return (
    <ToolLayout
      title="Product Name Generator"
      description="Generate catchy product names for launches and branding. Perfect for apps, gadgets, and services. Free product name generator."
      category="Generators"
      instructions={[
        "Enter a keyword describing your product",
        "Select product category",
        "Choose naming style",
        "Optionally enable alliteration",
        "Click generate and copy your favorite names"
      ]}
      relatedTools={[
        { name: "Business Name Generator", path: "/tools/business-name-generator" },
        { name: "Company Name Generator", path: "/tools/company-name-generator" },
        { name: "Tagline Generator", path: "/tools/tagline-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="keyword">Product Keyword</Label>
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., Fit, Clean, Cook, Track"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="health">Health & Fitness</SelectItem>
                    <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="home">Home & Living</SelectItem>
                    <SelectItem value="kids">Kids & Baby</SelectItem>
                    <SelectItem value="sports">Sports & Outdoors</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                    <SelectItem value="brandable">Brandable</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="alliteration"
                checked={useAlliteration}
                onCheckedChange={(checked) => setUseAlliteration(checked as boolean)}
              />
              <Label htmlFor="alliteration" className="cursor-pointer">
                Include alliterative names (e.g., Perfect Print)
              </Label>
            </div>

            <Button onClick={generateNames} className="w-full" size="lg">
              <Package className="h-4 w-4 mr-2" />
              Generate Product Names
            </Button>
          </CardContent>
        </Card>

        {names.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Generated Names ({names.length})
                  </h3>
                </div>
                <Button onClick={generateNames} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {names.map((name, index) => (
                  <button
                    key={index}
                    onClick={() => copyName(name)}
                    className="p-3 bg-muted/50 hover:bg-primary/10 rounded-lg text-left border border-transparent hover:border-primary/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{name}</span>
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Product Naming Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Memorable:</strong> Choose names that stick in customers' minds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Descriptive:</strong> Hint at what the product does or benefits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Pronounceable:</strong> Easy to say helps with word-of-mouth marketing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Unique:</strong> Stand out from competitors with distinctive names</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Test it:</strong> Get feedback from target audience before finalizing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Trademark:</strong> Check availability and protect your brand name</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default ProductNameGenerator;

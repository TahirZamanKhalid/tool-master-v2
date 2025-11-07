import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Sparkles, Copy, RefreshCw, Briefcase } from "lucide-react";

const BusinessNameGenerator = () => {
  const [keywords, setKeywords] = useState("");
  const [industry, setIndustry] = useState("general");
  const [style, setStyle] = useState("modern");
  const [length, setLength] = useState("medium");
  const [includePrefix, setIncludePrefix] = useState(false);
  const [includeSuffix, setIncludeSuffix] = useState(false);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);

  const prefixes = ["The", "My", "Pro", "Smart", "Quick", "Bright", "Elite", "Prime", "Nova", "Apex", "Peak", "Core", "True", "Next", "Blue"];
  const suffixes = ["Hub", "Pro", "Solutions", "Group", "Labs", "Studio", "Works", "Co", "Inc", "LLC", "Associates", "Partners", "Collective", "Network", "Digital"];

  const modernWords = ["Tech", "Digital", "Cloud", "Data", "Smart", "Quick", "Fast", "Instant", "Easy", "Simple", "Auto", "Direct"];
  const professionalWords = ["Capital", "Partners", "Group", "Ventures", "Holdings", "Consulting", "Advisory", "Management", "Services", "Solutions"];
  const creativeWords = ["Studio", "Craft", "Create", "Design", "Art", "Vision", "Imagine", "Dream", "Spark", "Flow", "Wave", "Pulse"];
  const techWords = ["Byte", "Code", "Logic", "Cyber", "Quantum", "Neural", "Pixel", "Binary", "Matrix", "Circuit"];

  const industryWords: { [key: string]: string[] } = {
    general: modernWords,
    tech: techWords,
    finance: professionalWords,
    creative: creativeWords,
    consulting: professionalWords,
    retail: ["Shop", "Store", "Market", "Boutique", "Outlet"],
    health: ["Care", "Health", "Wellness", "Medical", "Vital"],
    education: ["Learn", "Academy", "Institute", "School", "Edu"],
    food: ["Bite", "Taste", "Flavor", "Kitchen", "Cafe"],
    fitness: ["Fit", "Active", "Strong", "Power", "Energy"]
  };

  const generateNames = () => {
    if (!keywords.trim()) {
      toast.error("Please enter at least one keyword");
      return;
    }

    const keywordList = keywords.split(",").map(k => k.trim()).filter(k => k);
    const industryList = industryWords[industry] || modernWords;
    const names: string[] = [];

    keywordList.forEach(keyword => {
      const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);

      // Style-based combinations
      industryList.forEach(word => {
        // Keyword + Industry word
        names.push(`${capitalizedKeyword}${word}`);
        names.push(`${word}${capitalizedKeyword}`);

        // With prefix
        if (includePrefix) {
          prefixes.forEach(prefix => {
            names.push(`${prefix} ${capitalizedKeyword} ${word}`);
            names.push(`${prefix}${capitalizedKeyword}${word}`);
          });
        }

        // With suffix
        if (includeSuffix) {
          suffixes.forEach(suffix => {
            names.push(`${capitalizedKeyword} ${word} ${suffix}`);
            names.push(`${capitalizedKeyword}${word}${suffix}`);
          });
        }
      });

      // Simple combinations
      names.push(`${capitalizedKeyword} Solutions`);
      names.push(`${capitalizedKeyword} Group`);
      names.push(`${capitalizedKeyword} Studio`);
      names.push(`${capitalizedKeyword} Labs`);
      names.push(`${capitalizedKeyword} Hub`);
    });

    // Filter by length preference
    let filtered = names;
    if (length === "short") {
      filtered = names.filter(name => name.replace(/\s/g, "").length <= 12);
    } else if (length === "medium") {
      filtered = names.filter(name => {
        const len = name.replace(/\s/g, "").length;
        return len > 8 && len <= 20;
      });
    } else if (length === "long") {
      filtered = names.filter(name => name.replace(/\s/g, "").length > 15);
    }

    // Remove duplicates and limit
    const unique = Array.from(new Set(filtered));
    const limited = unique.slice(0, 50);

    setGeneratedNames(limited);
    toast.success(`Generated ${limited.length} business names!`);
  };

  const copyName = (name: string) => {
    navigator.clipboard.writeText(name);
    toast.success(`Copied: ${name}`);
  };

  return (
    <ToolLayout
      title="Business Name Generator"
      description="Generate creative business names instantly. Perfect for startups, companies, brands. Get unique, catchy business name ideas. Free business name generator."
      category="Generators"
      instructions={[
        "Enter keywords related to your business (comma-separated)",
        "Select your industry type",
        "Choose naming style and length preference",
        "Optionally include prefixes or suffixes",
        "Click generate and get 50+ unique names",
        "Click any name to copy it"
      ]}
      relatedTools={[
        { name: "Domain Name Generator", path: "/tools/domain-name-generator" },
        { name: "Company Name Generator", path: "/tools/company-name-generator" },
        { name: "Tagline Generator", path: "/tools/tagline-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Keywords Input */}
            <div>
              <Label htmlFor="keywords">Business Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., tech, cloud, software"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter one or more keywords that describe your business
              </p>
            </div>

            {/* Industry Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General / Mixed</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="finance">Finance / Business</SelectItem>
                    <SelectItem value="creative">Creative / Design</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="retail">Retail / E-commerce</SelectItem>
                    <SelectItem value="health">Health / Wellness</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="food">Food / Restaurant</SelectItem>
                    <SelectItem value="fitness">Fitness / Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Name Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (≤12 chars)</SelectItem>
                    <SelectItem value="medium">Medium (8-20 chars)</SelectItem>
                    <SelectItem value="long">Long (15+ chars)</SelectItem>
                    <SelectItem value="any">Any Length</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Style Options */}
            <div>
              <Label>Naming Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern & Tech</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="creative">Creative & Artistic</SelectItem>
                  <SelectItem value="classic">Classic & Traditional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <Label className="text-base">Additional Options</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prefix"
                  checked={includePrefix}
                  onCheckedChange={(checked) => setIncludePrefix(checked as boolean)}
                />
                <label
                  htmlFor="prefix"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include prefixes (The, My, Pro, etc.)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="suffix"
                  checked={includeSuffix}
                  onCheckedChange={(checked) => setIncludeSuffix(checked as boolean)}
                />
                <label
                  htmlFor="suffix"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include suffixes (Hub, Pro, Solutions, etc.)
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <Button onClick={generateNames} className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Business Names
            </Button>
          </CardContent>
        </Card>

        {/* Generated Names */}
        {generatedNames.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Generated Names ({generatedNames.length})
                  </h3>
                </div>
                <Button onClick={generateNames} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>

              {/* Names Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {generatedNames.map((name, index) => (
                  <button
                    key={index}
                    onClick={() => copyName(name)}
                    className="p-3 bg-muted/50 hover:bg-primary/10 rounded-lg text-sm font-medium transition-all cursor-pointer text-left border border-transparent hover:border-primary/20 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1">{name}</span>
                      <Copy className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                Click any name to copy it to clipboard. Remember to check domain availability!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Business Naming Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Keep it Simple:</strong> Easy to spell, pronounce, and remember</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Check Availability:</strong> Verify domain and trademark availability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Be Unique:</strong> Stand out from competitors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Think Long-term:</strong> Name should grow with your business</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Test It Out:</strong> Say it out loud, get feedback from others</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Consider SEO:</strong> Include relevant keywords if possible</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default BusinessNameGenerator;

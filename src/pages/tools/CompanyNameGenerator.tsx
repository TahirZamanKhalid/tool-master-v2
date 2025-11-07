import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Building2, Copy, RefreshCw } from "lucide-react";

const CompanyNameGenerator = () => {
  const [keyword, setKeyword] = useState("");
  const [industry, setIndustry] = useState("technology");
  const [style, setStyle] = useState("professional");
  const [includeSuffix, setIncludeSuffix] = useState(false);
  const [names, setNames] = useState<string[]>([]);

  const prefixes = {
    technology: ["Tech", "Digital", "Smart", "Cyber", "Cloud", "Data", "Net", "Web", "Soft", "Info"],
    finance: ["Capital", "Trust", "Prime", "Asset", "Wealth", "Secure", "Global", "Elite", "Pro", "Summit"],
    healthcare: ["Care", "Health", "Med", "Vital", "Life", "Wellness", "Pure", "Peak", "Prime", "Total"],
    education: ["Learn", "Edu", "Smart", "Bright", "Knowledge", "Scholar", "Mind", "Skill", "Brain", "Wise"],
    consulting: ["Consult", "Advisory", "Expert", "Pro", "Elite", "Strategic", "Prime", "Summit", "Insight", "Vision"],
    retail: ["Shop", "Market", "Trade", "Store", "Outlet", "Bazaar", "Emporium", "Depot", "Hub", "Central"],
    creative: ["Creative", "Design", "Studio", "Art", "Craft", "Vision", "Pixel", "Color", "Bold", "Bright"],
    legal: ["Legal", "Law", "Justice", "Rights", "Counsel", "Advocate", "Attorney", "Litigation", "Partners", "Associates"]
  };

  const suffixes = {
    professional: ["Solutions", "Systems", "Services", "Group", "Associates", "Partners", "Enterprises", "International", "Global", "Corporation"],
    creative: ["Studio", "Lab", "Works", "Creative", "Design", "Media", "Digital", "Agency", "Collective", "House"],
    modern: ["Tech", "Labs", "Hub", "Space", "Cloud", "Digital", "Network", "Platform", "Pro", "Plus"],
    descriptive: ["Experts", "Specialists", "Professionals", "Advisors", "Consultants", "Innovators", "Leaders", "Pioneers"]
  };

  const companyTypes = ["Inc.", "LLC", "Corp.", "Ltd.", "Group", "Co.", "& Associates", "Partners"];

  const connectWords = ["", "and", "&", "Plus", "Pro"];

  const generateNames = () => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    const generated: string[] = [];
    const baseKeyword = keyword.trim();
    const industryPrefixes = prefixes[industry as keyof typeof prefixes];
    const styleSuffixes = suffixes[style as keyof typeof suffixes];

    // Type 1: Prefix + Keyword
    industryPrefixes.forEach(prefix => {
      generated.push(`${prefix}${baseKeyword}`);
      generated.push(`${prefix} ${baseKeyword}`);
    });

    // Type 2: Keyword + Suffix
    styleSuffixes.forEach(suffix => {
      generated.push(`${baseKeyword} ${suffix}`);
    });

    // Type 3: Prefix + Keyword + Suffix
    for (let i = 0; i < 5; i++) {
      const prefix = industryPrefixes[Math.floor(Math.random() * industryPrefixes.length)];
      const suffix = styleSuffixes[Math.floor(Math.random() * styleSuffixes.length)];
      generated.push(`${prefix}${baseKeyword} ${suffix}`);
    }

    // Type 4: Combined words with connectors
    connectWords.forEach(connector => {
      if (connector) {
        generated.push(`${baseKeyword} ${connector} ${industryPrefixes[0]}`);
      }
    });

    // Type 5: With company type suffix if enabled
    if (includeSuffix) {
      companyTypes.forEach(type => {
        generated.push(`${baseKeyword} ${type}`);
        generated.push(`${industryPrefixes[0]}${baseKeyword} ${type}`);
      });
    }

    // Remove duplicates and limit to 50
    const unique = Array.from(new Set(generated)).slice(0, 50);
    setNames(unique);
    toast.success(`Generated ${unique.length} company names!`);
  };

  const copyName = (name: string) => {
    navigator.clipboard.writeText(name);
    toast.success(`Copied: ${name}`);
  };

  return (
    <ToolLayout
      title="Company Name Generator"
      description="Generate professional company names for your business. Perfect for startups, corporations, and enterprises. Free company name generator."
      category="Generators"
      instructions={[
        "Enter a keyword related to your business",
        "Select your industry",
        "Choose naming style",
        "Optionally include company type (LLC, Inc, etc)",
        "Click generate and copy your favorite names"
      ]}
      relatedTools={[
        { name: "Business Name Generator", path: "/tools/business-name-generator" },
        { name: "Domain Name Generator", path: "/tools/domain-name-generator" },
        { name: "Tagline Generator", path: "/tools/tagline-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="keyword">Business Keyword</Label>
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., Innovation, Solutions, Global"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
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
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-suffix"
                checked={includeSuffix}
                onCheckedChange={(checked) => setIncludeSuffix(checked as boolean)}
              />
              <Label htmlFor="include-suffix" className="cursor-pointer">
                Include company type (Inc., LLC, Corp., etc.)
              </Label>
            </div>

            <Button onClick={generateNames} className="w-full" size="lg">
              <Building2 className="h-4 w-4 mr-2" />
              Generate Company Names
            </Button>
          </CardContent>
        </Card>

        {names.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
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
            <h3 className="text-lg font-semibold mb-4">Naming Best Practices</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Keep it short:</strong> Aim for 2-3 words maximum for memorability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Check availability:</strong> Verify domain and trademark availability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Easy to spell:</strong> Avoid complex or ambiguous spellings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Meaningful:</strong> Name should reflect your business values</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Scalable:</strong> Choose a name that allows for business growth</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Legal check:</strong> Consult with a lawyer before finalizing</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default CompanyNameGenerator;

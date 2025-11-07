import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Globe, Copy, Sparkles, ExternalLink } from "lucide-react";

const DomainNameGenerator = () => {
  const [keyword, setKeyword] = useState("");
  const [tld, setTld] = useState(".com");
  const [style, setStyle] = useState("brandable");
  const [domains, setDomains] = useState<string[]>([]);

  const tlds = [".com", ".net", ".org", ".io", ".co", ".ai", ".app", ".dev", ".tech", ".online", ".site", ".store", ".shop", ".biz", ".info"];

  const prefixes = ["get", "my", "the", "go", "try", "use", "hey", "buy", "join", "real", "find"];
  const suffixes = ["hq", "hub", "app", "pro", "now", "box", "zone", "spot", "labs", "works", "base", "ly", "fy", "io"];
  const verbs = ["find", "get", "make", "build", "grow", "start", "run", "try", "use", "shop"];

  const generateDomains = () => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    const clean = keyword.toLowerCase().trim().replace(/\s+/g, "");
    const generated: string[] = [];

    // Direct domain
    generated.push(`${clean}${tld}`);

    if (style === "brandable" || style === "all") {
      // Brandable variations
      suffixes.forEach(suffix => {
        generated.push(`${clean}${suffix}${tld}`);
      });
      prefixes.forEach(prefix => {
        generated.push(`${prefix}${clean}${tld}`);
      });
    }

    if (style === "short" || style === "all") {
      // Short combinations
      const short = clean.substring(0, 4);
      suffixes.slice(0, 5).forEach(suffix => {
        generated.push(`${short}${suffix}${tld}`);
      });
    }

    if (style === "descriptive" || style === "all") {
      // Descriptive with verbs
      verbs.forEach(verb => {
        generated.push(`${verb}${clean}${tld}`);
        generated.push(`${clean}${verb}${tld}`);
      });
    }

    if (style === "creative" || style === "all") {
      // Creative misspellings/variations
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      if (clean.length > 3) {
        const withoutLastVowel = clean.replace(/[aeiou]([^aeiou]*)$/, '$1');
        if (withoutLastVowel !== clean) {
          generated.push(`${withoutLastVowel}${tld}`);
        }
      }

      // Double letters
      if (clean.length <= 6) {
        const doubled = clean + clean[clean.length - 1];
        generated.push(`${doubled}${tld}`);
      }
    }

    // Remove duplicates and limit
    const unique = Array.from(new Set(generated));
    setDomains(unique.slice(0, 40));
    toast.success(`Generated ${Math.min(unique.length, 40)} domain suggestions!`);
  };

  const copyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain);
    toast.success(`Copied: ${domain}`);
  };

  const checkAvailability = (domain: string) => {
    window.open(`https://www.namecheap.com/domains/registration/results/?domain=${domain}`, '_blank');
  };

  return (
    <ToolLayout
      title="Domain Name Generator"
      description="Generate creative domain names for your website or business. Get unique, available domain name ideas with popular TLDs. Free domain name generator."
      category="Generators"
      instructions={[
        "Enter your main keyword or brand name",
        "Select preferred domain extension (TLD)",
        "Choose naming style",
        "Click generate to get domain suggestions",
        "Click domain to copy, or check availability"
      ]}
      relatedTools={[
        { name: "Business Name Generator", path: "/tools/business-name-generator" },
        { name: "Website Speed Test", path: "/tools/website-speed-test" },
        { name: "Meta Tag Generator", path: "/tools/meta-tag-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Keyword Input */}
            <div>
              <Label htmlFor="keyword">Main Keyword or Brand Name</Label>
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., tech, shop, cloud"
                className="mt-2"
              />
            </div>

            {/* TLD and Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Domain Extension (TLD)</Label>
                <Select value={tld} onValueChange={setTld}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tlds.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Domain Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brandable">Brandable</SelectItem>
                    <SelectItem value="short">Short & Catchy</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="all">All Styles (More Results)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <Button onClick={generateDomains} className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Domain Names
            </Button>
          </CardContent>
        </Card>

        {/* Generated Domains */}
        {domains.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  Domain Suggestions ({domains.length})
                </h3>
              </div>

              {/* Domains List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {domains.map((domain, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <span className="font-medium font-mono">{domain}</span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyDomain(domain)}
                        size="sm"
                        variant="ghost"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => checkAvailability(domain)}
                        size="sm"
                        variant="outline"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Check
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                Click "Check" to verify domain availability on Namecheap
              </p>
            </CardContent>
          </Card>
        )}

        {/* Popular TLD Guide */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Domain Extension Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-semibold">.com</p>
                <p className="text-xs text-muted-foreground">Most popular, best for businesses</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-semibold">.io</p>
                <p className="text-xs text-muted-foreground">Tech startups, SaaS products</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-semibold">.ai</p>
                <p className="text-xs text-muted-foreground">AI, machine learning companies</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-semibold">.app</p>
                <p className="text-xs text-muted-foreground">Mobile and web applications</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-semibold">.dev</p>
                <p className="text-xs text-muted-foreground">Developers, tech projects</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-semibold">.store</p>
                <p className="text-xs text-muted-foreground">E-commerce, online shops</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domain Tips */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Domain Name Best Practices</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Keep it Short:</strong> Easier to remember and type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Avoid Numbers/Hyphens:</strong> Can be confusing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Easy to Spell:</strong> No complex or unusual spellings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Brandable:</strong> Unique and memorable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Check Trademarks:</strong> Avoid legal issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Consider .com First:</strong> Most trusted extension</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default DomainNameGenerator;

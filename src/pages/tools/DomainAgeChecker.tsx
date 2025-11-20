import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Calendar, ExternalLink } from "lucide-react";

const DomainAgeChecker = () => {
  const [domain, setDomain] = useState("");

  const checkDomain = () => {
    if (!domain) return;
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    window.open(`https://www.whois.com/whois/${encodeURIComponent(cleanDomain)}`, "_blank");
  };

  return (
    <ToolLayout
      title="Domain Age Checker"
      description="Check when a domain was registered and how old it is. Domain age is an important SEO factor that affects search engine rankings and trustworthiness."
      category="SEO & Marketing"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Check Domain Age
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Enter domain without http:// or https://
              </p>
            </div>
            <Button onClick={checkDomain} disabled={!domain} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Check Domain Age
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Enter a domain name to check its registration date and age. This tool will redirect you
              to WHOIS lookup services for comprehensive domain information.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Why Domain Age Matters for SEO:</h4>
              <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                <li>Older domains often rank better in search results</li>
                <li>Age indicates stability and trustworthiness</li>
                <li>Helps identify expired domain opportunities</li>
                <li>Important for competitive analysis</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domain Information You'll Get</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Registration Date</h4>
                <p className="text-muted-foreground">
                  When the domain was first registered
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Expiration Date</h4>
                <p className="text-muted-foreground">
                  When the domain registration expires
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Registrar Information</h4>
                <p className="text-muted-foreground">
                  Company that registered the domain
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Domain Status</h4>
                <p className="text-muted-foreground">
                  Current status and any restrictions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended WHOIS Lookup Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: "WHOIS.com", url: "https://www.whois.com" },
                { name: "ICANN WHOIS", url: "https://lookup.icann.org" },
                { name: "Domain Tools", url: "https://whois.domaintools.com" },
              ].map((tool, index) => (
                <a
                  key={index}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <span className="font-medium">{tool.name}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default DomainAgeChecker;

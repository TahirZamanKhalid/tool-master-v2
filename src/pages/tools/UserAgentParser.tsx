import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, Monitor } from "lucide-react";
import { toast } from "sonner";

interface ParsedUA {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceType: string;
}

const UserAgentParser = () => {
  const [userAgent, setUserAgent] = useState("");
  const [parsed, setParsed] = useState<ParsedUA | null>(null);

  useEffect(() => {
    // Set current browser's user agent on load
    setUserAgent(navigator.userAgent);
  }, []);

  const parseUserAgent = (ua: string): ParsedUA => {
    const result: ParsedUA = {
      browser: "Unknown",
      browserVersion: "",
      os: "Unknown",
      osVersion: "",
      device: "Unknown",
      deviceType: "Desktop",
    };

    // Browser detection
    if (ua.includes("Firefox/")) {
      result.browser = "Firefox";
      result.browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("Edg/")) {
      result.browser = "Microsoft Edge";
      result.browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("Chrome/") && !ua.includes("Edg/")) {
      result.browser = "Chrome";
      result.browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
      result.browser = "Safari";
      result.browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("Opera/") || ua.includes("OPR/")) {
      result.browser = "Opera";
      result.browserVersion = ua.match(/(?:Opera|OPR)\/([\d.]+)/)?.[1] || "";
    }

    // OS detection
    if (ua.includes("Windows NT")) {
      result.os = "Windows";
      const version = ua.match(/Windows NT ([\d.]+)/)?.[1];
      const windowsVersions: Record<string, string> = {
        "10.0": "10/11",
        "6.3": "8.1",
        "6.2": "8",
        "6.1": "7",
      };
      result.osVersion = windowsVersions[version || ""] || version || "";
    } else if (ua.includes("Mac OS X")) {
      result.os = "macOS";
      result.osVersion = ua.match(/Mac OS X ([\d_]+)/)?.[1].replace(/_/g, ".") || "";
    } else if (ua.includes("Android")) {
      result.os = "Android";
      result.osVersion = ua.match(/Android ([\d.]+)/)?.[1] || "";
      result.deviceType = "Mobile";
    } else if (ua.includes("iPhone") || ua.includes("iPad")) {
      result.os = ua.includes("iPad") ? "iPadOS" : "iOS";
      result.osVersion = ua.match(/OS ([\d_]+)/)?.[1].replace(/_/g, ".") || "";
      result.deviceType = ua.includes("iPad") ? "Tablet" : "Mobile";
    } else if (ua.includes("Linux")) {
      result.os = "Linux";
    }

    // Device detection
    if (ua.includes("iPhone")) {
      result.device = "iPhone";
    } else if (ua.includes("iPad")) {
      result.device = "iPad";
    } else if (ua.includes("Android")) {
      // Try to extract device model
      const deviceMatch = ua.match(/Android.*?;\s*([^)]+)\s*Build/);
      result.device = deviceMatch?.[1] || "Android Device";
    } else {
      result.device = result.deviceType === "Desktop" ? "Computer" : "Unknown";
    }

    // Device type refinement
    if (ua.includes("Mobile") && !ua.includes("Tablet")) {
      result.deviceType = "Mobile";
    } else if (ua.includes("Tablet") || ua.includes("iPad")) {
      result.deviceType = "Tablet";
    }

    return result;
  };

  const handleParse = () => {
    if (!userAgent.trim()) {
      toast.error("Please enter a user agent string");
      return;
    }

    try {
      const result = parseUserAgent(userAgent);
      setParsed(result);
      toast.success("User agent parsed successfully");
    } catch (error) {
      toast.error("Error parsing user agent");
    }
  };

  const useCurrentUA = () => {
    setUserAgent(navigator.userAgent);
    toast.success("Loaded current browser's user agent");
  };

  return (
    <ToolLayout
      title="User Agent Parser"
      description="Parse user agent strings to identify browser, OS, and device information"
      category="Developer Tools"
      instructions={[
        "Enter a user agent string or use your current browser's",
        "Click 'Parse User Agent' to analyze the string",
        "View detailed information about browser, OS, and device",
        "Useful for debugging browser compatibility issues",
      ]}
      relatedTools={[
        { name: "IP Lookup", path: "/tools/ip-lookup" },
        { name: "API Tester", path: "/tools/api-tester" },
        { name: "Meta Tag Generator", path: "/tools/meta-tag-generator" },
      ]}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <Label className="text-base font-semibold">User Agent String</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={useCurrentUA}>
                  <Monitor className="h-4 w-4 mr-2" />
                  Use Current Browser
                </Button>
                <Button onClick={handleParse} disabled={!userAgent.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Parse User Agent
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              className="font-mono text-sm min-h-[100px]"
            />
          </CardContent>
        </Card>

        {parsed && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Browser Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Browser</Label>
                    <p className="text-base font-medium">{parsed.browser}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Version</Label>
                    <p className="text-base font-medium">{parsed.browserVersion || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Operating System</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">OS</Label>
                    <p className="text-base font-medium">{parsed.os}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Version</Label>
                    <p className="text-base font-medium">{parsed.osVersion || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Device Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Device</Label>
                    <p className="text-base font-medium">{parsed.device}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Type</Label>
                    <p className="text-base font-medium">{parsed.deviceType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Raw User Agent</h3>
                <p className="text-sm font-mono break-all text-muted-foreground">
                  {userAgent}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default UserAgentParser;

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Globe,
  MapPin,
  Server,
  Shield,
  Clock,
  Wifi,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  RefreshCw,
  Info,
  Search,
  Zap,
  Eye,
  Hash,
  Navigation,
  Flag,
  Landmark,
  Network,
  Lock,
  Unlock,
  Smartphone,
  Monitor,
  FileJson,
  FileText,
  Share2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface IPData {
  query: string;
  status: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  currency?: string;
  continentCode?: string;
  continent?: string;
  district?: string;
  offset?: number;
  asname?: string;
  reverse?: string;
  message?: string;
}

interface LookupHistory {
  ip: string;
  country: string;
  city: string;
  timestamp: number;
}

// ─── Helper: Fetch IP data with fallback ─────────────────────────────────────

const fetchIPData = async (url: string): Promise<IPData> => {
  // Extract IP from URL for fallback APIs
  const ipMatch = url.match(/\/json\/([^?]+)/);
  const targetIP = ipMatch ? ipMatch[1] : "";

  // Try Supabase Edge Function first
  try {
    const { data, error } = await supabase.functions.invoke("api-proxy", {
      body: { url, method: "GET" },
    });
    if (!error && data?.data) {
      return data.data as IPData;
    }
  } catch (e) {
    console.warn("Supabase proxy unavailable, falling back to direct API call:", e);
  }

  // Try ip-api.com (HTTPS)
  try {
    const httpsUrl = url.replace("http://ip-api.com", "https://ip-api.com");
    const response = await fetch(httpsUrl);
    if (response.ok) {
      return (await response.json()) as IPData;
    }
    // If rate-limited (403), throw to trigger fallback
    if (response.status === 403) {
      throw new Error("Rate limited by ip-api.com");
    }
  } catch (e) {
    console.warn("ip-api.com failed, trying alternative API:", e);
  }

  // Fallback to ipapi.co (more generous free tier: 30k/month)
  try {
    const ipapiUrl = targetIP
      ? `https://ipapi.co/${targetIP}/json/`
      : `https://ipapi.co/json/`;

    const response = await fetch(ipapiUrl);
    if (response.ok) {
      const data = await response.json();
      // Transform ipapi.co response to match ip-api.com format
      return {
        query: data.ip,
        status: "success",
        country: data.country_name,
        countryCode: data.country_code,
        region: data.region_code,
        regionName: data.region,
        city: data.city,
        zip: data.postal,
        lat: data.latitude,
        lon: data.longitude,
        timezone: data.timezone,
        isp: data.org,
        org: data.org,
        as: data.asn,
        asname: data.org,
        currency: data.currency,
        continentCode: data.continent_code,
      } as IPData;
    }
  } catch (e) {
    console.warn("ipapi.co fallback failed:", e);
  }

  // Last resort: try HTTP ip-api.com (may work on localhost)
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`All IP lookup services failed. Please try again in a few minutes.`);
  }
  return (await response.json()) as IPData;
};

// ─── Country flag emoji helper ───────────────────────────────────────────────

const getCountryFlag = (countryCode: string): string => {
  try {
    return String.fromCodePoint(
      ...[...countryCode.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0))
    );
  } catch {
    return "";
  }
};

// ─── Memoized Info Card Component ────────────────────────────────────────────

const InfoCard = memo(
  ({
    icon: Icon,
    label,
    value,
    subValue,
    copyable = false,
    badge,
    className = "",
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    subValue?: string;
    copyable?: boolean;
    badge?: { text: string; variant: "default" | "outline" | "destructive" };
    className?: string;
  }) => {
    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(value);
      toast.success(`${label} copied!`);
    }, [value, label]);

    return (
      <div
        className={`group relative p-4 bg-muted/30 hover:bg-muted/60 rounded-xl border border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm ${className}`}
      >
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            {label}
          </p>
          {copyable && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopy}
              aria-label={`Copy ${label}`}
            >
              <Copy className="w-3 h-3" />
            </Button>
          )}
        </div>
        <p className="font-semibold text-base leading-tight">{value}</p>
        {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
        {badge && (
          <Badge variant={badge.variant} className="mt-2 text-xs">
            {badge.text}
          </Badge>
        )}
      </div>
    );
  }
);

InfoCard.displayName = "InfoCard";

// ─── Security Badge Component ────────────────────────────────────────────────

const SecurityIndicator = memo(
  ({
    detected,
    label,
    description,
    icon: Icon,
  }: {
    detected: boolean;
    label: string;
    description: string;
    icon: React.ElementType;
  }) => (
    <div
      className={`p-5 rounded-xl border-2 transition-all ${detected
        ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30"
        : "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
        }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`p-2 rounded-lg ${detected ? "bg-red-100 dark:bg-red-900/50" : "bg-green-100 dark:bg-green-900/50"
            }`}
        >
          <Icon
            className={`w-5 h-5 ${detected ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
              }`}
          />
        </div>
        <div>
          <p className="font-semibold text-sm">{label}</p>
          <Badge variant={detected ? "destructive" : "default"} className="mt-1 text-xs">
            {detected ? "⚠ Detected" : "✓ Clean"}
          </Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{description}</p>
    </div>
  )
);

SecurityIndicator.displayName = "SecurityIndicator";

// ─── Main Component ─────────────────────────────────────────────────────────

const IPLookup = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [result, setResult] = useState<IPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [myIP, setMyIP] = useState("");
  const [loadingMyIP, setLoadingMyIP] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [lookupHistory, setLookupHistory] = useState<LookupHistory[]>([]);
  const [lookupTime, setLookupTime] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("location");

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ip-lookup-history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setLookupHistory(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save history
  const addToHistory = useCallback((data: IPData) => {
    setLookupHistory((prev) => {
      const newEntry: LookupHistory = {
        ip: data.query,
        country: data.country || "Unknown",
        city: data.city || "Unknown",
        timestamp: Date.now(),
      };
      const updated = [newEntry, ...prev.filter((h) => h.ip !== data.query)].slice(0, 10);
      try {
        localStorage.setItem("ip-lookup-history", JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  // IP validation
  const validateIP = useCallback((ip: string): boolean => {
    if (!ip.trim()) return false;
    const trimmed = ip.trim();

    // IPv4
    const ipv4 =
      /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    if (ipv4.test(trimmed)) return true;

    // IPv6 (simplified)
    const ipv6 =
      /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|::([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
    return ipv6.test(trimmed);
  }, []);

  // Detect user's IP
  const getMyIP = useCallback(async () => {
    setLoadingMyIP(true);
    try {
      const data = await fetchIPData("http://ip-api.com/json/?fields=66846719");

      if (data?.status === "success") {
        setMyIP(data.query);
        setIpAddress(data.query);
        setResult(data);
        addToHistory(data);
        toast.success("Your IP detected & looked up!");
      } else {
        throw new Error(data?.message || "Failed to detect IP");
      }
    } catch (err: any) {
      console.error("IP detection error:", err);
      toast.error(err.message || "Failed to detect your IP address");
    } finally {
      setLoadingMyIP(false);
    }
  }, [addToHistory]);

  // Main lookup function
  const lookupIP = useCallback(
    async (ipToLookup?: string) => {
      const targetIP = (ipToLookup || ipAddress).trim();

      if (!targetIP) {
        toast.error("Please enter an IP address");
        return;
      }

      if (!validateIP(targetIP)) {
        setValidationError(
          "Please enter a valid IPv4 (e.g., 8.8.8.8) or IPv6 address"
        );
        return;
      }

      setValidationError("");
      setLoading(true);
      setResult(null);
      const startTime = performance.now();

      try {
        const data = await fetchIPData(
          `http://ip-api.com/json/${targetIP}?fields=66846719`
        );

        const endTime = performance.now();
        setLookupTime(Math.round(endTime - startTime));

        if (!data) {
          throw new Error("No data received from lookup service");
        }

        if (data.status === "fail") {
          const msg = data.message || "Lookup failed for this IP";
          setValidationError(msg);
          toast.error(msg);
          return;
        }

        setResult(data);
        addToHistory(data);
        toast.success(`Lookup complete in ${Math.round(endTime - startTime)}ms`);
      } catch (err: any) {
        console.error("Lookup error:", err);
        const errorMessage =
          err.message || "Lookup failed. Please try again.";
        toast.error(errorMessage);
        setValidationError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [ipAddress, validateIP, addToHistory]
  );

  // Export functions
  const exportAsJSON = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ip-lookup-${result.query}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported!");
  }, [result]);

  const exportAsCSV = useCallback(() => {
    if (!result) return;
    const headers = Object.keys(result).join(",");
    const values = Object.values(result)
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
    const csv = `${headers}\n${values}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ip-lookup-${result.query}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  }, [result]);

  const exportAsText = useCallback(() => {
    if (!result) return;
    let text = `IP Address Lookup Report\n${"=".repeat(50)}\n\n`;
    text += `IP Address: ${result.query}\n`;
    text += `Status: ${result.status}\n\n`;
    text += `── Location ──\n`;
    if (result.continent) text += `Continent: ${result.continent} (${result.continentCode})\n`;
    if (result.country) text += `Country: ${result.country} (${result.countryCode})\n`;
    if (result.regionName) text += `Region: ${result.regionName} (${result.region})\n`;
    if (result.city) text += `City: ${result.city}\n`;
    if (result.district) text += `District: ${result.district}\n`;
    if (result.zip) text += `ZIP: ${result.zip}\n`;
    if (result.lat != null && result.lon != null)
      text += `Coordinates: ${result.lat}, ${result.lon}\n`;
    if (result.timezone) text += `Timezone: ${result.timezone}\n`;
    if (result.currency) text += `Currency: ${result.currency}\n`;
    text += `\n── Network ──\n`;
    if (result.isp) text += `ISP: ${result.isp}\n`;
    if (result.org) text += `Organization: ${result.org}\n`;
    if (result.as) text += `AS: ${result.as}\n`;
    if (result.asname) text += `AS Name: ${result.asname}\n`;
    text += `Mobile: ${result.mobile ? "Yes" : "No"}\n`;
    text += `\n── Security ──\n`;
    text += `Proxy/VPN: ${result.proxy ? "Detected" : "Not Detected"}\n`;
    text += `Hosting/DC: ${result.hosting ? "Detected" : "Not Detected"}\n`;
    text += `\n${"=".repeat(50)}\n`;
    text += `Generated by ToolMaster | ${new Date().toISOString()}\n`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ip-lookup-${result.query}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Text report exported!");
  }, [result]);

  // Share result
  const shareResult = useCallback(async () => {
    if (!result) return;
    const text = `IP: ${result.query} | Location: ${result.city}, ${result.country} | ISP: ${result.isp}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "IP Lookup Result", text });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }
    navigator.clipboard.writeText(text);
    toast.success("Result copied to clipboard!");
  }, [result]);

  // Computed values
  const securityScore = useMemo(() => {
    if (!result) return 0;
    let score = 100;
    if (result.proxy) score -= 40;
    if (result.hosting) score -= 30;
    if (result.mobile) score -= 5;
    return Math.max(0, score);
  }, [result]);

  const securityColor = useMemo(() => {
    if (securityScore >= 80) return "text-green-600 dark:text-green-400";
    if (securityScore >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  }, [securityScore]);

  const utcOffset = useMemo(() => {
    if (result?.offset == null) return "";
    const hours = result.offset / 3600;
    return `UTC${hours >= 0 ? "+" : ""}${hours}`;
  }, [result]);

  // Quick lookup IPs
  const quickLookups = useMemo(
    () => [
      { label: "Google DNS", ip: "8.8.8.8" },
      { label: "Cloudflare", ip: "1.1.1.1" },
      { label: "OpenDNS", ip: "208.67.222.222" },
      { label: "Quad9", ip: "9.9.9.9" },
    ],
    []
  );

  // Clear history
  const clearHistory = useCallback(() => {
    setLookupHistory([]);
    localStorage.removeItem("ip-lookup-history");
    toast.success("History cleared");
  }, []);

  // Result entries for raw data tab
  const resultEntries = useMemo(() => {
    if (!result) return [];
    return Object.entries(result);
  }, [result]);

  return (
    <ToolLayout
      title="IP Address Lookup Tool - Free IP Geolocation & Security Checker"
      description="Instantly find detailed geolocation, ISP, organization, proxy/VPN detection, and security analysis for any IPv4 or IPv6 address. Free, fast, and accurate IP lookup tool."
      category="Developer Tools"
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* ── Hero Input Section ──────────────────────────────── */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardContent className="p-6 space-y-4">
            {/* Main input row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={ipAddress}
                  onChange={(e) => {
                    setIpAddress(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="Enter any IP address (e.g., 8.8.8.8)"
                  onKeyDown={(e) => e.key === "Enter" && lookupIP()}
                  className={`pl-10 h-12 text-base ${validationError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                    }`}
                  aria-label="IP address input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => lookupIP()}
                  disabled={loading}
                  size="lg"
                  className="h-12 px-6 font-semibold"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Looking up..." : "Lookup IP"}
                </Button>
                <Button
                  onClick={getMyIP}
                  disabled={loadingMyIP}
                  variant="outline"
                  size="lg"
                  className="h-12"
                >
                  {loadingMyIP ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  {loadingMyIP ? "Detecting..." : "What's My IP?"}
                </Button>
              </div>
            </div>

            {validationError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {validationError}
              </p>
            )}

            {/* Quick lookup buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                Quick lookup:
              </span>
              {quickLookups.map((q) => (
                <Button
                  key={q.ip}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2.5 bg-muted/50 hover:bg-muted"
                  onClick={() => {
                    setIpAddress(q.ip);
                    lookupIP(q.ip);
                  }}
                >
                  {q.label}
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              ))}
            </div>

            {/* Current IP indicator */}
            {myIP && !result && (
              <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
                <Globe className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  Your IP address:{" "}
                  <strong className="font-mono">{myIP}</strong>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* ── Lookup History ──────────────────────────────────── */}
        {lookupHistory.length > 0 && !result && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recent Lookups
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={clearHistory}
                >
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {lookupHistory.map((h) => (
                  <Button
                    key={`${h.ip}-${h.timestamp}`}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-mono"
                    onClick={() => {
                      setIpAddress(h.ip);
                      lookupIP(h.ip);
                    }}
                  >
                    {h.ip}
                    <span className="ml-1.5 text-muted-foreground font-sans">
                      {h.city}, {h.country}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Results Section ─────────────────────────────────── */}
        {result && (
          <>
            {/* Result Header */}
            <Card className="border-2 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold font-mono">
                        {result.query}
                      </h2>
                      <Badge
                        variant={
                          securityScore >= 80
                            ? "default"
                            : securityScore >= 50
                              ? "outline"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {securityScore >= 80 ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Clean
                          </>
                        ) : securityScore >= 50 ? (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-1" /> Caution
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-1" /> Flagged
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {[result.city, result.regionName, result.country]
                        .filter(Boolean)
                        .join(", ")}
                      {result.isp && ` • ${result.isp}`}
                    </p>
                    {lookupTime > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Lookup completed in {lookupTime}ms
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => lookupIP(result.query)}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
                    </Button>
                    <Button onClick={shareResult} variant="outline" size="sm">
                      <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
                    </Button>
                    <Button onClick={exportAsJSON} variant="outline" size="sm">
                      <FileJson className="h-3.5 w-3.5 mr-1.5" /> JSON
                    </Button>
                    <Button onClick={exportAsCSV} variant="outline" size="sm">
                      <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
                    </Button>
                    <Button onClick={exportAsText} variant="outline" size="sm">
                      <FileText className="h-3.5 w-3.5 mr-1.5" /> TXT
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-t divide-x">
                <div className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Country</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {result.countryCode && (
                      <span className="mr-1">
                        {getCountryFlag(result.countryCode)}
                      </span>
                    )}
                    {result.country || "N/A"}
                  </p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {result.city || "N/A"}
                  </p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">ISP</p>
                  <p className="font-semibold text-sm mt-0.5 truncate">
                    {result.isp || "N/A"}
                  </p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Security Score
                  </p>
                  <p className={`font-bold text-sm mt-0.5 ${securityColor}`}>
                    {securityScore}/100
                  </p>
                </div>
              </div>
            </Card>

            {/* Detailed Tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-4 rounded-none border-b bg-muted/30 h-12">
                    <TabsTrigger
                      value="location"
                      className="text-xs sm:text-sm data-[state=active]:bg-background"
                    >
                      <MapPin className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                      Location
                    </TabsTrigger>
                    <TabsTrigger
                      value="network"
                      className="text-xs sm:text-sm data-[state=active]:bg-background"
                    >
                      <Network className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                      Network
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      className="text-xs sm:text-sm data-[state=active]:bg-background"
                    >
                      <Shield className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger
                      value="raw"
                      className="text-xs sm:text-sm data-[state=active]:bg-background"
                    >
                      <Hash className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                      Raw Data
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Location Tab ──────────────────────────── */}
                  <TabsContent value="location" className="p-6 mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoCard
                        icon={Globe}
                        label="IP Address"
                        value={result.query}
                        copyable
                      />
                      {result.continent && (
                        <InfoCard
                          icon={Globe}
                          label="Continent"
                          value={result.continent}
                          badge={
                            result.continentCode
                              ? {
                                text: result.continentCode,
                                variant: "outline",
                              }
                              : undefined
                          }
                        />
                      )}
                      {result.country && (
                        <InfoCard
                          icon={Flag}
                          label="Country"
                          value={`${result.countryCode
                            ? getCountryFlag(result.countryCode) + " "
                            : ""
                            }${result.country}`}
                          badge={
                            result.countryCode
                              ? {
                                text: result.countryCode,
                                variant: "outline",
                              }
                              : undefined
                          }
                          copyable
                        />
                      )}
                      {result.regionName && (
                        <InfoCard
                          icon={MapPin}
                          label="Region / State"
                          value={result.regionName}
                          badge={
                            result.region
                              ? { text: result.region, variant: "outline" }
                              : undefined
                          }
                        />
                      )}
                      {result.city && (
                        <InfoCard
                          icon={Building2}
                          label="City"
                          value={result.city}
                          copyable
                        />
                      )}
                      {result.district && (
                        <InfoCard
                          icon={Landmark}
                          label="District"
                          value={result.district}
                        />
                      )}
                      {result.zip && (
                        <InfoCard
                          icon={Hash}
                          label="ZIP / Postal Code"
                          value={result.zip}
                          copyable
                        />
                      )}
                      {result.timezone && (
                        <InfoCard
                          icon={Clock}
                          label="Timezone"
                          value={result.timezone}
                          subValue={
                            utcOffset ? `Offset: ${utcOffset}` : undefined
                          }
                        />
                      )}
                      {result.currency && (
                        <InfoCard
                          icon={Landmark}
                          label="Currency"
                          value={result.currency}
                        />
                      )}

                      {/* Map Card */}
                      {result.lat != null && result.lon != null && (
                        <div className="col-span-full p-4 bg-muted/30 rounded-xl border border-border/50">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Navigation className="w-3.5 h-3.5" />
                              Geographic Coordinates
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${result.lat}, ${result.lon}`
                                  );
                                  toast.success("Coordinates copied!");
                                }}
                              >
                                <Copy className="w-3 h-3 mr-1" /> Copy
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  window.open(
                                    `https://www.google.com/maps?q=${result.lat},${result.lon}`,
                                    "_blank",
                                    "noopener,noreferrer"
                                  )
                                }
                              >
                                <ExternalLink className="w-3 h-3 mr-1" /> Open
                                Map
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Latitude
                              </p>
                              <p className="font-mono font-semibold">
                                {result.lat.toFixed(6)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Longitude
                              </p>
                              <p className="font-mono font-semibold">
                                {result.lon.toFixed(6)}
                              </p>
                            </div>
                          </div>
                          {/* Embedded Map */}
                          <div className="mt-3 rounded-lg overflow-hidden border">
                            <iframe
                              title="IP Location Map"
                              width="100%"
                              height="250"
                              style={{ border: 0 }}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${result.lon - 0.05
                                },${result.lat - 0.05},${result.lon + 0.05},${result.lat + 0.05
                                }&layer=mapnik&marker=${result.lat},${result.lon
                                }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* ── Network Tab ───────────────────────────── */}
                  <TabsContent value="network" className="p-6 mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {result.isp && (
                        <InfoCard
                          icon={Wifi}
                          label="Internet Service Provider"
                          value={result.isp}
                          copyable
                        />
                      )}
                      {result.org && (
                        <InfoCard
                          icon={Building2}
                          label="Organization"
                          value={result.org}
                          copyable
                        />
                      )}
                      {result.as && (
                        <InfoCard
                          icon={Server}
                          label="AS Number"
                          value={result.as}
                          copyable
                        />
                      )}
                      {result.asname && (
                        <InfoCard
                          icon={Network}
                          label="AS Name"
                          value={result.asname}
                          copyable
                        />
                      )}
                      {result.reverse && (
                        <InfoCard
                          icon={Globe}
                          label="Reverse DNS"
                          value={result.reverse}
                          copyable
                        />
                      )}
                      <InfoCard
                        icon={result.mobile ? Smartphone : Monitor}
                        label="Connection Type"
                        value={
                          result.mobile
                            ? "Mobile / Cellular Network"
                            : "Fixed / Broadband Network"
                        }
                        badge={{
                          text: result.mobile ? "Mobile" : "Fixed",
                          variant: "outline",
                        }}
                      />
                    </div>
                  </TabsContent>

                  {/* ── Security Tab ──────────────────────────── */}
                  <TabsContent value="security" className="p-6 mt-0">
                    <div className="space-y-6">
                      {/* Security Score */}
                      <div className="text-center p-6 rounded-xl bg-muted/30 border">
                        <p className="text-sm text-muted-foreground mb-2">
                          Security Trust Score
                        </p>
                        <div
                          className={`text-5xl font-bold ${securityColor}`}
                        >
                          {securityScore}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          out of 100
                        </p>
                        <div className="w-full bg-muted rounded-full h-2.5 mt-4 max-w-xs mx-auto">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${securityScore >= 80
                              ? "bg-green-500"
                              : securityScore >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                              }`}
                            style={{ width: `${securityScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Security Indicators */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <SecurityIndicator
                          detected={!!result.proxy}
                          label="Proxy / VPN / Tor"
                          description={
                            result.proxy
                              ? "This IP is associated with a proxy, VPN, or Tor exit node. Traffic may be anonymized."
                              : "No proxy, VPN, or Tor usage detected. Connection appears direct."
                          }
                          icon={result.proxy ? Unlock : Lock}
                        />
                        <SecurityIndicator
                          detected={!!result.hosting}
                          label="Hosting / Data Center"
                          description={
                            result.hosting
                              ? "This IP belongs to a hosting provider or data center. It may be used for automated traffic."
                              : "Not associated with hosting infrastructure. Appears to be a residential or business IP."
                          }
                          icon={Server}
                        />
                        <SecurityIndicator
                          detected={!!result.mobile}
                          label="Mobile Network"
                          description={
                            result.mobile
                              ? "This IP is from a mobile/cellular network. IP may change frequently (dynamic)."
                              : "Fixed/broadband connection detected. IP is likely more stable."
                          }
                          icon={result.mobile ? Smartphone : Monitor}
                        />
                      </div>

                      {/* Security Summary */}
                      <Alert
                        variant={
                          securityScore >= 80 ? "default" : "destructive"
                        }
                        className={
                          securityScore >= 80
                            ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
                            : ""
                        }
                      >
                        {securityScore >= 80 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <AlertDescription>
                          {securityScore >= 80 ? (
                            <span>
                              <strong>Low Risk:</strong> This IP address appears
                              to be a legitimate residential or business
                              connection with no security concerns detected.
                              Trust score: {securityScore}/100.
                            </span>
                          ) : securityScore >= 50 ? (
                            <span>
                              <strong>Medium Risk:</strong> Some flags were
                              detected for this IP address. Exercise caution
                              when interacting with traffic from this source.
                              Trust score: {securityScore}/100.
                            </span>
                          ) : (
                            <span>
                              <strong>High Risk:</strong> Multiple security
                              flags detected. This IP is likely associated with
                              anonymization services or automated
                              infrastructure. Trust score: {securityScore}/100.
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>

                  {/* ── Raw Data Tab ──────────────────────────── */}
                  <TabsContent value="raw" className="p-6 mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Complete API response data
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              JSON.stringify(result, null, 2)
                            );
                            toast.success("Raw data copied!");
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" /> Copy All
                        </Button>
                      </div>
                      <pre className="bg-muted/50 border rounded-xl p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-96">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {resultEntries.map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border text-sm"
                          >
                            <span className="font-mono text-xs text-muted-foreground">
                              {key}
                            </span>
                            <span className="font-mono text-xs font-medium truncate ml-4 max-w-[60%] text-right">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── SEO Content Section ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                What is an IP Address Lookup?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                An <strong>IP address lookup</strong> (also called{" "}
                <em>IP geolocation</em>) is the process of determining the
                geographic location, internet service provider, and other
                technical details associated with an Internet Protocol (IP)
                address.
              </p>
              <p>
                Every device connected to the internet is assigned a unique IP
                address—either <strong>IPv4</strong> (e.g., 192.168.1.1) or{" "}
                <strong>IPv6</strong> (e.g., 2001:db8::1). This address serves
                as a digital identifier that reveals information about the
                device&apos;s network connection.
              </p>
              <p>
                Our free IP lookup tool provides instant access to
                comprehensive data including country, city, ISP, organization,
                timezone, coordinates, and advanced security analysis such as{" "}
                <strong>proxy/VPN detection</strong> and{" "}
                <strong>data center identification</strong>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-2.5">
                {[
                  {
                    icon: MapPin,
                    label: "geolocation",
                    text: "Precise geolocation with city-level accuracy and coordinates",
                  },
                  {
                    icon: Wifi,
                    label: "isp",
                    text: "ISP, organization, and AS number identification",
                  },
                  {
                    icon: Shield,
                    label: "security",
                    text: "Proxy, VPN, Tor, and hosting/data center detection",
                  },
                  {
                    icon: Clock,
                    label: "timezone",
                    text: "Timezone, UTC offset, and local currency information",
                  },
                  {
                    icon: Smartphone,
                    label: "mobile",
                    text: "Mobile vs. fixed network connection detection",
                  },
                  {
                    icon: Download,
                    label: "export",
                    text: "Export results as JSON, CSV, or formatted text reports",
                  },
                  {
                    icon: Globe,
                    label: "ipv6",
                    text: "Support for both IPv4 and IPv6 addresses",
                  },
                  {
                    icon: Zap,
                    label: "speed",
                    text: "Lightning-fast lookups with performance timing",
                  },
                ].map(({ icon: Icon, label, text }) => (
                  <li key={label} className="flex items-start gap-2.5">
                    <Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section for SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {[
              {
                id: "accuracy",
                q: "How accurate is IP geolocation?",
                a: "IP geolocation is typically accurate to the city level (around 80-90% accuracy). Country-level accuracy is near 99%. Exact street addresses cannot be determined from IP addresses alone.",
              },
              {
                id: "any-ip",
                q: "Can I look up any IP address?",
                a: "Yes, you can look up any public IPv4 or IPv6 address. Private IP addresses (like 192.168.x.x or 10.x.x.x) cannot be geolocated as they are used within local networks.",
              },
              {
                id: "proxy",
                q: "What does proxy/VPN detection mean?",
                a: "Our tool checks if an IP address is associated with known proxy servers, VPN services, or Tor exit nodes. This helps identify potentially anonymized or masked connections.",
              },
              {
                id: "free",
                q: "Is this IP lookup tool free?",
                a: "Yes, ToolMaster's IP Address Lookup is completely free to use with no registration required. You can perform unlimited lookups and export results in multiple formats.",
              },
              {
                id: "as-number",
                q: "What is an AS number?",
                a: "An Autonomous System (AS) number is a unique identifier assigned to networks on the internet. It helps identify which organization controls a specific range of IP addresses.",
              },
            ].map(({ id, q, a }) => (
              <div key={id} className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-1.5">{q}</h3>
                <p className="text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy Note */}
        <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
            <strong>Privacy & Security:</strong> This tool uses public IP
            geolocation databases for lookups. No personal data is collected,
            stored, or shared. Lookup history is stored locally in your browser
            and can be cleared at any time. All queries are processed securely.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  );
};

export default IPLookup;
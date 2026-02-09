import { useState, useCallback, useMemo, useEffect } from "react";
import { AdSpace } from "@/components/AdSpace";
import { AdRow } from "@/components/AdRow";
import { InFeedAd } from "@/components/InFeedAd";
import { LazyAdSpace } from "@/components/LazyAdSpace";
import { SidebarAd } from "@/components/SidebarAd";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Calendar,
  ExternalLink,
  Loader2,
  Search,
  Clock,
  Shield,
  Building2,
  Server,
  Copy,
  Download,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
  FileJson,
  FileText,
  Share2,
  ChevronRight,
  Timer,
  CalendarDays,
  CalendarClock,
  Hash,
  Link2,
  TrendingUp,
  Award,
  History,
} from "lucide-react";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface WhoisData {
  domainName: string;
  registrar?: string;
  registrarUrl?: string;
  creationDate?: string;
  expirationDate?: string;
  updatedDate?: string;
  status?: string[];
  nameServers?: string[];
  dnssec?: string;
  registrantOrg?: string;
  registrantCountry?: string;
  registrantState?: string;
  whoisServer?: string;
  rawText?: string;
}

interface DomainAge {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

interface DomainHistory {
  domain: string;
  age: string;
  timestamp: number;
}

// ─── Helper: Calculate age from date ─────────────────────────────────────────

const calculateAge = (dateStr: string): DomainAge | null => {
  try {
    const created = new Date(dateStr);
    if (isNaN(created.getTime())) return null;

    const now = new Date();
    const totalMs = now.getTime() - created.getTime();
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));

    let years = now.getFullYear() - created.getFullYear();
    let months = now.getMonth() - created.getMonth();
    let days = now.getDate() - created.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days, totalDays };
  } catch {
    return null;
  }
};

// ─── Helper: Format date nicely ──────────────────────────────────────────────

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// ─── Helper: Days until expiration ───────────────────────────────────────────

const daysUntilExpiry = (dateStr?: string): number | null => {
  if (!dateStr) return null;
  try {
    const exp = new Date(dateStr);
    if (isNaN(exp.getTime())) return null;
    const now = new Date();
    return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

// ─── Helper: Clean domain input ──────────────────────────────────────────────

const cleanDomain = (input: string): string => {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/^www\./, "");
  d = d.replace(/\/.*$/, "");
  d = d.replace(/[?#].*$/, "");
  return d;
};

// ─── Helper: Validate domain ────────────────────────────────────────────────

const isValidDomain = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
  return domainRegex.test(domain);
};

// ─── Helper: Parse WHOIS text ────────────────────────────────────────────────

const parseWhoisText = (text: string): WhoisData => {
  const data: WhoisData = { domainName: "" };

  const getField = (patterns: string[]): string | undefined => {
    for (const pattern of patterns) {
      const regex = new RegExp(`${pattern}\\s*:\\s*(.+)`, "im");
      const match = text.match(regex);
      if (match) return match[1].trim();
    }
    return undefined;
  };

  data.domainName = getField(["Domain Name"]) || "";
  data.registrar = getField(["Registrar", "Sponsoring Registrar"]);
  data.registrarUrl = getField(["Registrar URL", "Referral URL"]);
  data.creationDate = getField([
    "Creation Date",
    "Created Date",
    "Created",
    "Registration Date",
    "created",
    "Domain Registration Date",
  ]);
  data.expirationDate = getField([
    "Registry Expiry Date",
    "Expiration Date",
    "Expiry Date",
    "Expires",
    "paid-till",
    "Domain Expiration Date",
  ]);
  data.updatedDate = getField([
    "Updated Date",
    "Last Updated",
    "Last Modified",
    "modified",
  ]);
  data.whoisServer = getField(["WHOIS Server", "Registrar WHOIS Server"]);
  data.dnssec = getField(["DNSSEC"]);
  data.registrantOrg = getField([
    "Registrant Organization",
    "Registrant",
    "org",
  ]);
  data.registrantCountry = getField([
    "Registrant Country",
    "Registrant Country/Economy",
  ]);
  data.registrantState = getField([
    "Registrant State/Province",
    "Registrant State",
  ]);

  const statusMatches = text.match(/(?:Domain )?Status\s*:\s*(.+)/gim);
  if (statusMatches) {
    data.status = statusMatches.map((s) =>
      s.replace(/(?:Domain )?Status\s*:\s*/i, "").trim()
    );
  }

  const nsMatches = text.match(/Name Server\s*:\s*(.+)/gim);
  if (nsMatches) {
    data.nameServers = nsMatches.map((s) =>
      s.replace(/Name Server\s*:\s*/i, "").trim().toLowerCase()
    );
  }

  data.rawText = text;
  return data;
};

// ─── Fetch WHOIS data with fallback ──────────────────────────────────────────

const fetchWhoisData = async (domain: string): Promise<WhoisData> => {
  try {
    const response = await fetch("/api-proxy.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `https://whois.freeaitools.me/?domain=${encodeURIComponent(domain)}`,
        method: "GET",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.data) {
        if (typeof data.data === "string") {
          return parseWhoisText(data.data);
        }
        if (typeof data.data === "object") {
          return data.data as WhoisData;
        }
      }
    }
  } catch (e) {
    console.warn("PHP proxy unavailable for WHOIS:", e);
  }

  try {
    const tld = domain.split(".").pop()?.toLowerCase();
    const rdapBootstrap = await fetch("https://data.iana.org/rdap/dns.json");
    const bootstrap = await rdapBootstrap.json();

    let rdapUrl = "";
    for (const service of bootstrap.services) {
      const tlds = service[0];
      const urls = service[1];
      if (tlds.includes(tld)) {
        rdapUrl = urls[0];
        break;
      }
    }

    if (rdapUrl) {
      const rdapResponse = await fetch(
        `${rdapUrl}domain/${encodeURIComponent(domain)}`,
        {
          headers: { Accept: "application/rdap+json" },
        }
      );

      if (rdapResponse.ok) {
        const rdapData = await rdapResponse.json();
        return parseRDAPData(rdapData, domain);
      }
    }
  } catch (e) {
    console.warn("RDAP lookup failed:", e);
  }

  try {
    const response = await fetch(
      `https://api.api-ninjas.com/v1/whois?domain=${encodeURIComponent(domain)}`,
      {
        headers: {
          "X-Api-Key": "free",
        },
      }
    );
    if (response.ok) {
      const apiData = await response.json();
      if (apiData && !apiData.error) {
        return normalizeApiData(apiData, domain);
      }
    }
  } catch (e) {
    console.warn("Alternative WHOIS API failed:", e);
  }

  throw new Error(
    "Unable to fetch WHOIS data. The domain may not exist or WHOIS services are temporarily unavailable."
  );
};

// ─── Parse RDAP response ─────────────────────────────────────────────────────

const parseRDAPData = (rdap: any, domain: string): WhoisData => {
  const data: WhoisData = { domainName: rdap.ldhName || domain };

  if (rdap.events) {
    for (const event of rdap.events) {
      switch (event.eventAction) {
        case "registration":
          data.creationDate = event.eventDate;
          break;
        case "expiration":
          data.expirationDate = event.eventDate;
          break;
        case "last changed":
        case "last update of RDAP database":
          if (!data.updatedDate) data.updatedDate = event.eventDate;
          break;
      }
    }
  }

  if (rdap.status) {
    data.status = rdap.status;
  }

  if (rdap.nameservers) {
    data.nameServers = rdap.nameservers.map(
      (ns: any) => ns.ldhName?.toLowerCase() || ns.objectClassName
    );
  }

  if (rdap.entities) {
    for (const entity of rdap.entities) {
      if (entity.roles?.includes("registrar")) {
        const vcard = entity.vcardArray?.[1];
        if (vcard) {
          const fn = vcard.find((v: any) => v[0] === "fn");
          if (fn) data.registrar = fn[3];
        }
        if (entity.publicIds) {
          data.registrar =
            data.registrar ||
            entity.publicIds[0]?.identifier;
        }
      }
      if (entity.roles?.includes("registrant")) {
        const vcard = entity.vcardArray?.[1];
        if (vcard) {
          const org = vcard.find((v: any) => v[0] === "org");
          if (org) data.registrantOrg = org[3];
        }
      }
    }
  }

  if (rdap.secureDNS) {
    data.dnssec = rdap.secureDNS.delegationSigned ? "signed" : "unsigned";
  }

  if (rdap.port43) {
    data.whoisServer = rdap.port43;
  }

  return data;
};

// ─── Normalize alternative API data ──────────────────────────────────────────

const normalizeApiData = (apiData: any, domain: string): WhoisData => {
  return {
    domainName: apiData.domain_name || domain,
    registrar: apiData.registrar,
    creationDate: apiData.creation_date
      ? new Date(apiData.creation_date * 1000).toISOString()
      : undefined,
    expirationDate: apiData.expiration_date
      ? new Date(apiData.expiration_date * 1000).toISOString()
      : undefined,
    updatedDate: apiData.updated_date
      ? new Date(apiData.updated_date * 1000).toISOString()
      : undefined,
    nameServers: apiData.name_servers,
    status: apiData.status
      ? Array.isArray(apiData.status)
        ? apiData.status
        : [apiData.status]
      : undefined,
    registrantOrg: apiData.org,
    registrantCountry: apiData.country,
    registrantState: apiData.state,
    dnssec: apiData.dnssec,
  };
};

// ─── InfoRow Component ───────────────────────────────────────────────────────

const InfoRow = ({
  icon: Icon,
  label,
  value,
  copyable = false,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
  badge?: { text: string; variant: "default" | "outline" | "destructive" | "secondary" };
}) => (
  <div className="group flex items-start gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-border transition-all">
    <div className="p-1.5 bg-primary/10 rounded-md mt-0.5">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="font-semibold text-sm mt-0.5 break-all">{value}</p>
      {badge && (
        <Badge variant={badge.variant} className="mt-1.5 text-xs">
          {badge.text}
        </Badge>
      )}
    </div>
    {copyable && (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast.success(`${label} copied!`);
        }}
        aria-label={`Copy ${label}`}
      >
        <Copy className="w-3 h-3" />
      </Button>
    )}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────

const DomainAgeChecker = () => {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<WhoisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lookupTime, setLookupTime] = useState(0);
  const [history, setHistory] = useState<DomainHistory[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("domain-age-history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const addToHistory = useCallback((domainName: string, ageStr: string) => {
    setHistory((prev) => {
      const entry: DomainHistory = {
        domain: domainName,
        age: ageStr,
        timestamp: Date.now(),
      };
      const updated = [entry, ...prev.filter((h) => h.domain !== domainName)].slice(0, 15);
      try {
        localStorage.setItem("domain-age-history", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const checkDomain = useCallback(
    async (domainToCheck?: string) => {
      const raw = domainToCheck || domain;
      if (!raw.trim()) {
        toast.error("Please enter a domain name");
        return;
      }

      const cleaned = cleanDomain(raw);
      if (!isValidDomain(cleaned)) {
        setError("Please enter a valid domain name (e.g., example.com)");
        return;
      }

      setError("");
      setLoading(true);
      setResult(null);
      const startTime = performance.now();

      try {
        const whoisData = await fetchWhoisData(cleaned);
        const endTime = performance.now();
        setLookupTime(Math.round(endTime - startTime));

        if (!whoisData.domainName) {
          whoisData.domainName = cleaned;
        }

        setResult(whoisData);

        const age = whoisData.creationDate
          ? calculateAge(whoisData.creationDate)
          : null;
        const ageStr = age
          ? `${age.years}y ${age.months}m`
          : "Unknown";
        addToHistory(cleaned, ageStr);

        toast.success(`Domain lookup complete in ${Math.round(endTime - startTime)}ms`);
      } catch (err: any) {
        console.error("Domain lookup error:", err);
        const msg = err.message || "Failed to look up domain. Please try again.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [domain, addToHistory]
  );

  const domainAge = useMemo(() => {
    if (!result?.creationDate) return null;
    return calculateAge(result.creationDate);
  }, [result]);

  const expiryDays = useMemo(() => {
    return daysUntilExpiry(result?.expirationDate);
  }, [result]);

  const ageTrustLevel = useMemo(() => {
    if (!domainAge) return { level: "unknown", color: "text-muted-foreground", label: "Unknown" };
    if (domainAge.totalDays >= 3650)
      return { level: "excellent", color: "text-green-600 dark:text-green-400", label: "Highly Trusted" };
    if (domainAge.totalDays >= 1825)
      return { level: "good", color: "text-blue-600 dark:text-blue-400", label: "Trusted" };
    if (domainAge.totalDays >= 365)
      return { level: "moderate", color: "text-yellow-600 dark:text-yellow-400", label: "Moderate" };
    return { level: "new", color: "text-orange-600 dark:text-orange-400", label: "New Domain" };
  }, [domainAge]);

  const expiryStatus = useMemo(() => {
    if (expiryDays === null) return null;
    if (expiryDays < 0) return { label: "Expired", color: "text-red-600", variant: "destructive" as const };
    if (expiryDays < 30) return { label: "Expiring Soon!", color: "text-red-600", variant: "destructive" as const };
    if (expiryDays < 90) return { label: "Renew Soon", color: "text-yellow-600", variant: "outline" as const };
    return { label: "Active", color: "text-green-600", variant: "default" as const };
  }, [expiryDays]);

  const exportAsJSON = useCallback(() => {
    if (!result) return;
    const exportData = { ...result, domainAge, expiryDays };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `domain-age-${result.domainName}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported!");
  }, [result, domainAge, expiryDays]);

  const exportAsText = useCallback(() => {
    if (!result) return;
    let text = `Domain Age Report\n${"=".repeat(50)}\n\n`;
    text += `Domain: ${result.domainName}\n`;
    if (domainAge) {
      text += `Age: ${domainAge.years} years, ${domainAge.months} months, ${domainAge.days} days (${domainAge.totalDays} total days)\n`;
    }
    text += `\n── Registration Details ──\n`;
    if (result.creationDate) text += `Created: ${formatDate(result.creationDate)}\n`;
    if (result.expirationDate) text += `Expires: ${formatDate(result.expirationDate)}\n`;
    if (result.updatedDate) text += `Updated: ${formatDate(result.updatedDate)}\n`;
    if (result.registrar) text += `Registrar: ${result.registrar}\n`;
    if (result.registrantOrg) text += `Organization: ${result.registrantOrg}\n`;
    if (result.registrantCountry) text += `Country: ${result.registrantCountry}\n`;
    if (result.nameServers?.length) {
      text += `\n── Name Servers ──\n`;
      result.nameServers.forEach((ns) => (text += `  ${ns}\n`));
    }
    if (result.status?.length) {
      text += `\n── Domain Status ──\n`;
      result.status.forEach((s) => (text += `  ${s}\n`));
    }
    text += `\n${"=".repeat(50)}\n`;
    text += `Generated by ToolMaster | ${new Date().toISOString()}\n`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `domain-age-${result.domainName}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported!");
  }, [result, domainAge]);

  const shareResult = useCallback(async () => {
    if (!result) return;
    const ageStr = domainAge
      ? `${domainAge.years}y ${domainAge.months}m ${domainAge.days}d`
      : "Unknown";
    const text = `Domain: ${result.domainName} | Age: ${ageStr} | Registrar: ${result.registrar || "N/A"}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Domain Age Result", text });
        return;
      } catch { /* fall through */ }
    }
    navigator.clipboard.writeText(text);
    toast.success("Result copied to clipboard!");
  }, [result, domainAge]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem("domain-age-history");
    toast.success("History cleared");
  }, []);

  const quickDomains = useMemo(
    () => [
      { label: "Google", domain: "google.com" },
      { label: "Facebook", domain: "facebook.com" },
      { label: "Amazon", domain: "amazon.com" },
      { label: "Wikipedia", domain: "wikipedia.org" },
      { label: "GitHub", domain: "github.com" },
    ],
    []
  );

  return (
    <ToolLayout
      title="Domain Age Checker - Free WHOIS Lookup & Domain Registration Date"
      description="Check any domain's age, registration date, expiration, registrar, name servers, and WHOIS information instantly. Free domain age checker tool for SEO analysis."
      category="SEO & Marketing"
    >
      {/* Main content + Sidebar layout */}
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">

        {/* ── Main Content Column ──────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* ── Top Leaderboard Ad ──────────────────────────── */}
          <AdSpace slot="9769564871" size="leaderboard" className="w-full" />

          {/* ── Input Section ──────────────────────────────────── */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter domain name (e.g., example.com)"
                    onKeyDown={(e) => e.key === "Enter" && checkDomain()}
                    className={`pl-10 h-12 text-base ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-label="Domain name input"
                  />
                </div>
                <Button
                  onClick={() => checkDomain()}
                  disabled={loading}
                  size="lg"
                  className="h-12 px-6 font-semibold"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Checking..." : "Check Domain Age"}
                </Button>
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </p>
              )}

              {/* Quick lookups */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Try:</span>
                {quickDomains.map((q) => (
                  <Button
                    key={q.domain}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2.5 bg-muted/50 hover:bg-muted"
                    onClick={() => {
                      setDomain(q.domain);
                      checkDomain(q.domain);
                    }}
                  >
                    {q.label}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── In-Feed Ad after Input ──────────────────────── */}
          <InFeedAd slot="4739066253" layout="desktop" className="w-full" />

          {/* ── History ─────────────────────────────────────────── */}
          {history.length > 0 && !result && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent Lookups
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearHistory}>
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <Button
                      key={`${h.domain}-${h.timestamp}`}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        setDomain(h.domain);
                        checkDomain(h.domain);
                      }}
                    >
                      <Globe className="w-3 h-3 mr-1.5" />
                      {h.domain}
                      <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                        {h.age}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Results ─────────────────────────────────────────── */}
          {result && (
            <>
              {/* Result Header with Age Display */}
              <Card className="border-2 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold">{result.domainName}</h2>
                        {ageTrustLevel.level !== "unknown" && (
                          <Badge
                            variant={
                              ageTrustLevel.level === "excellent" || ageTrustLevel.level === "good"
                                ? "default"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            <Award className="w-3 h-3 mr-1" />
                            {ageTrustLevel.label}
                          </Badge>
                        )}
                      </div>
                      {domainAge && (
                        <p className="text-sm text-muted-foreground">
                          Registered {formatDate(result.creationDate)}
                          {result.registrar && ` via ${result.registrar}`}
                        </p>
                      )}
                      {lookupTime > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Lookup completed in {lookupTime}ms
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => checkDomain(result.domainName)} variant="outline" size="sm">
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
                      </Button>
                      <Button onClick={shareResult} variant="outline" size="sm">
                        <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
                      </Button>
                      <Button onClick={exportAsJSON} variant="outline" size="sm">
                        <FileJson className="h-3.5 w-3.5 mr-1.5" /> JSON
                      </Button>
                      <Button onClick={exportAsText} variant="outline" size="sm">
                        <FileText className="h-3.5 w-3.5 mr-1.5" /> Report
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Age Display Bar */}
                {domainAge && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 border-t divide-x">
                    <div className="p-4 text-center">
                      <p className="text-3xl font-bold text-primary">{domainAge.years}</p>
                      <p className="text-xs text-muted-foreground mt-1">Years</p>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-3xl font-bold text-primary">{domainAge.months}</p>
                      <p className="text-xs text-muted-foreground mt-1">Months</p>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-3xl font-bold text-primary">{domainAge.days}</p>
                      <p className="text-xs text-muted-foreground mt-1">Days</p>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-3xl font-bold text-muted-foreground">{domainAge.totalDays.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Days</p>
                    </div>
                  </div>
                )}

                {/* Expiry Warning */}
                {expiryStatus && expiryDays !== null && (
                  <div className="border-t p-3">
                    <Alert
                      variant={expiryStatus.variant === "destructive" ? "destructive" : "default"}
                      className={
                        expiryStatus.variant !== "destructive"
                          ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
                          : ""
                      }
                    >
                      {expiryDays < 30 ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      <AlertDescription>
                        {expiryDays < 0 ? (
                          <span><strong>Domain Expired!</strong> This domain expired {Math.abs(expiryDays)} days ago.</span>
                        ) : (
                          <span>
                            <strong>{expiryStatus.label}:</strong> Domain expires in{" "}
                            <strong>{expiryDays.toLocaleString()} days</strong> ({formatDate(result.expirationDate)})
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </Card>

              {/* ── Display Ad after Result Header ────────────── */}
              <AdSpace slot="2918331088" size="leaderboard" className="w-full" />

              {/* Detailed Tabs */}
              <Card>
                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-4 rounded-none border-b bg-muted/30 h-12">
                      <TabsTrigger value="overview" className="text-xs sm:text-sm">
                        <CalendarDays className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="technical" className="text-xs sm:text-sm">
                        <Server className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                        Technical
                      </TabsTrigger>
                      <TabsTrigger value="seo" className="text-xs sm:text-sm">
                        <TrendingUp className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                        SEO Impact
                      </TabsTrigger>
                      <TabsTrigger value="raw" className="text-xs sm:text-sm">
                        <Hash className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                        Raw Data
                      </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="p-6 mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoRow
                          icon={Globe}
                          label="Domain Name"
                          value={result.domainName}
                          copyable
                        />
                        {result.creationDate && (
                          <InfoRow
                            icon={CalendarDays}
                            label="Registration Date"
                            value={formatDate(result.creationDate)}
                            copyable
                          />
                        )}
                        {result.expirationDate && (
                          <InfoRow
                            icon={CalendarClock}
                            label="Expiration Date"
                            value={formatDate(result.expirationDate)}
                            badge={
                              expiryStatus
                                ? { text: expiryStatus.label, variant: expiryStatus.variant }
                                : undefined
                            }
                            copyable
                          />
                        )}
                        {result.updatedDate && (
                          <InfoRow
                            icon={RefreshCw}
                            label="Last Updated"
                            value={formatDate(result.updatedDate)}
                          />
                        )}
                        {result.registrar && (
                          <InfoRow
                            icon={Building2}
                            label="Registrar"
                            value={result.registrar}
                            copyable
                          />
                        )}
                        {result.registrarUrl && (
                          <InfoRow
                            icon={Link2}
                            label="Registrar URL"
                            value={result.registrarUrl}
                            copyable
                          />
                        )}
                        {result.registrantOrg && (
                          <InfoRow
                            icon={Building2}
                            label="Registrant Organization"
                            value={result.registrantOrg}
                            copyable
                          />
                        )}
                        {result.registrantCountry && (
                          <InfoRow
                            icon={Globe}
                            label="Registrant Country"
                            value={result.registrantCountry}
                          />
                        )}
                        {domainAge && (
                          <InfoRow
                            icon={Timer}
                            label="Domain Age"
                            value={`${domainAge.years} years, ${domainAge.months} months, ${domainAge.days} days`}
                            badge={{ text: ageTrustLevel.label, variant: ageTrustLevel.level === "excellent" || ageTrustLevel.level === "good" ? "default" : "outline" }}
                          />
                        )}
                      </div>

                      {/* ── In-Feed Ad inside Overview Tab ───────── */}
                      <div className="mt-6">
                        <InFeedAd slot="1968211491" layout="desktop" className="w-full" />
                      </div>
                    </TabsContent>

                    {/* Technical Tab */}
                    <TabsContent value="technical" className="p-6 mt-0">
                      <div className="space-y-6">
                        {/* Name Servers */}
                        {result.nameServers && result.nameServers.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Server className="w-4 h-4 text-primary" />
                              Name Servers ({result.nameServers.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {result.nameServers.map((ns, index) => (
                                <div
                                  key={`ns-${index}-${ns}`}
                                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border text-sm font-mono"
                                >
                                  <span className="truncate">{ns}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 shrink-0 ml-2"
                                    onClick={() => {
                                      navigator.clipboard.writeText(ns);
                                      toast.success("Name server copied!");
                                    }}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── Display Ad between Technical sections ─ */}
                        <AdSpace slot="4402803148" size="leaderboard" className="w-full" />

                        {/* Domain Status */}
                        {result.status && result.status.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Shield className="w-4 h-4 text-primary" />
                              Domain Status ({result.status.length})
                            </h3>
                            <div className="space-y-2">
                              {result.status.map((status, index) => {
                                const statusName = status.split(" ")[0];
                                const isLocked = statusName.toLowerCase().includes("lock") || statusName.toLowerCase().includes("prohibited");
                                return (
                                  <div
                                    key={`status-${index}-${statusName}`}
                                    className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg border text-sm"
                                  >
                                    {isLocked ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                    ) : (
                                      <Info className="w-4 h-4 text-blue-600 shrink-0" />
                                    )}
                                    <span className="break-all">{status}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Other Technical Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {result.dnssec && (
                            <InfoRow
                              icon={Shield}
                              label="DNSSEC"
                              value={result.dnssec}
                              badge={{
                                text: result.dnssec.toLowerCase().includes("signed") ? "Signed" : "Unsigned",
                                variant: result.dnssec.toLowerCase().includes("signed") ? "default" : "outline",
                              }}
                            />
                          )}
                          {result.whoisServer && (
                            <InfoRow
                              icon={Server}
                              label="WHOIS Server"
                              value={result.whoisServer}
                              copyable
                            />
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* SEO Impact Tab */}
                    <TabsContent value="seo" className="p-6 mt-0">
                      <div className="space-y-6">
                        {/* Trust Score */}
                        <div className="text-center p-6 rounded-xl bg-muted/30 border">
                          <p className="text-sm text-muted-foreground mb-2">Domain Age Trust Score</p>
                          <div className={`text-5xl font-bold ${ageTrustLevel.color}`}>
                            {domainAge
                              ? domainAge.totalDays >= 3650
                                ? "A+"
                                : domainAge.totalDays >= 1825
                                  ? "A"
                                  : domainAge.totalDays >= 730
                                    ? "B"
                                    : domainAge.totalDays >= 365
                                      ? "C"
                                      : "D"
                              : "?"}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {ageTrustLevel.label}
                          </p>
                          {domainAge && (
                            <div className="w-full bg-muted rounded-full h-2.5 mt-4 max-w-xs mx-auto">
                              <div
                                className={`h-2.5 rounded-full transition-all duration-500 ${domainAge.totalDays >= 3650
                                  ? "bg-green-500"
                                  : domainAge.totalDays >= 1825
                                    ? "bg-blue-500"
                                    : domainAge.totalDays >= 365
                                      ? "bg-yellow-500"
                                      : "bg-orange-500"
                                  }`}
                                style={{
                                  width: `${Math.min(100, (domainAge.totalDays / 3650) * 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* ── Display Ad in SEO Tab ──────────────── */}
                        <AdSpace slot="9239216915" size="leaderboard" className="w-full" />

                        {/* SEO Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              id: "age-factor",
                              title: "Domain Age as Ranking Factor",
                              description:
                                domainAge && domainAge.totalDays >= 1825
                                  ? "This domain is well-established. Search engines generally trust older domains more, which can positively impact search rankings."
                                  : domainAge && domainAge.totalDays >= 365
                                    ? "This domain has been around for a reasonable time. Continue building quality backlinks and content to establish more authority."
                                    : "This is a relatively new domain. Focus on high-quality content, strong backlink profile, and consistent publishing to build trust over time.",
                              icon: TrendingUp,
                              status: domainAge && domainAge.totalDays >= 1825 ? "positive" : domainAge && domainAge.totalDays >= 365 ? "neutral" : "negative",
                            },
                            {
                              id: "expiry-factor",
                              title: "Domain Expiration & SEO",
                              description:
                                expiryDays && expiryDays > 365
                                  ? "Domain is registered well into the future. Long registration periods signal legitimacy to search engines."
                                  : expiryDays && expiryDays > 0
                                    ? "Consider extending your domain registration. Domains registered for longer periods may receive a slight trust boost."
                                    : "Domain expiration information is not available or the domain may be expired.",
                              icon: CalendarClock,
                              status: expiryDays && expiryDays > 365 ? "positive" : expiryDays && expiryDays > 0 ? "neutral" : "negative",
                            },
                            {
                              id: "dnssec-factor",
                              title: "DNSSEC & Security",
                              description:
                                result.dnssec?.toLowerCase().includes("signed")
                                  ? "DNSSEC is enabled, providing an additional layer of security. This signals trustworthiness to both users and search engines."
                                  : "DNSSEC is not enabled. While not a direct ranking factor, enabling DNSSEC improves security and trust.",
                              icon: Shield,
                              status: result.dnssec?.toLowerCase().includes("signed") ? "positive" : "neutral",
                            },
                            {
                              id: "registrar-factor",
                              title: "Registrar Reputation",
                              description: result.registrar
                                ? `Registered with ${result.registrar}. Using a reputable registrar is a positive trust signal.`
                                : "Registrar information is not available.",
                              icon: Building2,
                              status: result.registrar ? "positive" : "neutral",
                            },
                          ].map((insight) => (
                            <div
                              key={insight.id}
                              className={`p-4 rounded-xl border-2 ${insight.status === "positive"
                                ? "border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20"
                                : insight.status === "negative"
                                  ? "border-orange-200 bg-orange-50/30 dark:border-orange-900/50 dark:bg-orange-950/20"
                                  : "border-border bg-muted/20"
                                }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <insight.icon className={`w-5 h-5 ${insight.status === "positive"
                                  ? "text-green-600"
                                  : insight.status === "negative"
                                    ? "text-orange-600"
                                    : "text-muted-foreground"
                                  }`} />
                                <h4 className="font-semibold text-sm">{insight.title}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {insight.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Raw Data Tab */}
                    <TabsContent value="raw" className="p-6 mt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">Complete WHOIS data</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              const rawData = result.rawText || JSON.stringify(result, null, 2);
                              navigator.clipboard.writeText(rawData);
                              toast.success("Raw data copied!");
                            }}
                          >
                            <Copy className="w-3 h-3 mr-1" /> Copy All
                          </Button>
                        </div>
                        {result.rawText ? (
                          <pre className="bg-muted/50 border rounded-xl p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-96 whitespace-pre-wrap">
                            {result.rawText}
                          </pre>
                        ) : (
                          <>
                            <pre className="bg-muted/50 border rounded-xl p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-96">
                              {JSON.stringify(result, null, 2)}
                            </pre>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {Object.entries(result)
                                .filter(([key]) => key !== "rawText")
                                .map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border text-sm"
                                  >
                                    <span className="font-mono text-xs text-muted-foreground">{key}</span>
                                    <span className="font-mono text-xs font-medium truncate ml-4 max-w-[60%] text-right">
                                      {Array.isArray(value) ? value.join(", ") : String(value)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </>
                        )}

                        {/* ── Display Ad at bottom of Raw Tab ────── */}
                        <div className="mt-4">
                          <AdSpace slot="8923135106" size="leaderboard" className="w-full" />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* ── Multiplex Ad after Tabs ─────────────────────── */}
              <AdRow slot="2127993591" className="w-full" />

              {/* External WHOIS Links */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Verify with External WHOIS Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { name: "WHOIS.com", url: `https://www.whois.com/whois/${result.domainName}` },
                      { name: "ICANN WHOIS", url: `https://lookup.icann.org/en/lookup?name=${result.domainName}` },
                      { name: "DomainTools", url: `https://whois.domaintools.com/${result.domainName}` },
                    ].map((tool) => (
                      <a
                        key={tool.name}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors text-sm"
                      >
                        <span className="font-medium">{tool.name}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ── Display Ad after External Links ──────────── */}
              <AdSpace slot="4202125614" size="leaderboard" className="w-full" />
            </>
          )}

          {/* ── Multiplex Ad before SEO Content ─────────────── */}
          <AdRow slot="4356563508" className="w-full" />

          {/* ── SEO Content ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  What is Domain Age?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong>Domain age</strong> refers to the length of time a domain name has been registered
                  and active on the internet. It is calculated from the <em>domain registration date</em>{" "}
                  (also called the creation date) found in the WHOIS database.
                </p>
                <p>
                  Domain age is considered an important factor in <strong>search engine optimization (SEO)</strong>.
                  Older domains tend to have more backlinks, established authority, and higher trust scores
                  with search engines like Google and Bing.
                </p>
                <p>
                  Our free domain age checker performs a real-time <strong>WHOIS lookup</strong> to retrieve
                  the exact registration date, expiration date, registrar information, name servers, and
                  domain status codes—all without leaving the page.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Why Domain Age Matters for SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2.5">
                  {[
                    {
                      icon: Award,
                      id: "trust",
                      text: "Older domains are generally seen as more trustworthy by search engines",
                    },
                    {
                      icon: TrendingUp,
                      id: "ranking",
                      text: "Established domains often rank better for competitive keywords",
                    },
                    {
                      icon: Shield,
                      id: "spam",
                      text: "New domains undergo a 'sandbox' period where rankings may be suppressed",
                    },
                    {
                      icon: Clock,
                      id: "history",
                      text: "Domain history and age contribute to overall domain authority scores",
                    },
                    {
                      icon: Calendar,
                      id: "expiry",
                      text: "Longer registration periods signal commitment and legitimacy",
                    },
                    {
                      icon: Globe,
                      id: "backlinks",
                      text: "Older domains have more time to accumulate quality backlinks",
                    },
                  ].map(({ icon: Icon, id, text }) => (
                    <li key={id} className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* ── In-Feed Ad between SEO content and FAQ ──────── */}
          <InFeedAd slot="4739066253" layout="desktop" className="w-full" />

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {[
                {
                  id: "how-check",
                  q: "How do I check the age of a domain?",
                  a: "Enter any domain name in the search box above and click 'Check Domain Age'. Our tool performs a real-time WHOIS lookup to find the exact registration date and calculates the domain's age automatically.",
                },
                {
                  id: "what-whois",
                  q: "What is WHOIS data?",
                  a: "WHOIS is a public database that stores registration information about domain names. It includes the registration date, expiration date, registrar, name servers, and sometimes registrant contact details.",
                },
                {
                  id: "seo-impact",
                  q: "Does domain age directly affect SEO rankings?",
                  a: "While Google has stated that domain age is not a direct ranking factor, older domains tend to have more backlinks, content, and established authority—all of which positively influence rankings. It's more of a correlation than a direct cause.",
                },
                {
                  id: "expired",
                  q: "Can I buy an expired domain for SEO benefits?",
                  a: "Buying an expired domain can provide SEO benefits if the domain has a clean history, quality backlinks, and relevant content history. However, domains with spammy history can actually harm your SEO.",
                },
                {
                  id: "accuracy",
                  q: "How accurate is the domain age data?",
                  a: "Our tool uses real-time WHOIS/RDAP lookups from official registry databases, providing the most accurate registration dates available. Some registries may have different date formats or redacted information due to privacy regulations.",
                },
              ].map(({ id, q, a }, index) => (
                <>
                  <div key={id} className="p-4 bg-muted/30 rounded-lg border">
                    <h3 className="font-semibold text-foreground mb-1.5">{q}</h3>
                    <p className="text-muted-foreground leading-relaxed">{a}</p>
                  </div>
                  {/* Ad after 3rd FAQ item */}
                  {index === 2 && (
                    <div key="faq-ad" className="py-2">
                      <AdSpace slot="2889043946" size="leaderboard" className="w-full" />
                    </div>
                  )}
                </>
              ))}
            </CardContent>
          </Card>

          {/* ── Multiplex Ad after FAQ ──────────────────────── */}
          <AdRow slot="7202218695" className="w-full" />

          {/* Privacy Note */}
          <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
              <strong>Privacy & Accuracy:</strong> This tool performs real-time WHOIS/RDAP lookups using public
              registry databases. No search data is stored on our servers. Lookup history is saved locally in
              your browser only. Some domains may have limited WHOIS data due to privacy protection services.
            </AlertDescription>
          </Alert>

          {/* ── Bottom Leaderboard Ad ──────────────────────── */}
          <AdSpace slot="1575962277" size="banner" className="w-full" />
        </div>

        {/* ── Sidebar Column (Desktop only) ────────────────── */}
        {/* ── Sidebar Column (Desktop only) ────────────────── */}
        <aside className="hidden lg:block w-[300px] shrink-0">
          <div className="space-y-6">
            {/* First sidebar ad - sticky */}
            <div className="sticky top-4">
              <div style={{ width: "300px", minHeight: "600px" }}>
                <AdSpace slot="5628599414" size="sidebar" />
              </div>
            </div>

            {/* Second sidebar ad - NOT sticky, flows naturally */}
            <div style={{ width: "300px", minHeight: "600px" }}>
              <AdSpace slot="1212397554" size="skyscraper" />
            </div>

            {/* Third sidebar ad */}
            <div style={{ width: "300px", minHeight: "300px" }}>
              <AdSpace slot="4153181237" size="square-300" />
            </div>

            {/* Fourth sidebar ad */}
            <div style={{ width: "300px", minHeight: "250px" }}>
              <AdSpace slot="7713152297" size="medium-rect" />
            </div>

            {/* Fifth sidebar ad - lazy loaded */}
            <div style={{ width: "300px", minHeight: "600px" }}>
              <LazyAdSpace slot="7110517063" format="vertical" />
            </div>
          </div>
        </aside>
      </div>
    </ToolLayout>
  );
};

export default DomainAgeChecker;
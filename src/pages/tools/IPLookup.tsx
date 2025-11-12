import { useState, useEffect } from "react";
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
} from "lucide-react";

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
}

const IPLookup = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [result, setResult] = useState<IPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [myIP, setMyIP] = useState<string>("");
  const [loadingMyIP, setLoadingMyIP] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Validate IP address format
  const validateIP = (ip: string): boolean => {
    if (!ip) return false;

    // IPv4 validation
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // IPv6 validation (simplified)
    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  // Get user's current IP
  const getMyIP = async () => {
    setLoadingMyIP(true);
    try {
      const { data, error } = await supabase.functions.invoke("api-proxy", {
        body: {
          url: "http://ip-api.com/json/?fields=66846719",
          method: "GET",
        },
      });

      if (error) throw error;

      if (data.data.status === "success") {
        setMyIP(data.data.query);
        setIpAddress(data.data.query);
        toast.success("Your IP address detected!");
      }
    } catch (error) {
      console.error("Error getting IP:", error);
      toast.error("Failed to detect your IP address");
    } finally {
      setLoadingMyIP(false);
    }
  };

  // Perform IP lookup with enhanced error handling
  const lookupIP = async (ipToLookup?: string) => {
    const targetIP = ipToLookup || ipAddress;

    if (!targetIP) {
      toast.error("Please enter an IP address");
      return;
    }

    // Validate IP format
    if (!validateIP(targetIP)) {
      setValidationError("Invalid IP address format. Please enter a valid IPv4 or IPv6 address.");
      toast.error("Invalid IP address format");
      return;
    }

    setValidationError("");
    setLoading(true);
    setResult(null);

    try {
      // Using comprehensive field set for maximum information
      // Fields parameter breakdown:
      // 66846719 includes: status, message, continent, continentCode, country, countryCode,
      // region, regionName, city, district, zip, lat, lon, timezone, offset, currency,
      // isp, org, as, asname, mobile, proxy, hosting, query

      const { data, error } = await supabase.functions.invoke("api-proxy", {
        body: {
          url: `http://ip-api.com/json/${targetIP}?fields=66846719`,
          method: "GET",
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error("Failed to connect to lookup service");
      }

      if (!data || !data.data) {
        throw new Error("No data received from lookup service");
      }

      if (data.data.status === "fail") {
        const errorMsg = data.data.message || "Invalid IP address or lookup failed";
        toast.error(errorMsg);
        setValidationError(errorMsg);
        return;
      }

      setResult(data.data);
      toast.success("IP lookup completed successfully!");
    } catch (error: any) {
      console.error("IP lookup error:", error);
      const errorMessage = error.message || "Failed to lookup IP address. Please try again.";
      toast.error(errorMessage);
      setValidationError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Export data as JSON
  const exportAsJSON = () => {
    if (!result) return;

    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ip-lookup-${result.query}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  // Get security badge color
  const getSecurityBadge = () => {
    if (!result) return null;

    const isSecure = !result.proxy && !result.hosting;
    return (
      <Badge variant={isSecure ? "default" : "destructive"} className="ml-2">
        {isSecure ? (
          <>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Secure
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3 mr-1" />
            Flagged
          </>
        )}
      </Badge>
    );
  };

  // Auto-detect IP on component mount (optional)
  useEffect(() => {
    // Uncomment the line below if you want to auto-detect user's IP on page load
    // getMyIP();
  }, []);

  return (
    <ToolLayout
      title="Advanced IP Address Lookup"
      description="Get comprehensive location, ISP, security, and technical details of any IP address"
      category="Developer Tools"
    >
      <div className="space-y-6">
        {/* Input Section */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  value={ipAddress}
                  onChange={(e) => {
                    setIpAddress(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="Enter IP address (e.g., 8.8.8.8 or 2001:4860:4860::8888)"
                  onKeyDown={(e) => e.key === "Enter" && lookupIP()}
                  className={validationError ? "border-red-500" : ""}
                />
                {validationError && <p className="text-sm text-red-500 mt-1">{validationError}</p>}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => lookupIP()} disabled={loading} className="flex-1 sm:flex-initial">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Looking up...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Lookup
                    </>
                  )}
                </Button>
                <Button onClick={getMyIP} disabled={loadingMyIP} variant="outline" className="flex-1 sm:flex-initial">
                  {loadingMyIP ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Wifi className="mr-2 h-4 w-4" />
                      My IP
                    </>
                  )}
                </Button>
              </div>
            </div>

            {myIP && !result && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your current IP address is: <strong>{myIP}</strong>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CardTitle>IP Information: {result.query}</CardTitle>
                  {getSecurityBadge()}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => lookupIP(result.query)} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={exportAsJSON} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* General Information Tab */}
                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* IP Address */}
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          IP Address
                        </p>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.query, "IP Address")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="font-semibold text-lg">{result.query}</p>
                    </div>

                    {/* Country */}
                    {result.country && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-2">Country</p>
                        <p className="font-semibold">
                          {result.country}
                          {result.countryCode && (
                            <Badge variant="outline" className="ml-2">
                              {result.countryCode}
                            </Badge>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Continent */}
                    {result.continent && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-2">Continent</p>
                        <p className="font-semibold">
                          {result.continent}
                          {result.continentCode && (
                            <Badge variant="outline" className="ml-2">
                              {result.continentCode}
                            </Badge>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Region */}
                    {result.regionName && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4" />
                          Region
                        </p>
                        <p className="font-semibold">
                          {result.regionName}
                          {result.region && (
                            <Badge variant="outline" className="ml-2">
                              {result.region}
                            </Badge>
                          )}
                        </p>
                      </div>
                    )}

                    {/* City */}
                    {result.city && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4" />
                          City
                        </p>
                        <p className="font-semibold">{result.city}</p>
                      </div>
                    )}

                    {/* District */}
                    {result.district && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-2">District</p>
                        <p className="font-semibold">{result.district}</p>
                      </div>
                    )}

                    {/* ZIP Code */}
                    {result.zip && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-2">ZIP / Postal Code</p>
                        <p className="font-semibold">{result.zip}</p>
                      </div>
                    )}

                    {/* Timezone */}
                    {result.timezone && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4" />
                          Timezone
                        </p>
                        <p className="font-semibold">
                          {result.timezone}
                          {result.offset !== undefined && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (UTC{result.offset >= 0 ? "+" : ""}
                              {result.offset / 3600})
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Currency */}
                    {result.currency && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-2">Currency</p>
                        <p className="font-semibold">{result.currency}</p>
                      </div>
                    )}

                    {/* Coordinates */}
                    {result.lat !== undefined && result.lon !== undefined && (
                      <div className="p-4 bg-muted/50 rounded-lg border col-span-full">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Geographic Coordinates
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`${result.lat}, ${result.lon}`, "Coordinates")}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(`https://www.google.com/maps?q=${result.lat},${result.lon}`, "_blank")
                              }
                            >
                              View on Map
                            </Button>
                          </div>
                        </div>
                        <p className="font-semibold">
                          Latitude: {result.lat.toFixed(6)}, Longitude: {result.lon.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Network Information Tab */}
                <TabsContent value="network" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ISP */}
                    {result.isp && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Wifi className="w-4 h-4" />
                            Internet Service Provider (ISP)
                          </p>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.isp!, "ISP")}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="font-semibold">{result.isp}</p>
                      </div>
                    )}

                    {/* Organization */}
                    {result.org && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Organization
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.org!, "Organization")}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="font-semibold">{result.org}</p>
                      </div>
                    )}

                    {/* AS Number */}
                    {result.as && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Server className="w-4 h-4" />
                            Autonomous System (AS)
                          </p>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.as!, "AS Number")}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="font-semibold">{result.as}</p>
                      </div>
                    )}

                    {/* AS Name */}
                    {result.asname && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-2">AS Name</p>
                        <p className="font-semibold">{result.asname}</p>
                      </div>
                    )}

                    {/* Mobile Connection */}
                    {result.mobile !== undefined && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-2">Mobile Connection</p>
                        <Badge variant={result.mobile ? "default" : "outline"}>
                          {result.mobile ? "Yes - Mobile Network" : "No - Fixed Network"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Security Information Tab */}
                <TabsContent value="security" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Proxy Detection */}
                    {result.proxy !== undefined && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4" />
                          Proxy / VPN Detection
                        </p>
                        <Badge variant={result.proxy ? "destructive" : "default"}>
                          {result.proxy ? (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Detected
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Not Detected
                            </>
                          )}
                        </Badge>
                        {result.proxy && (
                          <p className="text-xs text-muted-foreground mt-2">
                            This IP is using a proxy, VPN, or Tor exit node
                          </p>
                        )}
                      </div>
                    )}

                    {/* Hosting Detection */}
                    {result.hosting !== undefined && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                          <Server className="w-4 h-4" />
                          Hosting / Data Center
                        </p>
                        <Badge variant={result.hosting ? "destructive" : "default"}>
                          {result.hosting ? (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Detected
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Not Detected
                            </>
                          )}
                        </Badge>
                        {result.hosting && (
                          <p className="text-xs text-muted-foreground mt-2">
                            This IP belongs to a hosting provider or data center
                          </p>
                        )}
                      </div>
                    )}

                    {/* Security Summary */}
                    <div className="p-4 bg-muted/50 rounded-lg border col-span-full">
                      <p className="text-sm text-muted-foreground mb-3">Security Summary</p>
                      <div className="space-y-2">
                        {!result.proxy && !result.hosting ? (
                          <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                              This appears to be a legitimate residential or business IP address with no security
                              concerns detected.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Security flags detected. This IP may be associated with:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                {result.proxy && <li>Proxy, VPN, or anonymization service</li>}
                                {result.hosting && <li>Hosting provider or data center infrastructure</li>}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About IP Lookup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>This tool provides comprehensive information about any IPv4 or IPv6 address, including:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Geographic Location:</strong> Country, region, city, and precise coordinates
              </li>
              <li>
                <strong>Network Information:</strong> ISP, organization, and autonomous system details
              </li>
              <li>
                <strong>Security Analysis:</strong> Proxy, VPN, and data center detection
              </li>
              <li>
                <strong>Time & Currency:</strong> Timezone and local currency information
              </li>
            </ul>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacy Note:</strong> This tool uses public IP geolocation databases. Location accuracy varies
                and is typically at the city level. No data is stored on our servers.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default IPLookup;

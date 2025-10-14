import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, MapPin, Globe, Shield, Wifi, Copy, Check } from "lucide-react";

const IPLookup = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const isValidIP = (ip) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

    if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
      return false;
    }

    if (ipv4Regex.test(ip)) {
      const parts = ip.split(".");
      return parts.every((part) => {
        const num = parseInt(part);
        return !isNaN(num) && num >= 0 && num <= 255;
      });
    }

    return true;
  };

  const lookupIP = async () => {
    setError("");

    if (!ipAddress.trim()) {
      setError("Please enter an IP address");
      return;
    }

    if (!isValidIP(ipAddress)) {
      setError("Invalid IP address format. Use IPv4 (e.g., 8.8.8.8) or IPv6");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Primary API: ip-api.com
      let data = null;

      try {
        const response = await fetch(`https://ip-api.com/json/${ipAddress}?fields=66846719`, {
          method: "GET",
          headers: { Accept: "application/json" },
          mode: "cors",
        });

        if (response.ok) {
          data = await response.json();
          if (data.status === "success") {
            setResult(data);
            toast.success("✅ IP lookup successful!");
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.log("Primary API failed, trying backup...");
      }

      // Backup API: ipapi.co
      try {
        const backupResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`, { mode: "cors" });

        if (backupResponse.ok) {
          const backupData = await backupResponse.json();

          if (!backupData.error) {
            setResult({
              query: backupData.ip,
              country: backupData.country_name || "N/A",
              countryCode: backupData.country_code || "N/A",
              region: backupData.region || "N/A",
              regionName: backupData.region || "N/A",
              city: backupData.city || "N/A",
              zip: backupData.postal || "N/A",
              timezone: backupData.timezone || "N/A",
              lat: backupData.latitude || "N/A",
              lon: backupData.longitude || "N/A",
              isp: backupData.org || "N/A",
              org: backupData.org || "N/A",
              as: backupData.asn || "N/A",
              proxy: false,
              hosting: false,
              mobile: false,
            });
            toast.success("✅ IP lookup successful (backup API)!");
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.log("Backup API failed too");
      }

      // Fallback: ip-api.com without fields parameter
      try {
        const fallbackResponse = await fetch(`https://ip-api.com/json/${ipAddress}`, { mode: "cors" });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.status === "success") {
            setResult(fallbackData);
            toast.success("✅ IP lookup successful (limited data)!");
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.log("Fallback failed");
      }

      throw new Error("All IP lookup services unavailable");
    } catch (error) {
      console.error("IP lookup error:", error);
      setError(`Error: ${error.message}`);
      toast.error(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      lookupIP();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">IP Lookup Tool</h1>
          </div>
          <p className="text-blue-200 text-sm md:text-base">Get detailed geolocation and network information</p>
        </div>

        {/* Search Card */}
        <Card className="mb-6 shadow-2xl border-blue-500/30 bg-slate-800/50 backdrop-blur">
          <CardContent className="p-4 md:p-6">
            <div className="flex gap-2 flex-col md:flex-row">
              <Input
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-base md:text-lg flex-1"
                disabled={loading}
              />
              <Button
                onClick={lookupIP}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 md:px-8 w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Searching</span>
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Lookup</span>
                    <span className="sm:hidden">Go</span>
                  </>
                )}
              </Button>
            </div>
            {error && (
              <div className="text-red-400 text-sm mt-3 p-3 bg-red-500/10 rounded border border-red-500/30 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
            {/* Location Info */}
            <Card className="shadow-2xl border-blue-500/30 bg-slate-800/50 backdrop-blur overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <MapPin className="w-5 h-5" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {[
                    { label: "IP Address", value: result.query, copy: true },
                    { label: "Country", value: `${result.country} (${result.countryCode})` },
                    { label: "Region", value: result.regionName || result.region || "N/A" },
                    { label: "City", value: result.city || "N/A" },
                    { label: "ZIP Code", value: result.zip || "N/A" },
                    { label: "Timezone", value: result.timezone || "N/A" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 md:p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-colors"
                    >
                      <p className="text-xs md:text-sm text-blue-300 font-semibold uppercase tracking-wide">
                        {item.label}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <p className="text-sm md:text-base font-bold text-white break-all">{item.value}</p>
                        {item.copy && (
                          <button
                            onClick={() => copyToClipboard(item.value)}
                            className="p-1 hover:bg-blue-500/20 rounded transition-colors flex-shrink-0"
                            title="Copy to clipboard"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-blue-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Coordinates */}
            <Card className="shadow-2xl border-green-500/30 bg-slate-800/50 backdrop-blur overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Globe className="w-5 h-5" />
                  Geographic Coordinates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="p-4 md:p-6 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-xs md:text-sm text-green-300 font-semibold uppercase tracking-wide">Latitude</p>
                    <p className="text-lg md:text-2xl font-mono font-bold text-white mt-2">{result.lat}</p>
                  </div>
                  <div className="p-4 md:p-6 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-xs md:text-sm text-green-300 font-semibold uppercase tracking-wide">Longitude</p>
                    <p className="text-lg md:text-2xl font-mono font-bold text-white mt-2">{result.lon}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Info */}
            <Card className="shadow-2xl border-purple-500/30 bg-slate-800/50 backdrop-blur overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Wifi className="w-5 h-5" />
                  Network Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  {[
                    { label: "ISP", value: result.isp || "N/A" },
                    { label: "Organization", value: result.org || "N/A" },
                    { label: "AS Number", value: result.as || "N/A" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 md:p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <p className="text-xs md:text-sm text-purple-300 font-semibold uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-sm md:text-base font-mono font-bold text-white mt-2 break-all">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="shadow-2xl border-orange-500/30 bg-slate-800/50 backdrop-blur overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Shield className="w-5 h-5" />
                  Security & Connection Type
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  {[
                    {
                      label: "Proxy/VPN",
                      value: result.proxy ? "⚠️ Detected" : "✓ Not Detected",
                      is_warning: result.proxy,
                    },
                    { label: "Mobile Network", value: result.mobile ? "📱 Yes" : "✓ No", is_warning: result.mobile },
                    { label: "Data Center", value: result.hosting ? "🖥️ Yes" : "✓ No", is_warning: result.hosting },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-colors ${
                        item.is_warning ? "bg-red-500/10 border-red-500/40" : "bg-green-500/10 border-green-500/40"
                      }`}
                    >
                      <p className="text-xs md:text-sm text-gray-300 font-semibold uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p
                        className={`text-sm md:text-base font-bold mt-2 ${item.is_warning ? "text-red-400" : "text-green-400"}`}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <Card className="shadow-2xl border-blue-500/20 bg-slate-800/50 backdrop-blur border-dashed">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="p-4 bg-blue-500/10 rounded-full w-fit mx-auto mb-4">
                <Globe className="w-12 h-12 md:w-16 md:h-16 text-blue-400" />
              </div>
              <p className="text-gray-300 text-base md:text-lg font-medium">Enter an IP address to begin</p>
              <p className="text-gray-500 text-xs md:text-sm mt-2">Try: 8.8.8.8, 1.1.1.1, or 208.67.222.222</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IPLookup;

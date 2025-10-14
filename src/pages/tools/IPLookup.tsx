import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AdSpace } from "@/components/AdSpace";
import { Loader2 } from "lucide-react";

const IPLookup = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const lookupIP = async () => {
    if (!ipAddress) {
      toast.error("Please enter an IP address");
      return;
    }

    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ipAddress)) {
      toast.error("Please enter a valid IP address");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Option 1: Direct fetch (simpler approach)
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        toast.error(data.reason || "Invalid IP address");
        return;
      }

      setResult(data);
      toast.success("IP lookup complete!");
    } catch (error) {
      console.error("IP lookup error:", error);

      // Fallback API
      try {
        const fallbackResponse = await fetch(`http://ip-api.com/json/${ipAddress}`);
        const fallbackData = await fallbackResponse.json();

        if (fallbackData.status === "success") {
          setResult(fallbackData);
          toast.success("IP lookup complete!");
        } else {
          toast.error("Failed to lookup IP address");
        }
      } catch (fallbackError) {
        console.error("Fallback IP lookup error:", fallbackError);
        toast.error("Failed to lookup IP address");
      }
    } finally {
      setLoading(false);
    }
  };

  // Alternative using Supabase Edge Function (if you want to keep it)
  const lookupIPWithSupabase = async () => {
    if (!ipAddress) {
      toast.error("Please enter an IP address");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("api-proxy", {
        body: {
          url: `https://ipapi.co/${ipAddress}/json/`,
          method: "GET",
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.reason || "Invalid IP address");
        return;
      }

      setResult(data);
      toast.success("IP lookup complete!");
    } catch (error) {
      console.error("IP lookup error:", error);
      toast.error("Failed to lookup IP address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="IP Address Lookup"
      description="Get location and details of any IP address"
      category="Developer Tools"
    >
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              onKeyDown={(e) => e.key === "Enter" && lookupIP()}
              className="flex-1"
            />
            <Button onClick={lookupIP} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                "Lookup"
              )}
            </Button>
          </div>

          {result && (
            <div className="space-y-3 p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">IP Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium">{result.ip || result.query}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">
                    {result.country_name || result.country} ({result.country_code || result.countryCode})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="font-medium">
                    {result.region || result.regionName} ({result.region_code || result.region})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{result.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ZIP Code</p>
                  <p className="font-medium">{result.postal || result.zip || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p className="font-medium">{result.timezone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coordinates</p>
                  <p className="font-medium">
                    {result.latitude || result.lat}, {result.longitude || result.lon}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ISP</p>
                  <p className="font-medium">{result.org || result.isp}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AS Number</p>
                  <p className="font-medium">{result.asn || result.as || "N/A"}</p>
                </div>
                {result.version && (
                  <div>
                    <p className="text-sm text-muted-foreground">IP Version</p>
                    <p className="font-medium">IPv{result.version}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default IPLookup;

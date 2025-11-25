import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

    setLoading(true);
    setResult(null);

    try {
      // Use ip-api.com for comprehensive IP lookup (free, no API key needed)
      const { data, error } = await supabase.functions.invoke('api-proxy', {
        body: {
          url: `http://ip-api.com/json/${ipAddress}?fields=66846719`,
          method: 'GET',
        }
      });

      if (error) throw error;

      if (data.data.status === 'fail') {
        toast.error(data.data.message || "Invalid IP address");
        return;
      }

      setResult(data.data);
      toast.success("IP lookup complete!");
    } catch (error) {
      console.error('IP lookup error:', error);
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
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              onKeyDown={(e) => e.key === 'Enter' && lookupIP()}
            />
            <Button onClick={lookupIP} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                'Lookup'
              )}
            </Button>
          </div>
          {result && (
            <div className="space-y-3 p-6 bg-muted/50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">IP Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium">{result.query}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{result.country} ({result.countryCode})</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Region</p>
                  <p className="font-medium">{result.regionName} ({result.region})</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{result.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ZIP Code</p>
                  <p className="font-medium">{result.zip || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p className="font-medium">{result.timezone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coordinates</p>
                  <p className="font-medium">{result.lat}, {result.lon}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ISP</p>
                  <p className="font-medium">{result.isp}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <p className="font-medium">{result.org}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AS Number</p>
                  <p className="font-medium">{result.as}</p>
                </div>
                {result.mobile !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile Connection</p>
                    <p className="font-medium">{result.mobile ? 'Yes' : 'No'}</p>
                  </div>
                )}
                {result.proxy !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Proxy/VPN Detected</p>
                    <p className="font-medium">{result.proxy ? 'Yes' : 'No'}</p>
                  </div>
                )}
                {result.hosting !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Hosting/Data Center</p>
                    <p className="font-medium">{result.hosting ? 'Yes' : 'No'}</p>
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

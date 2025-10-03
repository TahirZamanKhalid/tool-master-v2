import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const IPLookup = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [result, setResult] = useState<any>(null);

  const lookupIP = async () => {
    if (!ipAddress) {
      toast.error("Please enter an IP address");
      return;
    }

    // Demo data - in production, use a real IP lookup API
    setResult({
      ip: ipAddress,
      country: "United States",
      city: "New York",
      isp: "Example ISP"
    });
    toast.success("IP lookup complete!");
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
            />
            <Button onClick={lookupIP}>Lookup</Button>
          </div>
          {result && (
            <div className="space-y-2 p-4 bg-muted rounded">
              <p><strong>IP:</strong> {result.ip}</p>
              <p><strong>Country:</strong> {result.country}</p>
              <p><strong>City:</strong> {result.city}</p>
              <p><strong>ISP:</strong> {result.isp}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default IPLookup;

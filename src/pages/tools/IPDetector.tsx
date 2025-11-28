import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdSpace } from "@/components/AdSpace";
import { toast } from "sonner";

const IPDetector = () => {
  const [ipInfo, setIpInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const detectIP = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      setIpInfo(data);
      toast.success("IP detected successfully!");
    } catch (error) {
      toast.error("Failed to detect IP");
    }
    setLoading(false);
  };

  useEffect(() => {
    detectIP();
  }, []);

  return (
    <ToolLayout
      title="IP Address Detector"
      description="Detect your current IP address"
      category="Utilities"
    >
      <AdSpace className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="text-center p-8 bg-muted rounded">
            {loading ? (
              <p className="text-muted-foreground">Detecting...</p>
            ) : ipInfo ? (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your IP Address</p>
                <p className="text-4xl font-bold text-primary">{ipInfo.ip}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Click detect to find your IP</p>
            )}
          </div>
          <Button onClick={detectIP} className="w-full" disabled={loading}>
            {loading ? "Detecting..." : "Detect IP"}
          </Button>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default IPDetector;

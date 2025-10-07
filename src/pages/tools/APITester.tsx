import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Send, Plus, Trash2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Header {
  key: string;
  value: string;
}

interface AuthConfig {
  type: "none" | "basic" | "bearer" | "apikey";
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyHeader?: string;
}

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

const APITester = () => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Header[]>([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState<AuthConfig>({ type: "none" });
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const sendRequest = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      const requestHeaders: Record<string, string> = {};
      headers.forEach(({ key, value }) => {
        if (key && value) {
          requestHeaders[key] = value;
        }
      });

      // Apply authentication
      if (auth.type === "basic" && auth.username && auth.password) {
        const credentials = btoa(`${auth.username}:${auth.password}`);
        requestHeaders["Authorization"] = `Basic ${credentials}`;
      } else if (auth.type === "bearer" && auth.token) {
        requestHeaders["Authorization"] = `Bearer ${auth.token}`;
      } else if (auth.type === "apikey" && auth.apiKey && auth.apiKeyHeader) {
        requestHeaders[auth.apiKeyHeader] = auth.apiKey;
      }

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (["POST", "PUT", "PATCH"].includes(method) && body) {
        options.body = body;
        if (!requestHeaders["Content-Type"]) {
          requestHeaders["Content-Type"] = "application/json";
        }
      }

      const res = await fetch(url, options);
      const endTime = Date.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data,
        time: endTime - startTime,
      });

      toast({
        title: "Success",
        description: `Request completed in ${endTime - startTime}ms`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      });
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Response copied to clipboard",
      });
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(body);
      setBody(JSON.stringify(parsed, null, 2));
      toast({
        title: "Success",
        description: "JSON formatted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500";
    if (status >= 300 && status < 400) return "bg-blue-500";
    if (status >= 400 && status < 500) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <ToolLayout
      title="API Tester"
      description="Test REST APIs with custom headers, methods, and request bodies"
      category="Developer Tools"
      instructions={[
        "Enter the API endpoint URL",
        "Select the HTTP method (GET, POST, PUT, DELETE, etc.)",
        "Add custom headers if needed",
        "Add request body for POST/PUT/PATCH requests",
        "Click Send to execute the request",
        "View the response status, headers, and body",
      ]}
      relatedTools={[
        { name: "JSON Formatter", path: "/tools/json-formatter" },
        { name: "Base64 Encoder", path: "/tools/base64-encoder" },
        { name: "Hash Generator", path: "/tools/hash-generator" },
      ]}
    >
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="w-32">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="HEAD">HEAD</SelectItem>
                    <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="https://api.example.com/endpoint"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={sendRequest} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send"}
              </Button>
            </div>

            <Tabs defaultValue="headers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="auth">Auth</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>

              <TabsContent value="headers" className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <Label>Request Headers</Label>
                  <Button variant="outline" size="sm" onClick={addHeader}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Header
                  </Button>
                </div>
                {headers.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Key"
                      value={header.key}
                      onChange={(e) => updateHeader(index, "key", e.target.value)}
                    />
                    <Input
                      placeholder="Value"
                      value={header.value}
                      onChange={(e) => updateHeader(index, "value", e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeHeader(index)}
                      disabled={headers.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="auth" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Authentication Type</Label>
                    <Select value={auth.type} onValueChange={(value: any) => setAuth({ type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Auth</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="apikey">API Key</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {auth.type === "basic" && (
                    <>
                      <div>
                        <Label>Username</Label>
                        <Input
                          placeholder="Enter username"
                          value={auth.username || ""}
                          onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          value={auth.password || ""}
                          onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {auth.type === "bearer" && (
                    <div>
                      <Label>Bearer Token</Label>
                      <Input
                        placeholder="Enter token"
                        value={auth.token || ""}
                        onChange={(e) => setAuth({ ...auth, token: e.target.value })}
                      />
                    </div>
                  )}

                  {auth.type === "apikey" && (
                    <>
                      <div>
                        <Label>Header Name</Label>
                        <Input
                          placeholder="e.g., X-API-Key"
                          value={auth.apiKeyHeader || ""}
                          onChange={(e) => setAuth({ ...auth, apiKeyHeader: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>API Key</Label>
                        <Input
                          placeholder="Enter API key"
                          value={auth.apiKey || ""}
                          onChange={(e) => setAuth({ ...auth, apiKey: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="body" className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <Label>Request Body</Label>
                  <Button variant="outline" size="sm" onClick={formatJSON}>
                    Format JSON
                  </Button>
                </div>
                <Textarea
                  placeholder='{"key": "value"}'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="font-mono text-sm min-h-[200px]"
                />
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        {response && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">Response</h3>
                  <Badge className={getStatusColor(response.status)}>
                    {response.status} {response.statusText}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{response.time}ms</span>
                </div>
                <Button variant="outline" size="sm" onClick={copyResponse}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <Tabs defaultValue="body" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>

                <TabsContent value="body">
                  <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                    <pre className="text-sm font-mono">
                      {typeof response.data === "object"
                        ? JSON.stringify(response.data, null, 2)
                        : response.data}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="headers">
                  <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                    <div className="space-y-2">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="text-sm font-mono">
                          <span className="text-primary font-semibold">{key}:</span>{" "}
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
};

export default APITester;

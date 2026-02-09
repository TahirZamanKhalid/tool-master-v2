import { useState, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  History,
  Save,
  Code,
  Download,
  FileJson,
  Eye,
  EyeOff,
  Clock,
  Settings,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdRow } from "@/components/AdRow";

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface AuthConfig {
  type: "none" | "basic" | "bearer" | "apikey" | "oauth2";
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  oauth2Token?: string;
}

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size?: number;
}

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  timestamp: number;
  status?: number;
  time?: number;
}

interface Environment {
  [key: string]: string;
}

interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Header[];
  body: string;
  auth: AuthConfig;
}

const APITester = () => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Header[]>([{ key: "", value: "", enabled: true }]);
  const [body, setBody] = useState("");
  const [bodyType, setBodyType] = useState<"json" | "xml" | "text" | "form">("json");
  const [auth, setAuth] = useState<AuthConfig>({ type: "none" });
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [environment, setEnvironment] = useState<Environment>({});
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [responseView, setResponseView] = useState<"pretty" | "raw" | "preview">("pretty");
  const [requestTimeout, setRequestTimeout] = useState(30000);
  const [followRedirects, setFollowRedirects] = useState(true);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("apiTesterHistory");
    const savedRequestsData = localStorage.getItem("apiTesterSaved");
    const savedEnv = localStorage.getItem("apiTesterEnvironment");

    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedRequestsData) setSavedRequests(JSON.parse(savedRequestsData));
    if (savedEnv) setEnvironment(JSON.parse(savedEnv));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("apiTesterHistory", JSON.stringify(history.slice(0, 50)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("apiTesterSaved", JSON.stringify(savedRequests));
  }, [savedRequests]);

  useEffect(() => {
    localStorage.setItem("apiTesterEnvironment", JSON.stringify(environment));
  }, [environment]);

  const replaceEnvironmentVariables = (text: string): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return environment[key] || match;
    });
  };

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "", enabled: true }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: "key" | "value" | "enabled", value: string | boolean) => {
    const newHeaders = [...headers];
    if (field === "enabled") {
      newHeaders[index][field] = value as boolean;
    } else {
      newHeaders[index][field] = value as string;
    }
    setHeaders(newHeaders);
  };

  const duplicateHeader = (index: number) => {
    const newHeaders = [...headers];
    newHeaders.splice(index + 1, 0, { ...headers[index] });
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
      const processedUrl = replaceEnvironmentVariables(url);
      const requestHeaders: Record<string, string> = {};

      headers.forEach(({ key, value, enabled }) => {
        if (key && value && enabled) {
          requestHeaders[replaceEnvironmentVariables(key)] = replaceEnvironmentVariables(value);
        }
      });

      // Apply authentication
      if (auth.type === "basic" && auth.username && auth.password) {
        const credentials = btoa(`${auth.username}:${auth.password}`);
        requestHeaders["Authorization"] = `Basic ${credentials}`;
      } else if (auth.type === "bearer" && auth.token) {
        requestHeaders["Authorization"] = `Bearer ${replaceEnvironmentVariables(auth.token)}`;
      } else if (auth.type === "apikey" && auth.apiKey && auth.apiKeyHeader) {
        requestHeaders[auth.apiKeyHeader] = replaceEnvironmentVariables(auth.apiKey);
      } else if (auth.type === "oauth2" && auth.oauth2Token) {
        requestHeaders["Authorization"] = `Bearer ${replaceEnvironmentVariables(auth.oauth2Token)}`;
      }

      // Set Content-Type based on body type
      if (["POST", "PUT", "PATCH"].includes(method) && body) {
        if (!requestHeaders["Content-Type"]) {
          switch (bodyType) {
            case "json":
              requestHeaders["Content-Type"] = "application/json";
              break;
            case "xml":
              requestHeaders["Content-Type"] = "application/xml";
              break;
            case "form":
              requestHeaders["Content-Type"] = "application/x-www-form-urlencoded";
              break;
            default:
              requestHeaders["Content-Type"] = "text/plain";
          }
        }
      }

      const processedBody = body ? replaceEnvironmentVariables(body) : undefined;

      const response = await fetch("/api-proxy.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: processedUrl,
          method,
          headers: requestHeaders,
          body: ["POST", "PUT", "PATCH"].includes(method) ? processedBody : undefined,
          timeout: requestTimeout,
          followRedirects,
        }),
      });

      if (!response.ok) throw new Error("Proxy error");
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const realData = data.data; // The proxy returns { data: ..., status: ... }

      const responseTime = Date.now() - startTime;
      const responseSize = JSON.stringify(data.data).length;

      const responseData: ResponseData = {
        ...data,
        time: responseTime,
        size: responseSize,
      };

      setResponse(responseData);

      // Add to history
      const historyEntry: RequestHistory = {
        id: Date.now().toString(),
        method,
        url: processedUrl,
        timestamp: Date.now(),
        status: data.status,
        time: responseTime,
      };
      setHistory([historyEntry, ...history]);

      toast({
        title: "Success",
        description: `Request completed in ${responseTime}ms`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send request",
        variant: "destructive",
      });

      // Add failed request to history
      const historyEntry: RequestHistory = {
        id: Date.now().toString(),
        method,
        url,
        timestamp: Date.now(),
      };
      setHistory([historyEntry, ...history]);

      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      const textToCopy = typeof response.data === "object" ? JSON.stringify(response.data, null, 2) : response.data;

      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Response copied to clipboard",
      });
    }
  };

  const downloadResponse = () => {
    if (response) {
      const dataStr = typeof response.data === "object" ? JSON.stringify(response.data, null, 2) : response.data;

      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `response-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Downloaded",
        description: "Response saved to file",
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

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(body);
      setBody(JSON.stringify(parsed));
      toast({
        title: "Success",
        description: "JSON minified successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON",
        variant: "destructive",
      });
    }
  };

  const validateJSON = () => {
    try {
      JSON.parse(body);
      toast({
        title: "Valid JSON",
        description: "Your JSON is properly formatted",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: error instanceof Error ? error.message : "JSON parsing failed",
        variant: "destructive",
      });
    }
  };

  const saveRequest = () => {
    if (!requestName) {
      toast({
        title: "Error",
        description: "Please enter a name for this request",
        variant: "destructive",
      });
      return;
    }

    const newRequest: SavedRequest = {
      id: Date.now().toString(),
      name: requestName,
      method,
      url,
      headers,
      body,
      auth,
    };

    setSavedRequests([...savedRequests, newRequest]);
    setRequestName("");
    toast({
      title: "Saved",
      description: "Request saved successfully",
    });
  };

  const loadRequest = (request: SavedRequest) => {
    setMethod(request.method);
    setUrl(request.url);
    setHeaders(request.headers);
    setBody(request.body);
    setAuth(request.auth);
    setShowSaved(false);
    toast({
      title: "Loaded",
      description: `Loaded request: ${request.name}`,
    });
  };

  const deleteRequest = (id: string) => {
    setSavedRequests(savedRequests.filter((req) => req.id !== id));
    toast({
      title: "Deleted",
      description: "Request removed from saved requests",
    });
  };

  const loadFromHistory = (historyItem: RequestHistory) => {
    setMethod(historyItem.method);
    setUrl(historyItem.url);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    toast({
      title: "Cleared",
      description: "Request history cleared",
    });
  };

  const generateCode = (language: "javascript" | "python" | "curl" | "php") => {
    const processedUrl = replaceEnvironmentVariables(url);
    const requestHeaders: Record<string, string> = {};

    headers.forEach(({ key, value, enabled }) => {
      if (key && value && enabled) {
        requestHeaders[key] = replaceEnvironmentVariables(value);
      }
    });

    let code = "";

    switch (language) {
      case "curl":
        code = `curl -X ${method} "${processedUrl}"`;
        Object.entries(requestHeaders).forEach(([key, value]) => {
          code += ` \\\n  -H "${key}: ${value}"`;
        });
        if (body && ["POST", "PUT", "PATCH"].includes(method)) {
          code += ` \\\n  -d '${body}'`;
        }
        break;

      case "javascript":
        code = `fetch("${processedUrl}", {
  method: "${method}",
  headers: ${JSON.stringify(requestHeaders, null, 2)}${body && ["POST", "PUT", "PATCH"].includes(method)
            ? `,
  body: ${JSON.stringify(body)}`
            : ""
          }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
        break;

      case "python":
        code = `import requests

url = "${processedUrl}"
headers = ${JSON.stringify(requestHeaders, null, 2)}${body && ["POST", "PUT", "PATCH"].includes(method)
            ? `
data = ${JSON.stringify(body)}

response = requests.${method.toLowerCase()}(url, headers=headers, json=data)`
            : `

response = requests.${method.toLowerCase()}(url, headers=headers)`
          }
print(response.json())`;
        break;

      case "php":
        code = `<?php
$url = "${processedUrl}";
$headers = array(
${Object.entries(requestHeaders)
            .map(([key, value]) => `  "${key}: ${value}"`)
            .join(",\n")}
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);${body && ["POST", "PUT", "PATCH"].includes(method)
            ? `
curl_setopt($ch, CURLOPT_POSTFIELDS, '${body}');`
            : ""
          }

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`;
        break;
    }

    navigator.clipboard.writeText(code);
    toast({
      title: "Code Generated",
      description: `${language.toUpperCase()} code copied to clipboard`,
    });
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500";
    if (status >= 300 && status < 400) return "bg-blue-500";
    if (status >= 400 && status < 500) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusIcon = (status?: number) => {
    if (!status) return <AlertCircle className="h-4 w-4" />;
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status >= 400) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-blue-500" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const QuickActions = () => (
    <div className="flex gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={() => setShowSaved(!showSaved)}>
        <Save className="h-4 w-4 mr-1" />
        Saved ({savedRequests.length})
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
        <History className="h-4 w-4 mr-1" />
        History ({history.length})
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShowEnvModal(!showEnvModal)}>
        <Settings className="h-4 w-4 mr-1" />
        Environment
      </Button>
    </div>
  );
  return (
    <>
      <SEOHead
        title="Online API Tool - Free REST API Tester & HTTP Client"
        description="Professional free online REST API tester and HTTP client. Test APIs with authentication, custom headers, request body, and multiple methods."
        keywords="api tester, rest api client, http request tool, online api testing, postman alternative online"
        canonical="https://toolmaster.cloud/tools/api-tester"
      />
      <ToolLayout
        title="Online API Tool - Free REST API Tester & HTTP Client"
        description="Professional free online REST API tester and HTTP client. Test APIs with authentication, custom headers, request body, and multiple methods. Best API testing tool for developers with code generation for JavaScript, Python, cURL, and PHP."
        category="Developer Tools"
        instructions={[
          "Enter the API endpoint URL (use {{variable}} for environment variables)",
          "Select the HTTP method and configure authentication",
          "Add custom headers and request body",
          "Click Send to execute the request",
          "View response with multiple visualization options",
          "Save requests for later use or generate code snippets",
          "Use environment variables for dynamic values",
        ]}
        relatedTools={[
          { name: "JSON Formatter", path: "/tools/json-formatter" },
          { name: "Base64 Encoder", path: "/tools/base64-encoder" },
          { name: "Hash Generator", path: "/tools/hash-generator" },
          { name: "JWT Decoder", path: "/tools/jwt-decoder" },
        ]}
      >
        <AdRow className="mb-6" />
        <div className="space-y-4">
          <QuickActions />

          {/* Saved Requests Panel */}
          {showSaved && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Saved Requests</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowSaved(false)}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="h-48">
                  {savedRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No saved requests yet</p>
                  ) : (
                    <div className="space-y-2">
                      {savedRequests.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-2 border rounded hover:bg-accent cursor-pointer"
                        >
                          <div className="flex-1" onClick={() => loadRequest(req)}>
                            <p className="font-medium text-sm">{req.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {req.method} {req.url}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => deleteRequest(req.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </Card>
          )}

          {/* History Panel */}
          {showHistory && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Request History</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-48">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No request history yet</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 border rounded hover:bg-accent cursor-pointer"
                          onClick={() => loadFromHistory(item)}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {getStatusIcon(item.status)}
                            <div>
                              <p className="text-sm font-medium">
                                {item.method} {item.url}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.timestamp).toLocaleString()}
                                {item.status && ` • ${item.status}`}
                                {item.time && ` • ${item.time}ms`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </Card>
          )}

          {/* Environment Variables Panel */}
          {showEnvModal && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Environment Variables</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowEnvModal(false)}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use variables in your requests with {`{{variableName}}`} syntax
                </p>
                <div className="space-y-2">
                  {Object.entries(environment).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <Input value={key} readOnly className="flex-1" />
                      <Input
                        value={value}
                        onChange={(e) => setEnvironment({ ...environment, [key]: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newEnv = { ...environment };
                          delete newEnv[key];
                          setEnvironment(newEnv);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Variable name"
                      id="newEnvKey"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement;
                          const valueInput = document.getElementById("newEnvValue") as HTMLInputElement;
                          if (input.value && valueInput.value) {
                            setEnvironment({
                              ...environment,
                              [input.value]: valueInput.value,
                            });
                            input.value = "";
                            valueInput.value = "";
                          }
                        }
                      }}
                    />
                    <Input
                      placeholder="Value"
                      id="newEnvValue"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement;
                          const keyInput = document.getElementById("newEnvKey") as HTMLInputElement;
                          if (input.value && keyInput.value) {
                            setEnvironment({
                              ...environment,
                              [keyInput.value]: input.value,
                            });
                            input.value = "";
                            keyInput.value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const keyInput = document.getElementById("newEnvKey") as HTMLInputElement;
                        const valueInput = document.getElementById("newEnvValue") as HTMLInputElement;
                        if (keyInput.value && valueInput.value) {
                          setEnvironment({
                            ...environment,
                            [keyInput.value]: valueInput.value,
                          });
                          keyInput.value = "";
                          valueInput.value = "";
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Main Request Panel */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Request URL Section */}
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
                  placeholder="https://api.example.com/endpoint (use {{var}} for variables)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      sendRequest();
                    }
                  }}
                />
                <Button onClick={sendRequest} disabled={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Sending..." : "Send"}
                </Button>
              </div>

              {/* Save Request Section */}
              <div className="flex gap-2">
                <Input
                  placeholder="Request name (optional)"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={saveRequest} disabled={!requestName}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Request
                </Button>
              </div>

              <Separator />

              {/* Tabs for Headers, Auth, Body, Settings */}
              <Tabs defaultValue="headers" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="auth">Auth</TabsTrigger>
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Headers Tab */}
                <TabsContent value="headers" className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Request Headers</Label>
                    <Button variant="outline" size="sm" onClick={addHeader}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Header
                    </Button>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="space-y-2 pr-4">
                      {headers.map((header, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={header.enabled}
                            onChange={(e) => updateHeader(index, "enabled", e.target.checked)}
                            className="w-4 h-4"
                          />
                          <Input
                            placeholder="Key"
                            value={header.key}
                            onChange={(e) => updateHeader(index, "key", e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Value"
                            value={header.value}
                            onChange={(e) => updateHeader(index, "value", e.target.value)}
                            className="flex-1"
                          />
                          <Button variant="outline" size="icon" onClick={() => duplicateHeader(index)} title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </Button>
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
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Auth Tab */}
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
                          <SelectItem value="oauth2">OAuth 2.0</SelectItem>
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
                          <div className="flex gap-2">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter password"
                              value={auth.password || ""}
                              onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                              className="flex-1"
                            />
                            <Button variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {auth.type === "bearer" && (
                      <div>
                        <Label>Bearer Token</Label>
                        <Textarea
                          placeholder="Enter token (supports {{variables}})"
                          value={auth.token || ""}
                          onChange={(e) => setAuth({ ...auth, token: e.target.value })}
                          className="font-mono text-sm"
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

                    {auth.type === "oauth2" && (
                      <div>
                        <Label>OAuth 2.0 Access Token</Label>
                        <Textarea
                          placeholder="Enter access token"
                          value={auth.oauth2Token || ""}
                          onChange={(e) => setAuth({ ...auth, oauth2Token: e.target.value })}
                          className="font-mono text-sm"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Body Tab */}
                <TabsContent value="body" className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Label>Request Body</Label>
                      <Select value={bodyType} onValueChange={(value: any) => setBodyType(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="xml">XML</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="form">Form Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={validateJSON}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Validate
                      </Button>
                      <Button variant="outline" size="sm" onClick={formatJSON}>
                        <Sparkles className="h-4 w-4 mr-1" />
                        Format
                      </Button>
                      <Button variant="outline" size="sm" onClick={minifyJSON}>
                        Minify
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    placeholder={
                      bodyType === "json"
                        ? '{"key": "value"}'
                        : bodyType === "xml"
                          ? "<root><key>value</key></root>"
                          : "Enter request body"
                    }
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="font-mono text-sm min-h-[300px]"
                  />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-4">
                  <div>
                    <Label>Request Timeout (ms)</Label>
                    <Input
                      type="number"
                      value={requestTimeout}
                      onChange={(e) => setRequestTimeout(Number(e.target.value))}
                      min="1000"
                      max="60000"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Maximum time to wait for response (1-60 seconds)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={followRedirects}
                      onChange={(e) => setFollowRedirects(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label>Follow Redirects</Label>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          {/* Response Panel */}
          {response && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-lg">Response</h3>
                    <Badge className={getStatusColor(response.status)}>
                      {response.status} {response.statusText}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {response.time}ms
                    </div>
                    {response.size && <div className="text-sm text-muted-foreground">{formatBytes(response.size)}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadResponse}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
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
                </div>

                <Tabs value={responseView} onValueChange={(v: any) => setResponseView(v)} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pretty">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Pretty
                    </TabsTrigger>
                    <TabsTrigger value="raw">
                      <FileText className="h-4 w-4 mr-1" />
                      Raw
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pretty">
                    <ScrollArea className="h-96 w-full">
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                          {typeof response.data === "object" ? JSON.stringify(response.data, null, 2) : response.data}
                        </pre>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="raw">
                    <ScrollArea className="h-96 w-full">
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                          {typeof response.data === "object" ? JSON.stringify(response.data) : response.data}
                        </pre>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="preview">
                    <ScrollArea className="h-96 w-full">
                      <div className="bg-muted p-4 rounded-lg">
                        {typeof response.data === "object" ? (
                          <div className="space-y-2">
                            {Object.entries(response.data).map(([key, value]) => (
                              <div key={key} className="border-b pb-2">
                                <span className="font-semibold text-sm">{key}: </span>
                                <span className="text-sm">
                                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm">{response.data}</p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="headers">
                    <ScrollArea className="h-96 w-full">
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="space-y-2">
                          {Object.entries(response.headers).map(([key, value]) => (
                            <div key={key} className="text-sm font-mono border-b pb-2">
                              <span className="text-primary font-semibold">{key}:</span> <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>

                {/* Code Generation */}
                <div className="pt-4">
                  <Label className="mb-2 block">Generate Code</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => generateCode("curl")}>
                      <Code className="h-4 w-4 mr-1" />
                      cURL
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateCode("javascript")}>
                      <Code className="h-4 w-4 mr-1" />
                      JavaScript
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateCode("python")}>
                      <Code className="h-4 w-4 mr-1" />
                      Python
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateCode("php")}>
                      <Code className="h-4 w-4 mr-1" />
                      PHP
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
        <AdRow className="mt-6" />
      </ToolLayout>
    </>
  );
};

export default APITester;

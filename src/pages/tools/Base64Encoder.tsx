import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, ArrowDown, ArrowUp, Code, Shield, Zap, Globe, HelpCircle, FileText, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdWatchModal } from "@/components/AdWatchModal";
import { Helmet } from "react-helmet-async";

const Base64Encoder = () => {
  const [textInput, setTextInput] = useState("");
  const [encodedOutput, setEncodedOutput] = useState("");
  const [decodedOutput, setDecodedOutput] = useState("");
  const [encodeError, setEncodeError] = useState("");
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingCopy, setPendingCopy] = useState("");
  const { toast } = useToast();

  const encodeToBase64 = () => {
    try {
      const encoded = btoa(textInput);
      setEncodedOutput(encoded);
      setEncodeError("");
      toast({
        title: "Encoded Successfully",
        description: "Text converted to Base64",
      });
    } catch (e) {
      setEncodeError("Error encoding text. Please check your input.");
    }
  };

  const decodeFromBase64 = () => {
    try {
      const decoded = atob(textInput);
      setDecodedOutput(decoded);
      setEncodeError("");
      toast({
        title: "Decoded Successfully",
        description: "Base64 converted to text",
      });
    } catch (e) {
      setEncodeError("Invalid Base64 string. Please check your input.");
      setDecodedOutput("");
    }
  };

  const handleCopyClick = (text: string) => {
    setPendingCopy(text);
    setShowAdModal(true);
  };

  const handleAdWatched = () => {
    setShowAdModal(false);
    if (pendingCopy) {
      copyToClipboard(pendingCopy);
      setPendingCopy("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Text copied successfully",
    });
  };

  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Base64 Encoder/Decoder - Free Online Tool",
    description:
      "Encode text to Base64 or decode Base64 strings instantly online. Free, fast, and secure Base64 encoding and decoding tool for developers.",
    url: "https://toolmaster.cloud/tools/base64-encoder",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Encode text to Base64",
      "Decode Base64 to text",
      "Instant conversion",
      "Copy to clipboard",
      "No signup required",
      "Client-side processing",
    ],
    creator: {
      "@type": "Organization",
      name: "ToolMaster",
      url: "https://toolmaster.cloud",
    },
  };


  return (
    <>
      <Helmet>
        <title>Base64 Encoder/Decoder - Encode & Decode Text Online Free | ToolMaster</title>
        <meta
          name="description"
          content="Free online Base64 encoder and decoder. Instantly encode text to Base64 or decode Base64 strings back to readable text. Fast, private, and works in your browser."
        />
        <meta
          name="keywords"
          content="base64 encoder, base64 decoder, base64 encode online, base64 decode online, text to base64, base64 to text, base64 converter, free base64 tool, online base64 encoder decoder"
        />
        <link rel="canonical" href="https://toolmaster.cloud/tools/base64-encoder" />

        {/* Open Graph */}
        <meta property="og:title" content="Base64 Encoder/Decoder - Encode & Decode Text Online Free | ToolMaster" />
        <meta
          property="og:description"
          content="Free online Base64 encoder and decoder. Instantly encode text to Base64 or decode Base64 strings. Fast, private, browser-based."
        />
        <meta property="og:url" content="https://toolmaster.cloud/tools/base64-encoder" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ToolMaster" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Base64 Encoder/Decoder - Free Online Tool" />
        <meta
          name="twitter:description"
          content="Encode text to Base64 or decode Base64 strings instantly. Free, fast, and browser-based."
        />

        <meta name="robots" content="index, follow" />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <ToolLayout
        title="Base64 Encoder/Decoder"
        description="Encode text to Base64 or decode Base64 strings instantly — essential for developers, APIs, and data embedding."
        category="Developer Tools"
        customFAQs={[
          {
            question: "What is Base64 encoding?",
            answer: "Base64 is a binary-to-text encoding scheme that converts binary data into an ASCII string format using 64 printable characters (A-Z, a-z, 0-9, +, /). It's commonly used to embed binary data in text-based formats like HTML, CSS, JSON, and email.",
          },
          {
            question: "Why do developers use Base64 encoding?",
            answer: "Developers use Base64 to safely transmit binary data through text-based channels like URLs, emails, APIs, and HTML. It's essential for embedding images in CSS, sending email attachments, encoding API authentication tokens, and storing binary data in JSON or XML.",
          },
          {
            question: "Is Base64 encoding the same as encryption?",
            answer: "No, Base64 encoding is NOT encryption. It is simply a way to represent binary data as text. Anyone can decode a Base64 string — it provides no security or confidentiality. For security, use proper encryption methods like AES or RSA.",
          },
          {
            question: "Does Base64 encoding increase file size?",
            answer: "Yes, Base64 encoding increases the data size by approximately 33%. For example, a 3-byte binary input becomes 4 ASCII characters. This is a necessary trade-off for the ability to safely represent binary data as text.",
          },
          {
            question: "Is this Base64 tool safe to use?",
            answer: "Yes, this tool processes everything entirely in your browser using JavaScript's built-in btoa() and atob() functions. No data is sent to any server, making it completely private and secure.",
          },
          {
            question: "What characters does Base64 use?",
            answer: "Standard Base64 uses 64 characters: uppercase letters (A-Z), lowercase letters (a-z), digits (0-9), plus (+), and forward slash (/). The equals sign (=) is used as padding. Base64URL is a variant that replaces + with - and / with _ for URL safety.",
          },
          {
            question: "Can I encode special characters and Unicode?",
            answer: "The browser's built-in btoa() function works with Latin-1 characters. For Unicode text (like emojis or non-Latin scripts), you may need to first encode the text to UTF-8 bytes before Base64 encoding. Our tool handles standard ASCII and Latin-1 text.",
          },
          {
            question: "What is the difference between Base64 and Base64URL?",
            answer: "Base64URL is a URL-safe variant of Base64 that replaces the + character with - and / with _, and omits the = padding. It's used in JWTs (JSON Web Tokens) and URLs where standard Base64 characters could cause issues.",
          },
        ]}
        relatedTools={[
          { name: "JSON Formatter", path: "/tools/json-formatter" },
          { name: "Hash Generator", path: "/tools/hash-generator" },
          { name: "URL Encoder/Decoder", path: "/tools/url-encoder" },
          { name: "JWT Decoder", path: "/tools/jwt-decoder" },
        ]}
      >
        {/* Main Tool */}
        <Tabs defaultValue="encode" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
            <TabsTrigger value="encode">
              <ArrowDown className="h-4 w-4 mr-2" />
              Encode
            </TabsTrigger>
            <TabsTrigger value="decode">
              <ArrowUp className="h-4 w-4 mr-2" />
              Decode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Text to Encode</h3>
              <Textarea
                placeholder="Enter text to encode to Base64..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[200px] font-mono"
                aria-label="Text input for Base64 encoding"
              />
              <Button onClick={encodeToBase64} className="w-full mt-4" aria-label="Encode text to Base64">
                <ArrowDown className="mr-2 h-4 w-4" />
                Encode to Base64
              </Button>
            </Card>

            {encodedOutput && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Base64 Output</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyClick(encodedOutput)}
                    aria-label="Copy Base64 encoded output"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Watch Ad to Copy
                  </Button>
                </div>
                <pre
                  aria-label="Base64 encoded output"
                  className="min-h-[200px] font-mono whitespace-pre-wrap break-words select-none cursor-not-allowed bg-muted/50 p-3 rounded"
                  onCopy={(e) => {
                    e.preventDefault();
                    toast({ title: "Copy disabled", description: 'Use "Watch Ad to Copy"' });
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toast({ title: "Copy disabled", description: "Use the copy button" });
                  }}
                >
                  {encodedOutput}
                </pre>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="decode" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Base64 to Decode</h3>
              <Textarea
                placeholder="Enter Base64 string to decode..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[200px] font-mono"
                aria-label="Base64 input for decoding"
              />
              <Button onClick={decodeFromBase64} className="w-full mt-4" aria-label="Decode Base64 to text">
                <ArrowUp className="mr-2 h-4 w-4" />
                Decode from Base64
              </Button>
            </Card>

            {encodeError && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg" role="alert">
                <p className="font-semibold">Error:</p>
                <p className="text-sm mt-1">{encodeError}</p>
              </div>
            )}

            {decodedOutput && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Decoded Text</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyClick(decodedOutput)}
                    aria-label="Copy decoded text output"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Watch Ad to Copy
                  </Button>
                </div>
                <pre
                  aria-label="Decoded text output"
                  className="min-h-[200px] font-mono whitespace-pre-wrap break-words select-none cursor-not-allowed bg-muted/50 p-3 rounded"
                  onCopy={(e) => {
                    e.preventDefault();
                    toast({ title: "Copy disabled", description: 'Use "Watch Ad to Copy"' });
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toast({ title: "Copy disabled", description: "Use the copy button" });
                  }}
                >
                  {decodedOutput}
                </pre>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <AdWatchModal
          open={showAdModal}
          onOpenChange={(open) => {
            setShowAdModal(open);
            if (!open) setPendingCopy("");
          }}
          onAdWatched={handleAdWatched}
          title="Watch Ad to Continue"
          description="Watch this short ad to copy the text"
        />

        {/* SEO Content: What Is Base64 */}
        <section className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">What Is Base64 Encoding?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Base64 is a binary-to-text encoding scheme that converts binary data into a string of printable ASCII characters. It uses a set of 64 characters — <code className="bg-muted px-1.5 py-0.5 rounded text-xs">A-Z</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs">a-z</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs">0-9</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs">+</code>, and <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/</code> — to represent data that might otherwise contain characters that are not safe for transmission in text-based protocols.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The encoding process takes every 3 bytes (24 bits) of binary data and converts them into 4 Base64 characters (6 bits each). If the input data length isn't a multiple of 3, padding characters (<code className="bg-muted px-1.5 py-0.5 rounded text-xs">=</code>) are added to the end.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Base64 is defined in <strong>RFC 4648</strong> and is one of the most widely used encoding schemes on the internet. Our free Base64 encoder/decoder tool processes everything in your browser — <strong>no data is ever sent to a server</strong>.
          </p>
        </section>

        {/* How It Works */}
        <section className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">How Base64 Encoding Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="p-5 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Input Text</h3>
              <p className="text-sm text-muted-foreground">
                Enter the plain text you want to encode, or paste a Base64 string you want to decode back to readable text.
              </p>
            </Card>
            <Card className="p-5 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. Convert</h3>
              <p className="text-sm text-muted-foreground">
                The tool uses JavaScript's native <code className="text-xs bg-muted px-1 rounded">btoa()</code> and <code className="text-xs bg-muted px-1 rounded">atob()</code> functions to encode or decode your input instantly in the browser.
              </p>
            </Card>
            <Card className="p-5 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Copy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Copy Result</h3>
              <p className="text-sm text-muted-foreground">
                Copy the encoded or decoded output to your clipboard with one click and use it in your code, APIs, or wherever needed.
              </p>
            </Card>
          </div>
        </section>

        {/* Common Use Cases */}
        <section className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Common Use Cases for Base64</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong>🖼️ Embedding Images in HTML/CSS:</strong> Convert small images to Base64 data URIs to embed them directly in HTML or CSS files, reducing HTTP requests and improving page load performance for small assets.
            </p>
            <p>
              <strong>📧 Email Attachments (MIME):</strong> Email protocols like SMTP use Base64 to encode binary file attachments so they can be transmitted as text within the email message body.
            </p>
            <p>
              <strong>🔑 API Authentication:</strong> HTTP Basic Authentication encodes the <code className="bg-muted px-1 rounded text-xs">username:password</code> string in Base64 before sending it in the Authorization header.
            </p>
            <p>
              <strong>🌐 Data URLs:</strong> Base64 is used in data URIs (<code className="bg-muted px-1 rounded text-xs">data:image/png;base64,...</code>) to embed small files directly in web pages without separate HTTP requests.
            </p>
            <p>
              <strong>📦 JSON/XML Data Transfer:</strong> Binary data that needs to be included in JSON or XML payloads is often Base64-encoded since these formats only support text content.
            </p>
            <p>
              <strong>🔐 JWT Tokens:</strong> JSON Web Tokens (JWTs) use Base64URL encoding (a URL-safe variant of Base64) to encode the header and payload sections of the token.
            </p>
            <p>
              <strong>💾 Database Storage:</strong> Some developers Base64-encode binary data like small images or files before storing them in text-based database fields.
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Zap className="h-5 w-5 text-yellow-500" />,
                title: "Instant Conversion",
                desc: "Encode or decode in milliseconds. No processing delays, no loading screens — results appear instantly.",
              },
              {
                icon: <Shield className="h-5 w-5 text-green-500" />,
                title: "100% Client-Side",
                desc: "All encoding and decoding happens in your browser using native JavaScript. No data is ever sent to any server.",
              },
              {
                icon: <ArrowDown className="h-5 w-5 text-blue-500" />,
                title: "Encode & Decode",
                desc: "Two-way conversion: encode plain text to Base64 or decode Base64 strings back to readable text.",
              },
              {
                icon: <Copy className="h-5 w-5 text-purple-500" />,
                title: "One-Click Copy",
                desc: "Copy the encoded or decoded output to your clipboard with a single click for easy pasting.",
              },
              {
                icon: <Globe className="h-5 w-5 text-orange-500" />,
                title: "Works Everywhere",
                desc: "Use on any device — desktop, tablet, or mobile. Works in all modern browsers with no installation needed.",
              },
              {
                icon: <Lock className="h-5 w-5 text-red-500" />,
                title: "No Signup Required",
                desc: "Start encoding and decoding immediately. No account creation, no email required, completely free to use.",
              },
            ].map((feature, index) => (
              <Card key={index} className="p-4 flex gap-3">
                <div className="mt-0.5">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Base64 Encoding Table */}
        <section className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Base64 Encoding Examples</h2>
          <Card className="p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-semibold">Plain Text</th>
                  <th className="text-left py-2 font-semibold">Base64 Encoded</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  { plain: "Hello", encoded: "SGVsbG8=" },
                  { plain: "Hello World", encoded: "SGVsbG8gV29ybGQ=" },
                  { plain: "ToolMaster", encoded: "VG9vbE1hc3Rlcg==" },
                  { plain: "Base64 is useful!", encoded: "QmFzZTY0IGlzIHVzZWZ1bCE=" },
                  { plain: "user:password", encoded: "dXNlcjpwYXNzd29yZA==" },
                  { plain: '{"key":"value"}', encoded: "eyJrZXkiOiJ2YWx1ZSJ9" },
                ].map((example, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{example.plain}</td>
                    <td className="py-2 font-mono text-xs">{example.encoded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        
        {/* Final SEO Block */}
        <section className="mt-10 max-w-4xl mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-4">Why Use Our Free Base64 Encoder/Decoder?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Whether you're a web developer embedding images in HTML, a backend engineer working with API authentication tokens, or a student learning about data encoding, our free Base64 encoder/decoder makes the process effortless. Simply paste your text, click a button, and get instant results.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Unlike many online Base64 tools that send your data to remote servers for processing, our tool runs entirely in your browser. This means your sensitive data — API keys, passwords, authentication tokens — never leaves your device. It's the safest way to encode and decode Base64 strings online.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The tool supports both encoding (converting plain text to Base64) and decoding (converting Base64 back to readable text). It handles all standard ASCII and Latin-1 characters, making it suitable for most common developer use cases including HTTP headers, data URIs, email encoding, and more.
          </p>
        </section>
      </ToolLayout>
    </>
  );
};

export default Base64Encoder;

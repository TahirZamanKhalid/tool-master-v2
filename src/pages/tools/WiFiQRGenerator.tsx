import { useState, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Wifi, QrCode, Shield, Smartphone, Zap, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import QRCodeLib from "qrcode";
import { AdSpace } from "@/components/AdSpace";
import { Helmet } from "react-helmet-async";

const WiFiQRGenerator = () => {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateWiFiString = () => {
    const hiddenFlag = hidden ? "true" : "false";
    return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hiddenFlag};;`;
  };

  const generateQR = async () => {
    if (!ssid) {
      toast.error("Please enter WiFi network name (SSID)");
      return;
    }

    if (encryption !== "nopass" && !password) {
      toast.error("Please enter WiFi password");
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const wifiString = generateWiFiString();

      await QRCodeLib.toCanvas(canvas, wifiString, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      setQrCode(dataUrl);

      toast.success("WiFi QR code generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate WiFi QR code");
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.download = `wifi-${ssid}-qr.png`;
    link.href = qrCode;
    link.click();
    toast.success("QR code downloaded!");
  };

  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "WiFi QR Code Generator - Free Online Tool",
    "description": "Generate WiFi QR codes instantly. Share your WiFi credentials with guests by letting them scan a QR code to connect automatically. Supports WPA, WPA2, WEP, and open networks.",
    "url": "https://toolmaster.cloud/tools/wifi-qr-generator",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Generate WiFi QR codes",
      "Support for WPA/WPA2/WEP encryption",
      "Hidden network support",
      "Download QR code as PNG",
      "Instant QR code generation",
      "No signup required"
    ],
    "creator": {
      "@type": "Organization",
      "name": "ToolMaster",
      "url": "https://toolmaster.cloud"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a WiFi QR code?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A WiFi QR code is a special QR code that contains your WiFi network name (SSID), password, and encryption type. When someone scans it with their phone camera, they can automatically connect to your WiFi network without manually typing the password."
        }
      },
      {
        "@type": "Question",
        "name": "How do I scan a WiFi QR code?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "On most modern smartphones, simply open the camera app and point it at the WiFi QR code. A notification will appear asking if you want to join the network. On older devices, you may need a QR code scanner app. Both Android and iOS support WiFi QR code scanning natively."
        }
      },
      {
        "@type": "Question",
        "name": "Is it safe to share WiFi via QR code?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, sharing WiFi via QR code is safe. The QR code contains the same information you would share verbally — your network name and password. The QR code is generated entirely in your browser and no data is sent to any server. However, only share your WiFi QR code with people you trust."
        }
      },
      {
        "@type": "Question",
        "name": "What encryption types are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "This WiFi QR code generator supports WPA/WPA2 (most common and recommended), WEP (older, less secure), and open networks with no password. WPA2 or WPA3 is recommended for the best security."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use this for a hidden WiFi network?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Simply check the 'Hidden Network' option when generating your QR code. The generated QR code will include the hidden network flag, allowing devices to connect even if the network doesn't broadcast its SSID."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>WiFi QR Code Generator - Share WiFi Instantly | ToolMaster</title>
        <meta
          name="description"
          content="Generate free WiFi QR codes to share your network credentials instantly. Guests scan the QR code to connect automatically. Supports WPA, WPA2, WEP & open networks."
        />
        <meta
          name="keywords"
          content="wifi qr code generator, wifi qr code, share wifi password, wifi qr, qr code wifi, wifi password qr code, free wifi qr generator, connect wifi qr code, wifi network qr code"
        />
        <link rel="canonical" href="https://toolmaster.cloud/tools/wifi-qr-generator" />

        {/* Open Graph */}
        <meta property="og:title" content="WiFi QR Code Generator - Share WiFi Instantly | ToolMaster" />
        <meta
          property="og:description"
          content="Generate free WiFi QR codes to share your network credentials instantly. Guests scan the QR code to connect automatically."
        />
        <meta property="og:url" content="https://toolmaster.cloud/tools/wifi-qr-generator" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ToolMaster" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WiFi QR Code Generator - Share WiFi Instantly" />
        <meta
          name="twitter:description"
          content="Generate free WiFi QR codes to share your network credentials instantly. Supports WPA, WPA2, WEP & open networks."
        />

        <meta name="robots" content="index, follow" />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>
      </Helmet>

      <ToolLayout
        title="WiFi QR Code Generator"
        description="Generate QR codes to share WiFi credentials instantly — no more spelling out passwords!"
        category="QR & Barcodes"
        instructions={[
          "Enter your WiFi network name (SSID)",
          "Enter the WiFi password",
          "Select encryption type (WPA/WPA2, WEP, or None)",
          "Mark if your network is hidden (optional)",
          "Click 'Generate WiFi QR Code'",
          "Download or share the QR code — others scan to connect automatically",
        ]}
        relatedTools={[
          { name: "QR Code Generator", path: "/tools/qr-code-generator" },
          { name: "QR Scanner", path: "/tools/qr-scanner" },
          { name: "Barcode Generator", path: "/tools/barcode-generator" },
        ]}
      >
        <AdSpace size="leaderboard" className="mb-6" />

        {/* Main Tool Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="ssid">Network Name (SSID)</Label>
                <div className="relative mt-2">
                  <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ssid"
                    placeholder="Enter WiFi network name..."
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    className="pl-10"
                    aria-label="WiFi network name SSID"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="encryption">Encryption Type</Label>
                <Select value={encryption} onValueChange={setEncryption}>
                  <SelectTrigger id="encryption" className="mt-2" aria-label="Select encryption type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                    <SelectItem value="WEP">WEP</SelectItem>
                    <SelectItem value="nopass">No Password</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {encryption !== "nopass" && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter WiFi password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2"
                    aria-label="WiFi password"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hidden"
                  checked={hidden}
                  onChange={(e) => setHidden(e.target.checked)}
                  className="w-4 h-4"
                  aria-label="Hidden network toggle"
                />
                <Label htmlFor="hidden" className="cursor-pointer">
                  Hidden Network
                </Label>
              </div>
            </div>

            <Button onClick={generateQR} size="lg" className="w-full" aria-label="Generate WiFi QR Code">
              <QrCode className="h-4 w-4 mr-2" />
              Generate WiFi QR Code
            </Button>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center">
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

            {qrCode ? (
              <div className="space-y-4 w-full">
                <div className="flex justify-center">
                  <img
                    src={qrCode}
                    alt={`WiFi QR Code for network ${ssid} - scan to connect automatically`}
                    className="border rounded-lg shadow-card"
                    width={300}
                    height={300}
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  <p className="font-semibold">Network: {ssid}</p>
                  <p className="text-xs mt-1">Scan with your phone camera to connect automatically</p>
                </div>
                <Button onClick={downloadQR} size="lg" className="w-full" variant="secondary" aria-label="Download WiFi QR Code as PNG">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Wifi className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Your WiFi QR code will appear here</p>
                <p className="text-xs mt-2">Enter your network details and click generate</p>
              </div>
            )}
          </Card>
        </div>

        <AdSpace size="leaderboard" className="mt-6" />

        {/* SEO Content Section - What Is a WiFi QR Code */}
        <section className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">What Is a WiFi QR Code?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            A WiFi QR code is a specially formatted QR code that stores your wireless network credentials — including the network name (SSID), password, and encryption type. When scanned with a smartphone camera, the device automatically connects to the WiFi network without the user needing to manually type any information.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            This is incredibly useful for homes, offices, cafés, hotels, Airbnbs, co-working spaces, and events where you frequently need to share WiFi access with guests. Instead of dictating a complex password, you simply display or share the QR code.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our free WiFi QR code generator works entirely in your browser. <strong>No data is sent to any server</strong> — your WiFi credentials stay private and secure on your device.
          </p>
        </section>

        {/* How It Works */}
        <section className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="p-5 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wifi className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Enter WiFi Details</h3>
              <p className="text-sm text-muted-foreground">
                Type your network name (SSID), password, and select the encryption type (WPA/WPA2 is most common).
              </p>
            </Card>
            <Card className="p-5 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. Generate QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Click the generate button and your WiFi QR code is created instantly in your browser — no uploads, no servers.
              </p>
            </Card>
            <Card className="p-5 text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Scan & Connect</h3>
              <p className="text-sm text-muted-foreground">
                Share or print the QR code. Guests simply scan it with their phone camera to connect to your WiFi automatically.
              </p>
            </Card>
          </div>
        </section>

        {/* Key Features */}
        <section className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Shield className="h-5 w-5 text-green-500" />,
                title: "100% Private & Secure",
                desc: "All processing happens in your browser. Your WiFi password is never sent to any server.",
              },
              {
                icon: <Zap className="h-5 w-5 text-yellow-500" />,
                title: "Instant Generation",
                desc: "Generate your WiFi QR code in milliseconds. No waiting, no loading screens.",
              },
              {
                icon: <Wifi className="h-5 w-5 text-blue-500" />,
                title: "All Encryption Types",
                desc: "Supports WPA/WPA2 (recommended), WEP (legacy), and open networks with no password.",
              },
              {
                icon: <Download className="h-5 w-5 text-purple-500" />,
                title: "Download as PNG",
                desc: "Download your QR code as a high-quality PNG image. Print it, frame it, or share it digitally.",
              },
              {
                icon: <Smartphone className="h-5 w-5 text-orange-500" />,
                title: "Works on All Devices",
                desc: "Compatible with iPhone, Android, tablets, and any device with a camera and QR code reader.",
              },
              {
                icon: <QrCode className="h-5 w-5 text-red-500" />,
                title: "Hidden Network Support",
                desc: "Generate QR codes for hidden networks that don't broadcast their SSID.",
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

        {/* Use Cases */}
        <section className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Where to Use WiFi QR Codes</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong>🏠 Home:</strong> Print and frame a WiFi QR code near your router or front door. Guests can scan and connect without asking for the password.
            </p>
            <p>
              <strong>☕ Cafés & Restaurants:</strong> Display a WiFi QR code on table tents, menus, or at the counter. No more writing passwords on napkins.
            </p>
            <p>
              <strong>🏨 Hotels & Airbnbs:</strong> Include WiFi QR codes in welcome packets, printed on cards in each room, or displayed at the reception.
            </p>
            <p>
              <strong>🏢 Offices & Co-working Spaces:</strong> Share guest WiFi access securely without revealing the password verbally or in emails.
            </p>
            <p>
              <strong>🎉 Events & Conferences:</strong> Display large WiFi QR codes on screens or banners so attendees can connect instantly.
            </p>
            <p>
              <strong>🏫 Schools & Libraries:</strong> Provide easy WiFi access for students and visitors with posted QR codes.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What is a WiFi QR code?",
                a: "A WiFi QR code is a special QR code that contains your WiFi network name (SSID), password, and encryption type. When someone scans it with their phone camera, they can automatically connect to your WiFi network without manually typing the password.",
              },
              {
                q: "How do I scan a WiFi QR code?",
                a: "On most modern smartphones, simply open the camera app and point it at the WiFi QR code. A notification will appear asking if you want to join the network. On older devices, you may need a QR code scanner app. Both Android (version 10+) and iOS (version 11+) support WiFi QR code scanning natively.",
              },
              {
                q: "Is it safe to share WiFi via QR code?",
                a: "Yes, sharing WiFi via QR code is safe. The QR code contains the same information you would share verbally — your network name and password. This tool generates the QR code entirely in your browser, and no data is sent to any server. However, only share your WiFi QR code with people you trust.",
              },
              {
                q: "What encryption types are supported?",
                a: "This WiFi QR code generator supports WPA/WPA2 (most common and recommended), WEP (older, less secure), and open networks with no password. WPA2 or WPA3 encryption is recommended for the best security.",
              },
              {
                q: "Can I use this for a hidden WiFi network?",
                a: "Yes! Simply check the 'Hidden Network' option when generating your QR code. The generated QR code will include the hidden network flag, allowing devices to connect even if the network doesn't broadcast its SSID.",
              },
              {
                q: "Does the QR code expire?",
                a: "No, the QR code itself doesn't expire. However, if you change your WiFi password or network name, you'll need to generate a new QR code with the updated credentials.",
              },
              {
                q: "Can I print the WiFi QR code?",
                a: "Absolutely! Download the QR code as a PNG image and print it. Many people frame it or create small cards to place near their router, on the fridge, or at a reception desk.",
              },
              {
                q: "Which devices can scan WiFi QR codes?",
                a: "Most modern smartphones can scan WiFi QR codes natively using the built-in camera app. This includes iPhone (iOS 11+), Android phones (Android 10+), and most tablets. Older devices may need a third-party QR code scanner app.",
              },
            ].map((faq, index) => (
              <Card key={index} className="p-4">
                <h3 className="font-semibold text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Final SEO Content Block */}
        <section className="mt-10 max-w-4xl mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-4">Why Use a WiFi QR Code Generator?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Sharing WiFi passwords has always been awkward. You either have to spell out a complex password letter by letter, write it on a sticky note, or send it in a text message. A WiFi QR code solves this problem elegantly — one quick scan and the device connects automatically.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            WiFi QR codes follow the standard <code className="bg-muted px-1.5 py-0.5 rounded text-xs">WIFI:T:WPA;S:networkname;P:password;;</code> format, which is universally recognized by smartphone operating systems. This means the QR codes generated by this tool work with virtually every modern phone and tablet.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Whether you're a homeowner wanting to make things easier for guests, a business owner improving customer experience, or an event organizer providing seamless connectivity, our free WiFi QR code generator is the simplest solution. No account needed, no data stored — just instant, private QR code generation right in your browser.
          </p>
        </section>

        <AdSpace size="leaderboard" className="mt-6" />
      </ToolLayout>
    </>
  );
};

export default WiFiQRGenerator;
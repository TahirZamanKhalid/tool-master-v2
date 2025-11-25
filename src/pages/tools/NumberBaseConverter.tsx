import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const NumberBaseConverter = () => {
  const [decimal, setDecimal] = useState("");
  const [binary, setBinary] = useState("");
  const [hexadecimal, setHexadecimal] = useState("");
  const [octal, setOctal] = useState("");

  const isValidDecimal = (value: string): boolean => {
    return /^\d+$/.test(value);
  };

  const isValidBinary = (value: string): boolean => {
    return /^[01]+$/.test(value);
  };

  const isValidHex = (value: string): boolean => {
    return /^[0-9A-Fa-f]+$/.test(value);
  };

  const isValidOctal = (value: string): boolean => {
    return /^[0-7]+$/.test(value);
  };

  const updateFromDecimal = (value: string) => {
    setDecimal(value);
    if (value && isValidDecimal(value)) {
      const num = parseInt(value, 10);
      setBinary(num.toString(2));
      setHexadecimal(num.toString(16).toUpperCase());
      setOctal(num.toString(8));
    } else {
      setBinary("");
      setHexadecimal("");
      setOctal("");
    }
  };

  const updateFromBinary = (value: string) => {
    setBinary(value);
    if (value && isValidBinary(value)) {
      const num = parseInt(value, 2);
      setDecimal(num.toString());
      setHexadecimal(num.toString(16).toUpperCase());
      setOctal(num.toString(8));
    } else {
      setDecimal("");
      setHexadecimal("");
      setOctal("");
    }
  };

  const updateFromHex = (value: string) => {
    setHexadecimal(value.toUpperCase());
    if (value && isValidHex(value)) {
      const num = parseInt(value, 16);
      setDecimal(num.toString());
      setBinary(num.toString(2));
      setOctal(num.toString(8));
    } else {
      setDecimal("");
      setBinary("");
      setOctal("");
    }
  };

  const updateFromOctal = (value: string) => {
    setOctal(value);
    if (value && isValidOctal(value)) {
      const num = parseInt(value, 8);
      setDecimal(num.toString());
      setBinary(num.toString(2));
      setHexadecimal(num.toString(16).toUpperCase());
    } else {
      setDecimal("");
      setBinary("");
      setHexadecimal("");
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const clearAll = () => {
    setDecimal("");
    setBinary("");
    setHexadecimal("");
    setOctal("");
    toast.success("All fields cleared");
  };

  return (
    <ToolLayout
      title="Number Base Converter"
      description="Convert numbers between Binary, Decimal, Hexadecimal, and Octal"
      category="Developer Tools"
      instructions={[
        "Enter a number in any base format",
        "The tool will automatically convert to all other bases",
        "Click the copy button to copy any converted value",
        "Useful for programming and debugging",
      ]}
      relatedTools={[
        { name: "Hash Generator", path: "/tools/hash-generator" },
        { name: "Base64 Encoder", path: "/tools/base64-encoder" },
        { name: "Color Converter", path: "/tools/color-converter" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" onClick={clearAll}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Decimal (Base 10)</Label>
                {decimal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(decimal, "Decimal")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              <Input
                placeholder="Enter decimal number (e.g., 255)"
                value={decimal}
                onChange={(e) => updateFromDecimal(e.target.value)}
                className="font-mono text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Valid characters: 0-9
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Binary (Base 2)</Label>
                {binary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(binary, "Binary")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              <Input
                placeholder="Enter binary number (e.g., 11111111)"
                value={binary}
                onChange={(e) => updateFromBinary(e.target.value)}
                className="font-mono text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Valid characters: 0, 1
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Hexadecimal (Base 16)</Label>
                {hexadecimal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(hexadecimal, "Hexadecimal")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              <Input
                placeholder="Enter hex number (e.g., FF)"
                value={hexadecimal}
                onChange={(e) => updateFromHex(e.target.value)}
                className="font-mono text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Valid characters: 0-9, A-F
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Octal (Base 8)</Label>
                {octal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(octal, "Octal")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              <Input
                placeholder="Enter octal number (e.g., 377)"
                value={octal}
                onChange={(e) => updateFromOctal(e.target.value)}
                className="font-mono text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Valid characters: 0-7
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Quick Reference</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2">Common Conversions:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Decimal 10 = Binary 1010 = Hex A</li>
                  <li>• Decimal 16 = Binary 10000 = Hex 10</li>
                  <li>• Decimal 255 = Binary 11111111 = Hex FF</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Usage Examples:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• IP addresses (e.g., 192.168.1.1)</li>
                  <li>• Color codes (e.g., #FF5733)</li>
                  <li>• File permissions (e.g., 755)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default NumberBaseConverter;

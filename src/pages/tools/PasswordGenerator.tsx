import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Key, RefreshCw, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdRow } from "@/components/AdRow";

const uppercaseCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercaseCharacters = "abcdefghijklmnopqrstuvwxyz";
const numberCharacters = "0123456789";
const symbolCharacters = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const getRandomInt = (max: number) => {
  const limit = Math.floor(0xffffffff / max) * max;
  const values = new Uint32Array(1);

  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % max;
};

const shuffleCharacters = (characters: string[]) => {
  for (let i = characters.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }
};

const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generatePassword = () => {
    const groups = [
      includeUppercase ? uppercaseCharacters : "",
      includeLowercase ? lowercaseCharacters : "",
      includeNumbers ? numberCharacters : "",
      includeSymbols ? symbolCharacters : "",
    ].filter(Boolean);
    const charset = groups.join("");

    if (charset === "") {
      toast({
        title: "Error",
        description: "Please select at least one character type",
        variant: "destructive",
      });
      return;
    }

    const chars = groups.map((group) => group[getRandomInt(group.length)]);

    while (chars.length < length[0]) {
      chars.push(charset[getRandomInt(charset.length)]);
    }

    shuffleCharacters(chars);
    setPassword(chars.join(""));
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);

      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the password manually",
        variant: "destructive",
      });
    }
  };

  const getStrength = () => {
    if (!password) return { text: "", color: "" };

    let strength = 0;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { text: "Weak", color: "text-red-500" };
    if (strength <= 3) return { text: "Medium", color: "text-yellow-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const strength = getStrength();

  return (
    <>
      <ToolLayout
        title="Password Generator"
        description="Create secure, random passwords instantly"
        category="Security Tools"
        instructions={[
          "Set password length and character types",
          "Click 'Generate Password'",
          "Copy your secure password",
          "Use for accounts, apps, and more",
        ]}
        relatedTools={[
          { name: "Hash Generator", path: "/tools/hash-generator" },
          { name: "Base64 Encoder", path: "/tools/base64-encoder" },
        ]}
      >
        <AdRow className="mb-6" />
        <Card className="p-6 space-y-6">
          {password && (
            <div className="space-y-2">
              <Label>Generated Password</Label>
              <div className="flex gap-2">
                <Input
                  value={password}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm">
                Strength: <span className={`font-semibold ${strength.color}`}>{strength.text}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Length: {length[0]} characters</Label>
              <Slider
                value={length}
                onValueChange={setLength}
                min={4}
                max={64}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uppercase"
                  checked={includeUppercase}
                  onCheckedChange={(checked) => setIncludeUppercase(Boolean(checked))}
                />
                <label htmlFor="uppercase" className="text-sm cursor-pointer">
                  Uppercase (A-Z)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lowercase"
                  checked={includeLowercase}
                  onCheckedChange={(checked) => setIncludeLowercase(Boolean(checked))}
                />
                <label htmlFor="lowercase" className="text-sm cursor-pointer">
                  Lowercase (a-z)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="numbers"
                  checked={includeNumbers}
                  onCheckedChange={(checked) => setIncludeNumbers(Boolean(checked))}
                />
                <label htmlFor="numbers" className="text-sm cursor-pointer">
                  Numbers (0-9)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="symbols"
                  checked={includeSymbols}
                  onCheckedChange={(checked) => setIncludeSymbols(Boolean(checked))}
                />
                <label htmlFor="symbols" className="text-sm cursor-pointer">
                  Symbols (!@#$%^&*)
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={generatePassword}
            size="lg"
            className="w-full gradient-primary border-0"
          >
            {password ? <RefreshCw className="h-4 w-4 mr-2" /> : <Key className="h-4 w-4 mr-2" />}
            {password ? "Generate New Password" : "Generate Password"}
          </Button>
        </Card>
        <AdRow className="mt-6" />
      </ToolLayout>
    </>
  );
};

export default PasswordGenerator;

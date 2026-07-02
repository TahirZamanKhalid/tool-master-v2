import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Copy, RefreshCw, Check } from "lucide-react";
import { AdRow } from "@/components/AdRow";

const lowercaseCharacters = "abcdefghijklmnopqrstuvwxyz";
const uppercaseCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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

const AdvancedPasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedMain, setCopiedMain] = useState(false);

  const applyExclusions = (characters: string) => {
    let filtered = characters;

    if (excludeSimilar) {
      filtered = filtered.replace(/[il1Lo0O]/g, "");
    }

    if (excludeAmbiguous) {
      filtered = filtered.replace(/[{}\[\]()\/<>]/g, "");
    }

    return filtered;
  };

  const generatePassword = () => {
    const groups = [
      includeLowercase ? applyExclusions(lowercaseCharacters) : "",
      includeUppercase ? applyExclusions(uppercaseCharacters) : "",
      includeNumbers ? applyExclusions(numberCharacters) : "",
      includeSymbols ? applyExclusions(symbolCharacters) : "",
    ].filter(Boolean);
    const charset = groups.join("");

    if (!charset || groups.length === 0) {
      toast.error("Please select at least one character type");
      return null;
    }

    const result = groups.map((group) => group[getRandomInt(group.length)]);

    while (result.length < length) {
      result.push(charset[getRandomInt(charset.length)]);
    }

    shuffleCharacters(result);
    return result.join("");
  };

  const handleGenerate = () => {
    const newPasswords: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const generated = generatePassword();
      if (!generated) return;
      newPasswords.push(generated);
    }
    setPasswords(newPasswords);
    setPassword(newPasswords[0]);
    setCopied(null);
    setCopiedMain(false);
  };

  const copyToClipboard = async (pwd: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(pwd);

      if (index !== undefined) {
        setCopied(index);
        setTimeout(() => setCopied(null), 2000);
      } else {
        setCopiedMain(true);
        setTimeout(() => setCopiedMain(false), 2000);
      }

      toast.success("Password copied to clipboard!");
    } catch {
      toast.error("Copy failed. Please copy the password manually.");
    }
  };

  const getPasswordStrength = (pwd: string): { text: string; color: string; score: number } => {
    let score = 0;
    if (pwd.length >= 12) score += 20;
    if (pwd.length >= 16) score += 10;
    if (pwd.length >= 20) score += 10;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 15;

    if (score >= 80) return { text: "Very Strong", color: "text-green-600", score };
    if (score >= 60) return { text: "Strong", color: "text-blue-600", score };
    if (score >= 40) return { text: "Medium", color: "text-yellow-600", score };
    return { text: "Weak", color: "text-red-600", score };
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  const strength = password ? getPasswordStrength(password) : null;

  return (
    <ToolLayout
      title="Advanced Password Generator"
      description="Generate ultra-secure random passwords with full customization. Create strong, cryptographically secure passwords for maximum account protection."
      category="Security Tools"
      instructions={[
        "Adjust password length using the slider (8-64 characters)",
        "Select character types to include",
        "Enable options to exclude similar or ambiguous characters",
        "Generate multiple passwords at once if needed",
        "Copy passwords to clipboard with one click"
      ]}
      relatedTools={[
        { name: "Password Strength Checker", path: "/tools/password-strength" },
        { name: "Hash Generator", path: "/tools/hash-generator" }
      ]}
    >
      <AdRow className="mb-6" />
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Password Display */}
            {password && (
              <div>
                <Label>Generated Password</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={password}
                    readOnly
                    className="font-mono text-lg"
                  />
                  <Button onClick={() => copyToClipboard(password)} size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {strength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Strength:</span>
                      <span className={`font-semibold ${strength.color}`}>{strength.text}</span>
                    </div>
                    <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          strength.score >= 80
                            ? 'bg-green-600'
                            : strength.score >= 60
                            ? 'bg-blue-600'
                            : strength.score >= 40
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Length Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Password Length: {length}</Label>
                <span className="text-xs text-muted-foreground">
                  {length < 12 ? 'Short' : length < 16 ? 'Good' : 'Excellent'}
                </span>
              </div>
              <Slider
                value={[length]}
                onValueChange={(value) => setLength(value[0])}
                min={8}
                max={64}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Character Types */}
            <div className="space-y-3">
              <Label>Character Types</Label>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="uppercase" className="cursor-pointer flex-1">
                    Uppercase (A-Z)
                  </Label>
                  <Switch
                    id="uppercase"
                    checked={includeUppercase}
                    onCheckedChange={setIncludeUppercase}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lowercase" className="cursor-pointer flex-1">
                    Lowercase (a-z)
                  </Label>
                  <Switch
                    id="lowercase"
                    checked={includeLowercase}
                    onCheckedChange={setIncludeLowercase}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="numbers" className="cursor-pointer flex-1">
                    Numbers (0-9)
                  </Label>
                  <Switch
                    id="numbers"
                    checked={includeNumbers}
                    onCheckedChange={setIncludeNumbers}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="symbols" className="cursor-pointer flex-1">
                    Symbols (!@#$%^&*)
                  </Label>
                  <Switch
                    id="symbols"
                    checked={includeSymbols}
                    onCheckedChange={setIncludeSymbols}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-3">
              <Label>Advanced Options</Label>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="exclude-similar" className="cursor-pointer flex-1 text-sm">
                    Exclude Similar Characters (i, l, 1, L, o, 0, O)
                  </Label>
                  <Switch
                    id="exclude-similar"
                    checked={excludeSimilar}
                    onCheckedChange={setExcludeSimilar}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="exclude-ambiguous" className="cursor-pointer flex-1 text-sm">
                    Exclude Ambiguous Symbols {'({}<>[]/)'}
                  </Label>
                  <Switch
                    id="exclude-ambiguous"
                    checked={excludeAmbiguous}
                    onCheckedChange={setExcludeAmbiguous}
                  />
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Generate Multiple Passwords</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                className="mt-2"
              />
            </div>

            {/* Generate Button */}
            <Button onClick={handleGenerate} size="lg" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Password{quantity > 1 ? 's' : ''}
            </Button>

            {/* Multiple Passwords List */}
            {quantity > 1 && passwords.length > 1 && (
              <div>
                <Label className="mb-2 block">Generated Passwords ({passwords.length})</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {passwords.map((pwd, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={pwd}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        onClick={() => copyToClipboard(pwd, index)}
                        size="icon"
                        variant="outline"
                      >
                        {copied === index ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Password Security Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Use 16+ characters:</strong> Longer passwords are exponentially harder to crack</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Unique for each account:</strong> Never reuse passwords across sites</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Use a password manager:</strong> Store passwords securely (LastPass, 1Password, Bitwarden)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Enable 2FA:</strong> Add extra security layer wherever possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Cryptographically Secure:</strong> This tool uses crypto.getRandomValues() for true randomness</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <AdRow className="mt-6" />
    </ToolLayout>
  );
};

export default AdvancedPasswordGenerator;

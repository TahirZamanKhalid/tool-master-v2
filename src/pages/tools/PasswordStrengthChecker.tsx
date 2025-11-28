import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AdSpace } from "@/components/AdSpace";

const PasswordStrengthChecker = () => {
  const [password, setPassword] = useState("");

  const checkStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
    return strength;
  };

  const strength = checkStrength(password);
  const getStrengthLabel = () => {
    if (strength < 25) return "Weak";
    if (strength < 50) return "Fair";
    if (strength < 75) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (strength < 25) return "text-red-500";
    if (strength < 50) return "text-orange-500";
    if (strength < 75) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <ToolLayout
      title="Password Strength Checker"
      description="Check how strong your password is"
      category="Security Tools"
    >
      <AdSpace className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to check strength"
          />
          {password && (
            <>
              <Progress value={strength} className="h-2" />
              <p className={`font-semibold ${getStrengthColor()}`}>
                Strength: {getStrengthLabel()} ({strength}%)
              </p>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>✓ At least 8 characters {password.length >= 8 ? "✅" : "❌"}</p>
                <p>✓ Uppercase and lowercase {/[a-z]/.test(password) && /[A-Z]/.test(password) ? "✅" : "❌"}</p>
                <p>✓ Numbers {/[0-9]/.test(password) ? "✅" : "❌"}</p>
                <p>✓ Special characters {/[^a-zA-Z0-9]/.test(password) ? "✅" : "❌"}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default PasswordStrengthChecker;

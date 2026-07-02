import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AdSpace } from "@/components/AdSpace";

const commonPasswords = new Set([
  "password",
  "password123",
  "123456",
  "123456789",
  "qwerty",
  "admin",
  "letmein",
  "welcome",
  "iloveyou",
]);

const hasSequence = (value: string) =>
  /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|asdf)/i.test(value);

const PasswordStrengthChecker = () => {
  const [password, setPassword] = useState("");

  const checkStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;

    if (commonPasswords.has(pwd.toLowerCase())) strength -= 35;
    if (/(.)\1{2,}/.test(pwd)) strength -= 15;
    if (hasSequence(pwd)) strength -= 15;

    return Math.max(0, Math.min(100, strength));
  };

  const strength = checkStrength(password);
  const checks = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "Uppercase and lowercase", passed: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Numbers", passed: /[0-9]/.test(password) },
    { label: "Special characters", passed: /[^a-zA-Z0-9]/.test(password) },
    { label: "No obvious repeats or sequences", passed: !/(.)\1{2,}/.test(password) && !hasSequence(password) },
  ];

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
      <AdSpace size="leaderboard" className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to check strength"
            autoComplete="off"
            spellCheck={false}
          />
          {password && (
            <>
              <Progress value={strength} className="h-2" />
              <p className={`font-semibold ${getStrengthColor()}`}>
                Strength: {getStrengthLabel()} ({strength}%)
              </p>
              <div className="text-sm space-y-1 text-muted-foreground">
                {checks.map((check) => (
                  <p key={check.label}>
                    {check.passed ? "Pass" : "Missing"}: {check.label}
                  </p>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default PasswordStrengthChecker;

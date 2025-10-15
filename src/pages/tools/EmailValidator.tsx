import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const EmailValidator = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{
    valid: boolean;
    message: string;
    details: string[];
  } | null>(null);

  const validateEmail = () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email);
    const details: string[] = [];

    // Check various aspects
    if (email.includes("..")) details.push("❌ Contains consecutive dots");
    else details.push("✅ No consecutive dots");

    if (email.startsWith(".") || email.endsWith(".")) details.push("❌ Starts or ends with dot");
    else details.push("✅ Proper dot placement");

    const [local, domain] = email.split("@");
    if (local && local.length > 64) details.push("❌ Local part too long (max 64 chars)");
    else if (local) details.push("✅ Local part length OK");

    if (domain && domain.split(".").length < 2) details.push("❌ Invalid domain");
    else if (domain) details.push("✅ Valid domain structure");

    setResult({
      valid: isValid,
      message: isValid ? "Email is valid!" : "Email is invalid",
      details
    });
  };

  return (
    <>
      <SEOHead
        title="Email Validator"
        description="Validate email addresses instantly with detailed syntax checking and domain verification"
        keywords="email validator, email checker, verify email, email syntax"
        canonical="https://toolmaster.cloud/tools/email-validator"
      />
      <ToolLayout
        title="Email Validator"
        description="Validate email addresses with detailed syntax checking"
        category="Developer Tools"
        instructions={[
          "Enter the email address to validate",
          "Click 'Validate Email' to check",
          "Review detailed validation results",
          "See specific issues if email is invalid"
        ]}
        relatedTools={[
          { name: "Regex Tester", path: "/tools/regex-tester" },
          { name: "URL Encoder", path: "/tools/url-encoder" }
        ]}
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && validateEmail()}
              />
              <Button onClick={validateEmail}>
                Validate Email
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {result.valid ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <span className={`font-semibold ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  {result.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </ToolLayout>
    </>
  );
};

export default EmailValidator;

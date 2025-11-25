import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, XCircle } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const CreditCardValidator = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [result, setResult] = useState<{
    valid: boolean;
    type: string;
  } | null>(null);

  const luhnCheck = (num: string): boolean => {
    let sum = 0;
    let isEven = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const getCardType = (num: string): string => {
    if (/^4/.test(num)) return "Visa";
    if (/^5[1-5]/.test(num)) return "Mastercard";
    if (/^3[47]/.test(num)) return "American Express";
    if (/^6(?:011|5)/.test(num)) return "Discover";
    return "Unknown";
  };

  const validate = () => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (!/^\d+$/.test(cleaned)) {
      toast.error("Card number must contain only digits");
      return;
    }

    if (cleaned.length < 13 || cleaned.length > 19) {
      toast.error("Card number must be 13-19 digits");
      return;
    }

    const isValid = luhnCheck(cleaned);
    const type = getCardType(cleaned);

    setResult({ valid: isValid, type });
    
    if (isValid) {
      toast.success("Valid card number");
    } else {
      toast.error("Invalid card number");
    }
  };

  return (
    <>
      <SEOHead
        title="Credit Card Validator"
        description="Validate credit card numbers using the Luhn algorithm and identify card types"
        keywords="credit card validator, luhn check, card number validator, validate cc"
        canonical="https://toolmaster.cloud/tools/credit-card-validator"
      />
      <ToolLayout
        title="Credit Card Validator"
        description="Validate credit card numbers using Luhn algorithm"
        category="Developer Tools"
        instructions={[
          "Enter credit card number",
          "Spaces are automatically removed",
          "Click 'Validate' to check",
          "See card type and validity result"
        ]}
        relatedTools={[
          { name: "Password Strength", path: "/tools/password-strength" },
          { name: "Hash Generator", path: "/tools/hash-generator" }
        ]}
      >
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter card number..."
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && validate()}
                maxLength={19}
              />
              <Button onClick={validate}>
                <CreditCard className="h-4 w-4 mr-2" />
                Validate
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.valid ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <span className={`font-semibold ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                    {result.valid ? 'Valid Card Number' : 'Invalid Card Number'}
                  </span>
                </div>
                <p className="text-sm">Card Type: <strong>{result.type}</strong></p>
                <p className="text-xs text-muted-foreground mt-2">
                  Validation using Luhn algorithm
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
              <strong>Note:</strong> This tool only validates the format and checksum.
              It does not verify if the card is actually active or valid for transactions.
            </div>
          </CardContent>
        </Card>
      </ToolLayout>
    </>
  );
};

export default CreditCardValidator;

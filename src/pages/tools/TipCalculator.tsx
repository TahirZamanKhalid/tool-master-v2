import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DollarSign, Users } from "lucide-react";
import { useAdRefresh } from "@/hooks/useAdRefresh";

const TipCalculator = () => {
  const adRefreshKey = useAdRefresh(3);
  const [billAmount, setBillAmount] = useState<string>("");
  const [tipPercent, setTipPercent] = useState<number>(15);
  const [splitCount, setSplitCount] = useState<number>(1);

  const bill = parseFloat(billAmount) || 0;
  const tipAmount = bill * (tipPercent / 100);
  const total = bill + tipAmount;
  const perPerson = total / splitCount;
  const tipPerPerson = tipAmount / splitCount;

  const quickTipButtons = [10, 15, 18, 20, 25];

  return (
    <ToolLayout
      title="Tip Calculator"
      description="Calculate tips and split bills easily. Perfect for restaurants, delivery, and service payments. Free tip calculator with bill splitting."
      category="Calculators"
      adRefreshKey={adRefreshKey}
      instructions={[
        "Enter the total bill amount",
        "Select or adjust tip percentage",
        "Optionally split the bill among multiple people",
        "View total amount, tip amount, and per-person costs"
      ]}
      relatedTools={[
        { name: "Discount Calculator", path: "/tools/discount-calculator" },
        { name: "Tax Calculator", path: "/tools/tax-calculator" },
        { name: "Percentage Calculator", path: "/tools/percentage-calculator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Bill Amount */}
            <div>
              <Label htmlFor="bill-amount">Bill Amount</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="bill-amount"
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Quick Tip Buttons */}
            <div>
              <Label>Quick Tip Selection</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {quickTipButtons.map((tip) => (
                  <Button
                    key={tip}
                    variant={tipPercent === tip ? "default" : "outline"}
                    onClick={() => setTipPercent(tip)}
                    className="w-full"
                  >
                    {tip}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Tip Percentage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Tip Percentage: {tipPercent}%</Label>
              </div>
              <Slider
                value={[tipPercent]}
                onValueChange={(value) => setTipPercent(value[0])}
                min={0}
                max={50}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Split Bill */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="split-count">Split Between</Label>
                <span className="text-sm text-muted-foreground">{splitCount} {splitCount === 1 ? 'person' : 'people'}</span>
              </div>
              <div className="relative mt-2">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="split-count"
                  type="number"
                  value={splitCount}
                  onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="100"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {bill > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Calculation Results</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Tip Amount ({tipPercent}%)</span>
                  <span className="text-2xl font-bold text-primary">${tipAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Total Amount</span>
                  <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                </div>

                {splitCount > 1 && (
                  <>
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground mb-3">Per Person (Split {splitCount} ways)</p>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-sm font-medium">Total Per Person</span>
                      <span className="text-2xl font-bold text-green-600">${perPerson.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-xs font-medium">Tip Per Person</span>
                      <span className="text-lg font-semibold text-muted-foreground">${tipPerPerson.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Summary */}
              <div className="pt-4 border-t space-y-2">
                <h4 className="font-semibold text-sm mb-2">Summary</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• Original Bill: ${bill.toFixed(2)}</p>
                  <p>• Tip ({tipPercent}%): ${tipAmount.toFixed(2)}</p>
                  <p>• Grand Total: ${total.toFixed(2)}</p>
                  {splitCount > 1 && (
                    <p>• Each Person Pays: ${perPerson.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tipping Guide */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tipping Guide</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">Poor Service</span>
                <span className="text-muted-foreground">10-12%</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">Average Service</span>
                <span className="text-muted-foreground">15%</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">Good Service</span>
                <span className="text-muted-foreground">18-20%</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">Excellent Service</span>
                <span className="text-muted-foreground">20-25%</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-medium">Exceptional Service</span>
                <span className="text-muted-foreground">25%+</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Tipping customs vary by country and service type.
                Always consider local customs and quality of service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default TipCalculator;

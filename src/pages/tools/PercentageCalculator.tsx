import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calculator } from "lucide-react";

const PercentageCalculator = () => {
  const [num1, setNum1] = useState("50");
  const [num2, setNum2] = useState("100");
  const [percentage, setPercentage] = useState("10");
  const [base, setBase] = useState("200");

  const calculatePercentage = () => {
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);
    if (isNaN(n1) || isNaN(n2) || n2 === 0) return "0";
    return ((n1 / n2) * 100).toFixed(2);
  };

  const calculatePercentOf = () => {
    const pct = parseFloat(percentage);
    const b = parseFloat(base);
    if (isNaN(pct) || isNaN(b)) return "0";
    return ((pct / 100) * b).toFixed(2);
  };

  const calculateIncrease = () => {
    const b = parseFloat(base);
    const pct = parseFloat(percentage);
    if (isNaN(b) || isNaN(pct)) return "0";
    return (b + (b * pct / 100)).toFixed(2);
  };

  const calculateDecrease = () => {
    const b = parseFloat(base);
    const pct = parseFloat(percentage);
    if (isNaN(b) || isNaN(pct)) return "0";
    return (b - (b * pct / 100)).toFixed(2);
  };

  return (
    <ToolLayout
      title="Percentage Calculator"
      description="Calculate percentages and percentage changes"
      category="Calculators"
      relatedTools={[
        { name: "Currency Converter", path: "/tools/currency-converter" },
        { name: "Unit Converter", path: "/tools/unit-converter" },
        { name: "BMI Calculator", path: "/tools/bmi-calculator" }
      ]}
    >
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">What is X% of Y?</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="pct1">Percentage (%)</Label>
              <Input
                id="pct1"
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="base1">Of</Label>
              <Input
                id="base1"
                type="number"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Result</p>
            <p className="text-2xl font-bold">{calculatePercentOf()}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">What % is X of Y?</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="num1">Number</Label>
              <Input
                id="num1"
                type="number"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="num2">Of</Label>
              <Input
                id="num2"
                type="number"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Result</p>
            <p className="text-2xl font-bold">{calculatePercentage()}%</p>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Percentage Increase</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {base} + {percentage}%
            </p>
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{calculateIncrease()}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Percentage Decrease</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {base} - {percentage}%
            </p>
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{calculateDecrease()}</p>
            </div>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PercentageCalculator;

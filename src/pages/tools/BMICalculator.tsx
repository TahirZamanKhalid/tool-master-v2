import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Activity } from "lucide-react";

const BMICalculator = () => {
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    
    if (isNaN(w) || isNaN(h) || h === 0) return 0;

    if (unit === "metric") {
      // kg and cm
      const heightInMeters = h / 100;
      return w / (heightInMeters * heightInMeters);
    } else {
      // lbs and inches
      return (w / (h * h)) * 703;
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { category: "Normal weight", color: "text-green-600" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600" };
    return { category: "Obese", color: "text-red-600" };
  };

  const bmi = calculateBMI();
  const { category, color } = getBMICategory(bmi);

  return (
    <ToolLayout
      title="BMI Calculator"
      description="Calculate your Body Mass Index"
      category="Calculators"
      relatedTools={[
        { name: "Percentage Calculator", path: "/tools/percentage-calculator" },
        { name: "Unit Converter", path: "/tools/unit-converter" },
        { name: "Currency Converter", path: "/tools/currency-converter" }
      ]}
    >
      <div className="space-y-6">
        <div>
          <Label>Unit System</Label>
          <RadioGroup value={unit} onValueChange={(v) => setUnit(v as typeof unit)} className="flex gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="metric" id="metric" />
              <Label htmlFor="metric" className="cursor-pointer">Metric (kg, cm)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="imperial" id="imperial" />
              <Label htmlFor="imperial" className="cursor-pointer">Imperial (lbs, in)</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">
              Weight {unit === "metric" ? "(kg)" : "(lbs)"}
            </Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-2"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="height">
              Height {unit === "metric" ? "(cm)" : "(inches)"}
            </Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-2"
              step="0.1"
            />
          </div>
        </div>

        <Card className="p-6 text-center space-y-4">
          <h3 className="font-semibold text-lg">Your BMI</h3>
          <p className="text-5xl font-bold">{bmi.toFixed(1)}</p>
          <p className={`text-xl font-semibold ${color}`}>{category}</p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">BMI Categories</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Underweight</span>
              <span className="text-muted-foreground">BMI &lt; 18.5</span>
            </div>
            <div className="flex justify-between">
              <span>Normal weight</span>
              <span className="text-muted-foreground">BMI 18.5 - 24.9</span>
            </div>
            <div className="flex justify-between">
              <span>Overweight</span>
              <span className="text-muted-foreground">BMI 25 - 29.9</span>
            </div>
            <div className="flex justify-between">
              <span>Obese</span>
              <span className="text-muted-foreground">BMI ≥ 30</span>
            </div>
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default BMICalculator;

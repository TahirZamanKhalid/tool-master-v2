import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useAdRefresh } from "@/hooks/useAdRefresh";

const UnitConverter = () => {
  const adRefreshKey = useAdRefresh(3);
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("meter");
  const [toUnit, setToUnit] = useState("kilometer");
  const [value, setValue] = useState("1");

  const units: Record<string, Record<string, number>> = {
    length: {
      meter: 1,
      kilometer: 0.001,
      centimeter: 100,
      millimeter: 1000,
      mile: 0.000621371,
      yard: 1.09361,
      foot: 3.28084,
      inch: 39.3701,
    },
    weight: {
      kilogram: 1,
      gram: 1000,
      milligram: 1000000,
      pound: 2.20462,
      ounce: 35.274,
      ton: 0.001,
    },
    temperature: {
      celsius: 1,
      fahrenheit: 1,
      kelvin: 1,
    },
    volume: {
      liter: 1,
      milliliter: 1000,
      gallon: 0.264172,
      quart: 1.05669,
      pint: 2.11338,
      cup: 4.22675,
    },
  };

  const convertValue = () => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";

    if (category === "temperature") {
      return convertTemperature(num, fromUnit, toUnit).toFixed(2);
    }

    const baseValue = num / units[category][fromUnit];
    const result = baseValue * units[category][toUnit];
    return result.toFixed(6);
  };

  const convertTemperature = (val: number, from: string, to: string) => {
    let celsius = val;
    
    if (from === "fahrenheit") celsius = (val - 32) * (5 / 9);
    if (from === "kelvin") celsius = val - 273.15;
    
    if (to === "fahrenheit") return (celsius * 9/5) + 32;
    if (to === "kelvin") return celsius + 273.15;
    return celsius;
  };

  return (
    <ToolLayout
      title="Unit Converter"
      description="Convert between different units of measurement"
      category="Calculators"
      adRefreshKey={adRefreshKey}
      relatedTools={[
        { name: "Currency Converter", path: "/tools/currency-converter" },
        { name: "Timestamp Converter", path: "/tools/timestamp-converter" },
        { name: "Percentage Calculator", path: "/tools/percentage-calculator" }
      ]}
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(v) => {
            setCategory(v);
            setFromUnit(Object.keys(units[v])[0]);
            setToUnit(Object.keys(units[v])[1]);
          }}>
            <SelectTrigger id="category" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="length">Length</SelectItem>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="from">From</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger id="from" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(units[category]).map(unit => (
                  <SelectItem key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>

        <div>
          <Label htmlFor="to">To</Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger id="to" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(units[category]).map(unit => (
                <SelectItem key={unit} value={unit}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Result</p>
          <p className="text-3xl font-bold">{convertValue()} {toUnit}</p>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default UnitConverter;

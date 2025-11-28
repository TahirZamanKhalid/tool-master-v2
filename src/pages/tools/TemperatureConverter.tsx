import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdSpace } from "@/components/AdSpace";

const TemperatureConverter = () => {
  const [celsius, setCelsius] = useState("");
  const [fahrenheit, setFahrenheit] = useState("");
  const [kelvin, setKelvin] = useState("");

  const fromCelsius = (c: number) => {
    setFahrenheit(((c * 9/5) + 32).toFixed(2));
    setKelvin((c + 273.15).toFixed(2));
  };

  const fromFahrenheit = (f: number) => {
    const c = (f - 32) * 5/9;
    setCelsius(c.toFixed(2));
    setKelvin((c + 273.15).toFixed(2));
  };

  const fromKelvin = (k: number) => {
    const c = k - 273.15;
    setCelsius(c.toFixed(2));
    setFahrenheit(((c * 9/5) + 32).toFixed(2));
  };

  return (
    <ToolLayout
      title="Temperature Converter"
      description="Convert between Celsius, Fahrenheit, and Kelvin"
      category="Converter Tools"
    >
      <AdSpace className="mb-6" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Celsius (°C)</Label>
            <Input
              type="number"
              value={celsius}
              onChange={(e) => {
                setCelsius(e.target.value);
                if (e.target.value) fromCelsius(parseFloat(e.target.value));
              }}
              placeholder="0"
            />
          </div>
          <div>
            <Label>Fahrenheit (°F)</Label>
            <Input
              type="number"
              value={fahrenheit}
              onChange={(e) => {
                setFahrenheit(e.target.value);
                if (e.target.value) fromFahrenheit(parseFloat(e.target.value));
              }}
              placeholder="32"
            />
          </div>
          <div>
            <Label>Kelvin (K)</Label>
            <Input
              type="number"
              value={kelvin}
              onChange={(e) => {
                setKelvin(e.target.value);
                if (e.target.value) fromKelvin(parseFloat(e.target.value));
              }}
              placeholder="273.15"
            />
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
};

export default TemperatureConverter;

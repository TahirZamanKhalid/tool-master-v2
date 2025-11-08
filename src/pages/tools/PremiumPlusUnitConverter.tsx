import { useState, useMemo } from "react";
import { Ruler, History, ArrowLeftRight, X, Copy, Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ConversionHistory {
  id: string;
  timestamp: Date;
  value: number;
  fromUnit: string;
  toUnit: string;
  result: number;
  category: string;
}

interface UnitCategory {
  name: string;
  units: { [key: string]: { name: string; toBase: number } };
}

const UNITS: { [key: string]: UnitCategory } = {
  length: {
    name: "Length",
    units: {
      meter: { name: "Meter (m)", toBase: 1 },
      kilometer: { name: "Kilometer (km)", toBase: 1000 },
      centimeter: { name: "Centimeter (cm)", toBase: 0.01 },
      millimeter: { name: "Millimeter (mm)", toBase: 0.001 },
      mile: { name: "Mile (mi)", toBase: 1609.344 },
      yard: { name: "Yard (yd)", toBase: 0.9144 },
      foot: { name: "Foot (ft)", toBase: 0.3048 },
      inch: { name: "Inch (in)", toBase: 0.0254 },
      nauticalMile: { name: "Nautical Mile", toBase: 1852 },
    },
  },
  weight: {
    name: "Weight",
    units: {
      kilogram: { name: "Kilogram (kg)", toBase: 1 },
      gram: { name: "Gram (g)", toBase: 0.001 },
      milligram: { name: "Milligram (mg)", toBase: 0.000001 },
      ton: { name: "Metric Ton (t)", toBase: 1000 },
      pound: { name: "Pound (lb)", toBase: 0.453592 },
      ounce: { name: "Ounce (oz)", toBase: 0.0283495 },
      stone: { name: "Stone (st)", toBase: 6.35029 },
    },
  },
  temperature: {
    name: "Temperature",
    units: {
      celsius: { name: "Celsius (°C)", toBase: 1 },
      fahrenheit: { name: "Fahrenheit (°F)", toBase: 1 },
      kelvin: { name: "Kelvin (K)", toBase: 1 },
    },
  },
  volume: {
    name: "Volume",
    units: {
      liter: { name: "Liter (L)", toBase: 1 },
      milliliter: { name: "Milliliter (mL)", toBase: 0.001 },
      gallon: { name: "US Gallon (gal)", toBase: 3.78541 },
      quart: { name: "US Quart (qt)", toBase: 0.946353 },
      pint: { name: "US Pint (pt)", toBase: 0.473176 },
      cup: { name: "US Cup", toBase: 0.236588 },
      fluidOunce: { name: "Fluid Ounce (fl oz)", toBase: 0.0295735 },
      tablespoon: { name: "Tablespoon (tbsp)", toBase: 0.0147868 },
      teaspoon: { name: "Teaspoon (tsp)", toBase: 0.00492892 },
    },
  },
  area: {
    name: "Area",
    units: {
      squareMeter: { name: "Square Meter (m²)", toBase: 1 },
      squareKilometer: { name: "Square Kilometer (km²)", toBase: 1000000 },
      squareCentimeter: { name: "Square Centimeter (cm²)", toBase: 0.0001 },
      hectare: { name: "Hectare (ha)", toBase: 10000 },
      acre: { name: "Acre", toBase: 4046.86 },
      squareMile: { name: "Square Mile (mi²)", toBase: 2589988.11 },
      squareYard: { name: "Square Yard (yd²)", toBase: 0.836127 },
      squareFoot: { name: "Square Foot (ft²)", toBase: 0.092903 },
    },
  },
  speed: {
    name: "Speed",
    units: {
      meterPerSecond: { name: "Meter/Second (m/s)", toBase: 1 },
      kilometerPerHour: { name: "Kilometer/Hour (km/h)", toBase: 0.277778 },
      milePerHour: { name: "Mile/Hour (mph)", toBase: 0.44704 },
      knot: { name: "Knot", toBase: 0.514444 },
      footPerSecond: { name: "Foot/Second (ft/s)", toBase: 0.3048 },
    },
  },
  time: {
    name: "Time",
    units: {
      second: { name: "Second (s)", toBase: 1 },
      minute: { name: "Minute (min)", toBase: 60 },
      hour: { name: "Hour (h)", toBase: 3600 },
      day: { name: "Day", toBase: 86400 },
      week: { name: "Week", toBase: 604800 },
      month: { name: "Month (30 days)", toBase: 2592000 },
      year: { name: "Year (365 days)", toBase: 31536000 },
    },
  },
  data: {
    name: "Digital Storage",
    units: {
      byte: { name: "Byte (B)", toBase: 1 },
      kilobyte: { name: "Kilobyte (KB)", toBase: 1024 },
      megabyte: { name: "Megabyte (MB)", toBase: 1048576 },
      gigabyte: { name: "Gigabyte (GB)", toBase: 1073741824 },
      terabyte: { name: "Terabyte (TB)", toBase: 1099511627776 },
      petabyte: { name: "Petabyte (PB)", toBase: 1125899906842624 },
    },
  },
};

const PremiumPlusUnitConverter = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState<string>("length");
  const [value, setValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("meter");
  const [toUnit, setToUnit] = useState<string>("kilometer");
  const [history, setHistory] = useState<ConversionHistory[]>([]);

  // Convert value
  const result = useMemo(() => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 0;

    // Special handling for temperature
    if (category === "temperature") {
      return convertTemperature(numValue, fromUnit, toUnit);
    }

    const fromData = UNITS[category].units[fromUnit];
    const toData = UNITS[category].units[toUnit];

    if (!fromData || !toData) return 0;

    const baseValue = numValue * fromData.toBase;
    return baseValue / toData.toBase;
  }, [value, category, fromUnit, toUnit]);

  // Temperature conversion (special case)
  const convertTemperature = (val: number, from: string, to: string): number => {
    // Convert to Celsius first
    let celsius = val;
    if (from === "fahrenheit") {
      celsius = (val - 32) * (5 / 9);
    } else if (from === "kelvin") {
      celsius = val - 273.15;
    }

    // Convert from Celsius to target
    if (to === "fahrenheit") {
      return celsius * (9 / 5) + 32;
    } else if (to === "kelvin") {
      return celsius + 273.15;
    }
    return celsius;
  };

  // Add to history
  const addToHistory = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const newEntry: ConversionHistory = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      value: numValue,
      fromUnit: UNITS[category].units[fromUnit].name,
      toUnit: UNITS[category].units[toUnit].name,
      result: result,
      category: UNITS[category].name,
    };

    setHistory(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50
    toast({ title: "Added to history!" });
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    toast({ title: "History cleared!" });
  };

  // Load from history
  const loadFromHistory = (item: ConversionHistory) => {
    // Find the category key
    const categoryKey = Object.keys(UNITS).find(
      key => UNITS[key].name === item.category
    );
    if (!categoryKey) return;

    // Find unit keys
    const fromKey = Object.keys(UNITS[categoryKey].units).find(
      key => UNITS[categoryKey].units[key].name === item.fromUnit
    );
    const toKey = Object.keys(UNITS[categoryKey].units).find(
      key => UNITS[categoryKey].units[key].name === item.toUnit
    );

    if (!fromKey || !toKey) return;

    setCategory(categoryKey);
    setValue(item.value.toString());
    setFromUnit(fromKey);
    setToUnit(toKey);

    toast({ title: "Loaded from history!" });
  };

  // Remove history item
  const removeHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // Swap units
  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  // Copy result
  const copyResult = () => {
    navigator.clipboard.writeText(result.toString());
    toast({ title: "Result copied to clipboard!" });
  };

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const firstUnit = Object.keys(UNITS[newCategory].units)[0];
    const secondUnit = Object.keys(UNITS[newCategory].units)[1] || firstUnit;
    setFromUnit(firstUnit);
    setToUnit(secondUnit);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-600 to-cyan-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
              Premium Plus Unit Converter
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Convert units with conversion history tracking and quick access to recent conversions
          </p>
          <Badge variant="secondary" className="text-sm">Premium Plus Edition</Badge>
        </div>

        <Tabs defaultValue="converter" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="converter">
              <Ruler className="w-4 h-4 mr-2" />
              Converter
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          {/* Converter Tab */}
          <TabsContent value="converter" className="space-y-6">
            {/* Category Selection */}
            <Card className="shadow-2xl border-2 border-green-100">
              <CardHeader>
                <CardTitle>Select Category</CardTitle>
                <CardDescription>Choose the type of unit conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNITS).map(([key, data]) => (
                      <SelectItem key={key} value={key}>
                        {data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Converter */}
            <Card className="shadow-2xl border-2 border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5" />
                  Convert {UNITS[category].name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* From */}
                <div className="space-y-2">
                  <Label>From</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Enter value"
                      className="flex-1"
                    />
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(UNITS[category].units).map(([key, unit]) => (
                          <SelectItem key={key} value={key}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button onClick={swapUnits} variant="outline" size="icon">
                    <ArrowLeftRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* To */}
                <div className="space-y-2">
                  <Label>To</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 bg-muted rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {result.toFixed(6).replace(/\.?0+$/, '')}
                      </div>
                    </div>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(UNITS[category].units).map(([key, unit]) => (
                          <SelectItem key={key} value={key}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={addToHistory} variant="outline" className="flex-1">
                    <History className="w-4 h-4 mr-2" />
                    Save to History
                  </Button>
                  <Button onClick={copyResult} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Result
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Result Summary */}
            <Card className="bg-gradient-to-r from-green-100 to-cyan-100 border-2 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-lg text-muted-foreground mb-2">Conversion Result</p>
                  <p className="text-2xl font-bold">
                    {value} {UNITS[category].units[fromUnit].name} = {result.toFixed(6).replace(/\.?0+$/, '')} {UNITS[category].units[toUnit].name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="shadow-2xl border-2 border-green-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Conversion History
                    </CardTitle>
                    <CardDescription>Your recent conversions</CardDescription>
                  </div>
                  {history.length > 0 && (
                    <Button onClick={clearHistory} variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No conversion history yet</p>
                    <p className="text-sm">Your conversions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <Card key={item.id} className="border-2 hover:border-green-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{item.category}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {item.timestamp.toLocaleString()}
                                </span>
                              </div>
                              <p className="font-medium">
                                {item.value} {item.fromUnit} = {item.result.toFixed(6).replace(/\.?0+$/, '')} {item.toUnit}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => loadFromHistory(item)}
                                variant="outline"
                                size="sm"
                              >
                                Load
                              </Button>
                              <Button
                                onClick={() => removeHistoryItem(item.id)}
                                variant="ghost"
                                size="icon"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PremiumPlusUnitConverter;

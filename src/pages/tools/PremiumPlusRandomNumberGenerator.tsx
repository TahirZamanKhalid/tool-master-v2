import { useState } from "react";
import { Dices, Sparkles, RefreshCw, Copy, Download, BarChart3, Settings, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type Distribution = "uniform" | "normal" | "exponential" | "poisson";

interface GeneratedNumber {
  value: number;
  index: number;
}

interface Statistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number | null;
  stdDev: number;
  sum: number;
}

const PremiumPlusRandomNumberGenerator = () => {
  const { toast } = useToast();
  const [distribution, setDistribution] = useState<Distribution>("uniform");
  const [count, setCount] = useState<string>("10");
  const [min, setMin] = useState<string>("1");
  const [max, setMax] = useState<string>("100");
  const [mean, setMean] = useState<string>("50");
  const [stdDev, setStdDev] = useState<string>("15");
  const [lambda, setLambda] = useState<string>("3");
  const [decimals, setDecimals] = useState<string>("0");
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [results, setResults] = useState<GeneratedNumber[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // Generate random numbers based on distribution
  const generateNumbers = () => {
    const numCount = parseInt(count);
    const numDecimals = parseInt(decimals);

    if (!numCount || numCount <= 0 || numCount > 10000) {
      toast({ title: "Invalid count! Must be between 1 and 10000", variant: "destructive" });
      return;
    }

    let generated: number[] = [];

    switch (distribution) {
      case "uniform":
        generated = generateUniform(numCount, parseFloat(min), parseFloat(max), numDecimals, allowDuplicates);
        break;
      case "normal":
        generated = generateNormal(numCount, parseFloat(mean), parseFloat(stdDev), numDecimals);
        break;
      case "exponential":
        generated = generateExponential(numCount, parseFloat(lambda), numDecimals);
        break;
      case "poisson":
        generated = generatePoisson(numCount, parseFloat(lambda));
        break;
    }

    const numbersWithIndex: GeneratedNumber[] = generated.map((value, index) => ({
      value,
      index: index + 1,
    }));

    setResults(numbersWithIndex);
    setStatistics(calculateStatistics(generated));
    toast({ title: `Generated ${numCount} random numbers!` });
  };

  // Uniform distribution
  const generateUniform = (count: number, min: number, max: number, decimals: number, allowDups: boolean): number[] => {
    const numbers: number[] = [];
    const usedNumbers = new Set<number>();

    for (let i = 0; i < count; i++) {
      let num: number;
      let attempts = 0;

      do {
        num = Math.random() * (max - min) + min;
        num = parseFloat(num.toFixed(decimals));
        attempts++;

        if (attempts > 1000) {
          // If we can't find unique numbers, allow duplicates
          break;
        }
      } while (!allowDups && usedNumbers.has(num));

      numbers.push(num);
      if (!allowDups) usedNumbers.add(num);
    }

    return numbers;
  };

  // Normal (Gaussian) distribution using Box-Muller transform
  const generateNormal = (count: number, mean: number, stdDev: number, decimals: number): number[] => {
    const numbers: number[] = [];

    for (let i = 0; i < count; i++) {
      const u1 = Math.random();
      const u2 = Math.random();

      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const num = mean + z0 * stdDev;

      numbers.push(parseFloat(num.toFixed(decimals)));
    }

    return numbers;
  };

  // Exponential distribution
  const generateExponential = (count: number, lambda: number, decimals: number): number[] => {
    const numbers: number[] = [];

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const num = -Math.log(1 - u) / lambda;
      numbers.push(parseFloat(num.toFixed(decimals)));
    }

    return numbers;
  };

  // Poisson distribution
  const generatePoisson = (count: number, lambda: number): number[] => {
    const numbers: number[] = [];

    for (let i = 0; i < count; i++) {
      let l = Math.exp(-lambda);
      let k = 0;
      let p = 1;

      do {
        k++;
        p *= Math.random();
      } while (p > l);

      numbers.push(k - 1);
    }

    return numbers;
  };

  // Calculate statistics
  const calculateStatistics = (numbers: number[]): Statistics => {
    if (numbers.length === 0) {
      return { min: 0, max: 0, mean: 0, median: 0, mode: null, stdDev: 0, sum: 0 };
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    const mean = sum / numbers.length;

    // Median
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

    // Mode
    const frequency = new Map<number, number>();
    numbers.forEach(num => {
      frequency.set(num, (frequency.get(num) || 0) + 1);
    });

    let maxFreq = 0;
    let mode: number | null = null;
    frequency.forEach((freq, num) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = num;
      }
    });

    if (maxFreq === 1) mode = null; // No mode if all numbers appear once

    // Standard deviation
    const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean,
      median,
      mode,
      stdDev,
      sum,
    };
  };

  // Copy all numbers
  const copyNumbers = () => {
    const text = results.map(r => r.value).join(', ');
    navigator.clipboard.writeText(text);
    toast({ title: "Numbers copied to clipboard!" });
  };

  // Download as file
  const downloadNumbers = () => {
    const text = results.map(r => `${r.index}. ${r.value}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-numbers.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "File downloaded successfully!" });
  };

  // Download CSV
  const downloadCSV = () => {
    const csv = 'Index,Value\n' + results.map(r => `${r.index},${r.value}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-numbers.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "CSV file downloaded!" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Premium Plus Random Number Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Generate random numbers with multiple probability distributions and statistical analysis
          </p>
          <Badge variant="secondary" className="text-sm">Premium Plus Edition</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-2xl border-2 border-violet-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings
                </CardTitle>
                <CardDescription>Configure your random number generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Distribution */}
                <div className="space-y-2">
                  <Label>Distribution Type</Label>
                  <Select value={distribution} onValueChange={(v) => setDistribution(v as Distribution)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uniform">Uniform (Even)</SelectItem>
                      <SelectItem value="normal">Normal (Bell Curve)</SelectItem>
                      <SelectItem value="exponential">Exponential</SelectItem>
                      <SelectItem value="poisson">Poisson</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {distribution === "uniform" && "All values equally likely"}
                    {distribution === "normal" && "Most values near the mean"}
                    {distribution === "exponential" && "Decreasing probability"}
                    {distribution === "poisson" && "Discrete events probability"}
                  </p>
                </div>

                {/* Count */}
                <div className="space-y-2">
                  <Label>Count (max 10,000)</Label>
                  <Input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    placeholder="10"
                  />
                </div>

                {/* Uniform settings */}
                {distribution === "uniform" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Min</Label>
                        <Input
                          type="number"
                          value={min}
                          onChange={(e) => setMin(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max</Label>
                        <Input
                          type="number"
                          value={max}
                          onChange={(e) => setMax(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={allowDuplicates}
                        onCheckedChange={setAllowDuplicates}
                      />
                      <Label>Allow duplicates</Label>
                    </div>
                  </>
                )}

                {/* Normal settings */}
                {distribution === "normal" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Mean (μ)</Label>
                      <Input
                        type="number"
                        value={mean}
                        onChange={(e) => setMean(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Std Dev (σ)</Label>
                      <Input
                        type="number"
                        value={stdDev}
                        onChange={(e) => setStdDev(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Exponential & Poisson settings */}
                {(distribution === "exponential" || distribution === "poisson") && (
                  <div className="space-y-2">
                    <Label>Lambda (λ)</Label>
                    <Input
                      type="number"
                      value={lambda}
                      onChange={(e) => setLambda(e.target.value)}
                      step="0.1"
                    />
                  </div>
                )}

                {/* Decimals */}
                {distribution !== "poisson" && (
                  <div className="space-y-2">
                    <Label>Decimal Places</Label>
                    <Input
                      type="number"
                      value={decimals}
                      onChange={(e) => setDecimals(e.target.value)}
                      min="0"
                      max="10"
                    />
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={generateNumbers}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                  size="lg"
                >
                  <Dices className="w-4 h-4 mr-2" />
                  Generate Numbers
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            {statistics && results.length > 0 && (
              <Card className="shadow-xl border-2 border-violet-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Min</p>
                      <p className="text-lg font-bold">{statistics.min.toFixed(parseInt(decimals))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Max</p>
                      <p className="text-lg font-bold">{statistics.max.toFixed(parseInt(decimals))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Mean</p>
                      <p className="text-lg font-bold">{statistics.mean.toFixed(parseInt(decimals))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Median</p>
                      <p className="text-lg font-bold">{statistics.median.toFixed(parseInt(decimals))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Std Dev</p>
                      <p className="text-lg font-bold">{statistics.stdDev.toFixed(parseInt(decimals))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sum</p>
                      <p className="text-lg font-bold">{statistics.sum.toFixed(parseInt(decimals))}</p>
                    </div>
                  </div>
                  {statistics.mode !== null && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Mode (most frequent)</p>
                      <p className="text-lg font-bold">{statistics.mode.toFixed(parseInt(decimals))}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-2 border-violet-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Generated Numbers ({results.length})
                    </CardTitle>
                    <CardDescription>Your random numbers</CardDescription>
                  </div>
                  {results.length > 0 && (
                    <div className="flex gap-2">
                      <Button onClick={copyNumbers} variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button onClick={downloadNumbers} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        TXT
                      </Button>
                      <Button onClick={downloadCSV} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Dices className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No numbers generated yet</p>
                    <p className="text-sm">Configure settings and click Generate</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Compact View */}
                    <div className="p-4 bg-muted rounded-lg max-h-[600px] overflow-y-auto">
                      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                        {results.map((result) => (
                          <div
                            key={result.index}
                            className="text-center p-2 bg-white rounded border hover:border-violet-300 transition-colors"
                          >
                            <div className="text-xs text-muted-foreground mb-1">#{result.index}</div>
                            <div className="font-bold text-violet-600">{result.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="text-sm text-muted-foreground text-center">
                      Showing all {results.length} numbers
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlusRandomNumberGenerator;

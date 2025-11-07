import { useState, useMemo } from "react";
import { Calculator, TrendingUp, DollarSign, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface YearlyBreakdown {
  year: number;
  startingBalance: number;
  contributions: number;
  interestEarned: number;
  endingBalance: number;
  totalContributions: number;
  totalInterest: number;
}

interface ScenarioResult {
  name: string;
  description: string;
  finalBalance: number;
  totalInterest: number;
  totalContributions: number;
  years: number;
}

interface CalculationResult {
  yearlyBreakdown: YearlyBreakdown[];
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
  effectiveRate: number;
  roi: number;
  inflationAdjustedBalance: number;
  realReturn: number;
}

const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState<string>("10000");
  const [contribution, setContribution] = useState<string>("500");
  const [rate, setRate] = useState<string>("8");
  const [years, setYears] = useState<string>("10");
  const [compoundingFrequency, setCompoundingFrequency] = useState<string>("12");
  const [contributionTiming, setContributionTiming] = useState<string>("end");
  const [inflationRate, setInflationRate] = useState<string>("3");

  const calculations = useMemo((): CalculationResult | null => {
    const p = parseFloat(principal);
    const c = parseFloat(contribution);
    const r = parseFloat(rate) / 100;
    const y = parseInt(years);
    const freq = parseInt(compoundingFrequency);
    const inflation = parseFloat(inflationRate) / 100;

    if (isNaN(p) || isNaN(c) || isNaN(r) || isNaN(y) || isNaN(freq) || isNaN(inflation)) {
      return null;
    }

    if (p < 0 || c < 0 || r < 0 || y <= 0 || freq <= 0) {
      return null;
    }

    const yearlyBreakdown: YearlyBreakdown[] = [];
    const ratePerPeriod = r / freq;
    const periodsPerYear = freq;

    let balance = p;
    let totalContributions = p;

    for (let year = 1; year <= y; year++) {
      const startingBalance = balance;
      let yearContributions = 0;
      let yearInterest = 0;

      for (let period = 1; period <= periodsPerYear; period++) {
        if (contributionTiming === "beginning") {
          balance += c;
          yearContributions += c;
          totalContributions += c;
        }

        const periodInterest = balance * ratePerPeriod;
        balance += periodInterest;
        yearInterest += periodInterest;

        if (contributionTiming === "end") {
          balance += c;
          yearContributions += c;
          totalContributions += c;
        }
      }

      yearlyBreakdown.push({
        year,
        startingBalance,
        contributions: yearContributions,
        interestEarned: yearInterest,
        endingBalance: balance,
        totalContributions,
        totalInterest: balance - totalContributions,
      });
    }

    const finalBalance = balance;
    const totalInterest = finalBalance - totalContributions;
    const effectiveRate = Math.pow(1 + ratePerPeriod, periodsPerYear) - 1;
    const roi = (totalInterest / totalContributions) * 100;

    // Calculate inflation-adjusted final balance
    const inflationAdjustedBalance = finalBalance / Math.pow(1 + inflation, y);
    const realReturn = ((inflationAdjustedBalance - totalContributions) / totalContributions) * 100;

    return {
      yearlyBreakdown,
      finalBalance,
      totalContributions,
      totalInterest,
      effectiveRate,
      roi,
      inflationAdjustedBalance,
      realReturn,
    };
  }, [principal, contribution, rate, years, compoundingFrequency, contributionTiming, inflationRate]);

  const scenarios = useMemo((): ScenarioResult[] => {
    if (!calculations) return [];

    const p = parseFloat(principal);
    const c = parseFloat(contribution);
    const r = parseFloat(rate) / 100;
    const y = parseInt(years);
    const freq = parseInt(compoundingFrequency);

    const calculateScenario = (
      customPrincipal: number,
      customContribution: number,
      customRate: number,
      customYears: number
    ): number => {
      const ratePerPeriod = customRate / freq;
      const periodsPerYear = freq;
      let balance = customPrincipal;

      for (let year = 1; year <= customYears; year++) {
        for (let period = 1; period <= periodsPerYear; period++) {
          if (contributionTiming === "beginning") {
            balance += customContribution;
          }
          balance += balance * ratePerPeriod;
          if (contributionTiming === "end") {
            balance += customContribution;
          }
        }
      }

      return balance;
    };

    const results: ScenarioResult[] = [];

    // Scenario 1: Double the interest rate
    const doubleRateBalance = calculateScenario(p, c, r * 2, y);
    const doubleRateTotalContributions = p + c * freq * y;
    results.push({
      name: "Double Interest Rate",
      description: `What if rate was ${(parseFloat(rate) * 2).toFixed(1)}% instead of ${rate}%?`,
      finalBalance: doubleRateBalance,
      totalInterest: doubleRateBalance - doubleRateTotalContributions,
      totalContributions: doubleRateTotalContributions,
      years: y,
    });

    // Scenario 2: Double the time
    const doubleTimeBalance = calculateScenario(p, c, r, y * 2);
    const doubleTimeTotalContributions = p + c * freq * y * 2;
    results.push({
      name: "Double Time Period",
      description: `What if you invested for ${y * 2} years instead of ${y} years?`,
      finalBalance: doubleTimeBalance,
      totalInterest: doubleTimeBalance - doubleTimeTotalContributions,
      totalContributions: doubleTimeTotalContributions,
      years: y * 2,
    });

    // Scenario 3: Double the monthly contribution
    const doubleContributionBalance = calculateScenario(p, c * 2, r, y);
    const doubleContributionTotalContributions = p + c * 2 * freq * y;
    results.push({
      name: "Double Contributions",
      description: `What if contributions were $${(c * 2).toFixed(0)} instead of $${c.toFixed(0)}?`,
      finalBalance: doubleContributionBalance,
      totalInterest: doubleContributionBalance - doubleContributionTotalContributions,
      totalContributions: doubleContributionTotalContributions,
      years: y,
    });

    // Scenario 4: No monthly contributions
    const noContributionBalance = calculateScenario(p, 0, r, y);
    results.push({
      name: "No Contributions",
      description: "What if you made no regular contributions?",
      finalBalance: noContributionBalance,
      totalInterest: noContributionBalance - p,
      totalContributions: p,
      years: y,
    });

    // Scenario 5: Half the interest rate
    const halfRateBalance = calculateScenario(p, c, r / 2, y);
    const halfRateTotalContributions = p + c * freq * y;
    results.push({
      name: "Half Interest Rate",
      description: `What if rate was ${(parseFloat(rate) / 2).toFixed(1)}% instead of ${rate}%?`,
      finalBalance: halfRateBalance,
      totalInterest: halfRateBalance - halfRateTotalContributions,
      totalContributions: halfRateTotalContributions,
      years: y,
    });

    return results;
  }, [calculations, principal, contribution, rate, years, compoundingFrequency, contributionTiming]);

  const exportToCSV = () => {
    if (!calculations) return;

    const csvContent = [
      ["Compound Interest Calculator - Yearly Breakdown"],
      [""],
      ["Year", "Starting Balance", "Contributions", "Interest Earned", "Ending Balance", "Total Contributions", "Total Interest"],
      ...calculations.yearlyBreakdown.map((row) => [
        row.year,
        row.startingBalance.toFixed(2),
        row.contributions.toFixed(2),
        row.interestEarned.toFixed(2),
        row.endingBalance.toFixed(2),
        row.totalContributions.toFixed(2),
        row.totalInterest.toFixed(2),
      ]),
      [""],
      ["Summary"],
      ["Final Balance", calculations.finalBalance.toFixed(2)],
      ["Total Contributions", calculations.totalContributions.toFixed(2)],
      ["Total Interest", calculations.totalInterest.toFixed(2)],
      ["Effective Annual Rate", `${(calculations.effectiveRate * 100).toFixed(2)}%`],
      ["Return on Investment", `${calculations.roi.toFixed(2)}%`],
      ["Inflation-Adjusted Balance", calculations.inflationAdjustedBalance.toFixed(2)],
      ["Real Return", `${calculations.realReturn.toFixed(2)}%`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compound-interest-breakdown.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-green-600 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Compound Interest Calculator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate compound interest with detailed yearly breakdown, what-if scenarios, and inflation adjustment
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Investment Parameters
            </CardTitle>
            <CardDescription>
              Enter your initial investment, contributions, and expected return
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="principal">Initial Investment ($)</Label>
                <Input
                  id="principal"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="10000"
                  min="0"
                  step="1000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contribution">Regular Contribution ($)</Label>
                <Input
                  id="contribution"
                  type="number"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  placeholder="500"
                  min="0"
                  step="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="8"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="years">Investment Period (years)</Label>
                <Input
                  id="years"
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="10"
                  min="1"
                  max="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Compounding Frequency</Label>
                <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Annually</SelectItem>
                    <SelectItem value="2">Semi-Annually</SelectItem>
                    <SelectItem value="4">Quarterly</SelectItem>
                    <SelectItem value="12">Monthly</SelectItem>
                    <SelectItem value="52">Weekly</SelectItem>
                    <SelectItem value="365">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timing">Contribution Timing</Label>
                <Select value={contributionTiming} onValueChange={setContributionTiming}>
                  <SelectTrigger id="timing">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="end">End of Period</SelectItem>
                    <SelectItem value="beginning">Beginning of Period</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inflation">Inflation Rate (%)</Label>
                <Input
                  id="inflation"
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(e.target.value)}
                  placeholder="3"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {calculations && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Final Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${calculations.finalBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-sm opacity-90 mt-1">
                    After {years} years
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Total Interest</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${calculations.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-sm opacity-90 mt-1">
                    ROI: {calculations.roi.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Total Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${calculations.totalContributions.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-sm opacity-90 mt-1">
                    Your investment
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Inflation-Adjusted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${calculations.inflationAdjustedBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-sm opacity-90 mt-1">
                    Real return: {calculations.realReturn.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                <strong>Effective Annual Rate:</strong> {(calculations.effectiveRate * 100).toFixed(2)}%
                (with {compoundingFrequency === "1" ? "annual" : compoundingFrequency === "2" ? "semi-annual" : compoundingFrequency === "4" ? "quarterly" : compoundingFrequency === "12" ? "monthly" : compoundingFrequency === "52" ? "weekly" : "daily"} compounding)
              </AlertDescription>
            </Alert>

            {/* Tabbed Content */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Detailed Analysis</CardTitle>
                  <Button onClick={exportToCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="breakdown" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="breakdown">Year by Year</TabsTrigger>
                    <TabsTrigger value="scenarios">What-If Scenarios</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>

                  <TabsContent value="breakdown" className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left font-semibold">Year</th>
                            <th className="p-3 text-right font-semibold">Starting Balance</th>
                            <th className="p-3 text-right font-semibold">Contributions</th>
                            <th className="p-3 text-right font-semibold">Interest Earned</th>
                            <th className="p-3 text-right font-semibold">Ending Balance</th>
                            <th className="p-3 text-right font-semibold">Total Interest</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculations.yearlyBreakdown.map((row) => (
                            <tr key={row.year} className="border-b hover:bg-muted/30">
                              <td className="p-3 font-medium">{row.year}</td>
                              <td className="p-3 text-right">
                                ${row.startingBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                              </td>
                              <td className="p-3 text-right text-blue-600">
                                ${row.contributions.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                              </td>
                              <td className="p-3 text-right text-green-600 font-semibold">
                                ${row.interestEarned.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                              </td>
                              <td className="p-3 text-right font-semibold">
                                ${row.endingBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                              </td>
                              <td className="p-3 text-right text-green-600">
                                ${row.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="scenarios" className="space-y-4">
                    <div className="space-y-4">
                      {scenarios.map((scenario, index) => (
                        <Card key={index} className="border-l-4 border-l-green-500">
                          <CardHeader>
                            <CardTitle className="text-lg">{scenario.name}</CardTitle>
                            <CardDescription>{scenario.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Final Balance</p>
                                <p className="text-xl font-bold text-green-600">
                                  ${scenario.finalBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Total Interest</p>
                                <p className="text-xl font-bold">
                                  ${scenario.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Total Contributions</p>
                                <p className="text-xl font-bold">
                                  ${scenario.totalContributions.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Difference</p>
                                <p className={`text-xl font-bold ${scenario.finalBalance > calculations.finalBalance ? "text-green-600" : "text-red-600"}`}>
                                  {scenario.finalBalance > calculations.finalBalance ? "+" : ""}
                                  ${(scenario.finalBalance - calculations.finalBalance).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Investment Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Initial Investment:</span>
                            <span className="font-semibold">${parseFloat(principal).toLocaleString("en-US")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Regular Contributions:</span>
                            <span className="font-semibold">
                              ${parseFloat(contribution).toLocaleString("en-US")} × {parseInt(compoundingFrequency) * parseInt(years)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground">Total Contributions:</span>
                            <span className="font-semibold text-blue-600">
                              ${calculations.totalContributions.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Interest Earned:</span>
                            <span className="font-semibold text-green-600">
                              ${calculations.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground font-semibold">Final Balance:</span>
                            <span className="font-bold text-lg">
                              ${calculations.finalBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nominal Interest Rate:</span>
                            <span className="font-semibold">{parseFloat(rate).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Effective Annual Rate:</span>
                            <span className="font-semibold">{(calculations.effectiveRate * 100).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Return on Investment:</span>
                            <span className="font-semibold text-green-600">{calculations.roi.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground">Inflation Rate:</span>
                            <span className="font-semibold">{parseFloat(inflationRate).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Inflation-Adjusted Balance:</span>
                            <span className="font-semibold">
                              ${calculations.inflationAdjustedBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Real Return:</span>
                            <span className="font-semibold text-orange-600">{calculations.realReturn.toFixed(2)}%</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Investment Timeline
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Investment Period:</span>
                              <span className="font-semibold">{years} years ({parseInt(years) * 12} months)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Compounding Frequency:</span>
                              <span className="font-semibold">
                                {compoundingFrequency === "1" ? "Annually" :
                                 compoundingFrequency === "2" ? "Semi-Annually" :
                                 compoundingFrequency === "4" ? "Quarterly" :
                                 compoundingFrequency === "12" ? "Monthly" :
                                 compoundingFrequency === "52" ? "Weekly" : "Daily"}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Total Compounding Periods:</span>
                              <span className="font-semibold">{parseInt(compoundingFrequency) * parseInt(years)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Contribution Timing:</span>
                              <span className="font-semibold">
                                {contributionTiming === "beginning" ? "Beginning of Period" : "End of Period"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default CompoundInterestCalculator;

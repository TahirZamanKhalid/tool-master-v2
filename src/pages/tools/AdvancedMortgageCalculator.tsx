import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Home, Download, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AdRow } from "@/components/AdRow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  totalInterest: number;
}

const AdvancedMortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("300000");
  const [downPayment, setDownPayment] = useState("60000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [propertyTax, setPropertyTax] = useState("3000");
  const [insurance, setInsurance] = useState("1200");
  const [hoa, setHoa] = useState("0");
  const [extraPayment, setExtraPayment] = useState("0");

  const calculations = useMemo(() => {
    const principal = parseFloat(loanAmount) - parseFloat(downPayment || "0");
    const rate = parseFloat(interestRate) / 100 / 12;
    const months = parseFloat(loanTerm) * 12;
    const extra = parseFloat(extraPayment || "0");
    const taxMonthly = parseFloat(propertyTax || "0") / 12;
    const insMonthly = parseFloat(insurance || "0") / 12;
    const hoaMonthly = parseFloat(hoa || "0");

    if (!principal || principal <= 0 || !rate || !months) {
      return null;
    }

    // Calculate base monthly payment (P&I only)
    const monthlyPI = (principal * rate * Math.pow(1 + rate, months)) /
                      (Math.pow(1 + rate, months) - 1);

    // Generate amortization schedule
    const schedule: AmortizationRow[] = [];
    let remainingBalance = principal;
    let totalInterestPaid = 0;
    let month = 1;

    while (remainingBalance > 0 && month <= months) {
      const interestPayment = remainingBalance * rate;
      let principalPayment = monthlyPI - interestPayment + extra;

      // Adjust for final payment
      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
      }

      remainingBalance -= principalPayment;
      totalInterestPaid += interestPayment;

      schedule.push({
        month,
        payment: monthlyPI + extra,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance),
        totalInterest: totalInterestPaid
      });

      month++;
    }

    const totalMonthlyPayment = monthlyPI + taxMonthly + insMonthly + hoaMonthly + extra;
    const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);
    const actualTerm = schedule.length / 12;
    const totalInterest = totalInterestPaid;
    const totalTaxes = taxMonthly * schedule.length;
    const totalInsurance = insMonthly * schedule.length;
    const totalHoa = hoaMonthly * schedule.length;

    return {
      monthlyPI,
      monthlyPayment: totalMonthlyPayment,
      principal,
      totalPaid,
      totalInterest,
      actualTerm,
      schedule,
      breakdown: {
        principalAndInterest: monthlyPI,
        propertyTax: taxMonthly,
        insurance: insMonthly,
        hoa: hoaMonthly,
        extraPayment: extra
      },
      lifetime: {
        totalPaid: totalPaid + totalTaxes + totalInsurance + totalHoa,
        totalPrincipal: principal,
        totalInterest,
        totalTaxes,
        totalInsurance,
        totalHoa
      }
    };
  }, [loanAmount, downPayment, interestRate, loanTerm, propertyTax, insurance, hoa, extraPayment]);

  const downloadSchedule = () => {
    if (!calculations) return;

    let csv = "Month,Payment,Principal,Interest,Remaining Balance,Total Interest Paid\n";
    calculations.schedule.forEach(row => {
      csv += `${row.month},${row.payment.toFixed(2)},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.balance.toFixed(2)},${row.totalInterest.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "amortization_schedule.csv";
    link.click();
    toast.success("Schedule downloaded!");
  };

  return (
    <ToolLayout
      title="Advanced Mortgage Calculator"
      description="Complete mortgage calculator with amortization schedule, charts, and detailed analysis"
      category="Calculators"
      instructions={[
        "Enter your home price and down payment",
        "Input interest rate and loan term",
        "Add property tax, insurance, and HOA fees",
        "Use extra payment to see how much you can save",
        "View detailed amortization schedule",
        "Export schedule to CSV for your records"
      ]}
      relatedTools={[
        { name: "Loan Calculator", path: "/tools/loan-calculator" },
        { name: "Savings Calculator", path: "/tools/savings-calculator" },
        { name: "ROI Calculator", path: "/tools/roi-calculator" }
      ]}
    >
      <AdRow className="mb-6" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Inputs */}
        <Card className="p-6 space-y-4 lg:col-span-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Loan Details
          </h3>

          <div>
            <Label htmlFor="loanAmount">Home Price ($)</Label>
            <Input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="300000"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="downPayment">Down Payment ($)</Label>
            <Input
              id="downPayment"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="60000"
              className="mt-2"
            />
            {loanAmount && downPayment && (
              <p className="text-xs text-muted-foreground mt-1">
                {((parseFloat(downPayment) / parseFloat(loanAmount)) * 100).toFixed(1)}% down
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="interestRate">Interest Rate (% per year)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="6.5"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="loanTerm">Loan Term (years)</Label>
            <Input
              id="loanTerm"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              placeholder="30"
              className="mt-2"
            />
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Additional Costs (Annual)</h4>

            <div className="space-y-3">
              <div>
                <Label htmlFor="propertyTax">Property Tax ($)</Label>
                <Input
                  id="propertyTax"
                  type="number"
                  value={propertyTax}
                  onChange={(e) => setPropertyTax(e.target.value)}
                  placeholder="3000"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="insurance">Home Insurance ($)</Label>
                <Input
                  id="insurance"
                  type="number"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  placeholder="1200"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="hoa">HOA Fees ($/month)</Label>
                <Input
                  id="hoa"
                  type="number"
                  value={hoa}
                  onChange={(e) => setHoa(e.target.value)}
                  placeholder="0"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="extraPayment">Extra Monthly Payment ($)</Label>
                <Input
                  id="extraPayment"
                  type="number"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(e.target.value)}
                  placeholder="0"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pay extra to save on interest and pay off faster
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column - Results */}
        <div className="space-y-6 lg:col-span-2">
          {calculations ? (
            <>
              {/* Summary Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                      <p className="text-3xl font-bold">
                        ${calculations.monthlyPayment.toLocaleString('en-US', {maximumFractionDigits: 0})}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        P&I: ${calculations.monthlyPI.toLocaleString('en-US', {maximumFractionDigits: 0})}
                      </p>
                    </div>
                    <Home className="h-8 w-8 text-primary opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                      <p className="text-3xl font-bold text-orange-600">
                        ${calculations.totalInterest.toLocaleString('en-US', {maximumFractionDigits: 0})}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Over {calculations.actualTerm.toFixed(1)} years
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600 opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
                      <p className="text-2xl font-bold">
                        ${calculations.principal.toLocaleString('en-US', {maximumFractionDigits: 0})}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                      <p className="text-2xl font-bold">
                        ${calculations.lifetime.totalPaid.toLocaleString('en-US', {maximumFractionDigits: 0})}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600 opacity-50" />
                  </div>
                </Card>
              </div>

              {/* Detailed Tabs */}
              <Card className="p-6">
                <Tabs defaultValue="breakdown" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="lifetime">Lifetime Costs</TabsTrigger>
                  </TabsList>

                  <TabsContent value="breakdown" className="space-y-4 mt-4">
                    <h4 className="font-semibold">Monthly Payment Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-muted rounded">
                        <span>Principal & Interest:</span>
                        <span className="font-semibold">
                          ${calculations.breakdown.principalAndInterest.toFixed(2)}
                        </span>
                      </div>
                      {calculations.breakdown.propertyTax > 0 && (
                        <div className="flex justify-between p-3 bg-muted rounded">
                          <span>Property Tax:</span>
                          <span className="font-semibold">
                            ${calculations.breakdown.propertyTax.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {calculations.breakdown.insurance > 0 && (
                        <div className="flex justify-between p-3 bg-muted rounded">
                          <span>Home Insurance:</span>
                          <span className="font-semibold">
                            ${calculations.breakdown.insurance.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {calculations.breakdown.hoa > 0 && (
                        <div className="flex justify-between p-3 bg-muted rounded">
                          <span>HOA Fees:</span>
                          <span className="font-semibold">
                            ${calculations.breakdown.hoa.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {calculations.breakdown.extraPayment > 0 && (
                        <div className="flex justify-between p-3 bg-green-50 border border-green-200 rounded">
                          <span className="text-green-700">Extra Payment:</span>
                          <span className="font-semibold text-green-700">
                            ${calculations.breakdown.extraPayment.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between p-3 bg-primary/10 rounded border-2 border-primary/20">
                        <span className="font-bold">Total Monthly:</span>
                        <span className="font-bold text-lg">
                          ${calculations.monthlyPayment.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {parseFloat(extraPayment) > 0 && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                        <h5 className="font-semibold text-green-800 mb-2">
                          💰 Savings with Extra Payment
                        </h5>
                        <p className="text-sm text-green-700">
                          By paying an extra ${extraPayment}/month, you'll pay off your loan{' '}
                          <strong>{(parseFloat(loanTerm) - calculations.actualTerm).toFixed(1)} years earlier</strong>{' '}
                          and save approximately{' '}
                          <strong>
                            ${((parseFloat(loanTerm) * 12 - calculations.schedule.length) *
                              calculations.monthlyPI -
                              (calculations.totalPaid - calculations.principal)).toLocaleString('en-US', {maximumFractionDigits: 0})}
                          </strong>{' '}
                          in interest!
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="schedule" className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Amortization Schedule</h4>
                      <Button onClick={downloadSchedule} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                    <div className="max-h-96 overflow-y-auto border rounded">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted">
                          <tr>
                            <th className="p-2 text-left">Month</th>
                            <th className="p-2 text-right">Payment</th>
                            <th className="p-2 text-right">Principal</th>
                            <th className="p-2 text-right">Interest</th>
                            <th className="p-2 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculations.schedule.map((row, index) => (
                            <tr key={index} className={index % 12 === 0 ? 'bg-muted/30' : ''}>
                              <td className="p-2">{row.month}</td>
                              <td className="p-2 text-right">${row.payment.toFixed(2)}</td>
                              <td className="p-2 text-right text-green-600">${row.principal.toFixed(2)}</td>
                              <td className="p-2 text-right text-orange-600">${row.interest.toFixed(2)}</td>
                              <td className="p-2 text-right font-medium">${row.balance.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="lifetime" className="space-y-4 mt-4">
                    <h4 className="font-semibold">Lifetime Cost Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-muted rounded">
                        <span>Total Principal (Loan Amount):</span>
                        <span className="font-semibold">
                          ${calculations.lifetime.totalPrincipal.toLocaleString('en-US', {maximumFractionDigits: 0})}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-orange-50 rounded">
                        <span>Total Interest Paid:</span>
                        <span className="font-semibold text-orange-600">
                          ${calculations.lifetime.totalInterest.toLocaleString('en-US', {maximumFractionDigits: 0})}
                        </span>
                      </div>
                      {calculations.lifetime.totalTaxes > 0 && (
                        <div className="flex justify-between p-3 bg-muted rounded">
                          <span>Total Property Taxes:</span>
                          <span className="font-semibold">
                            ${calculations.lifetime.totalTaxes.toLocaleString('en-US', {maximumFractionDigits: 0})}
                          </span>
                        </div>
                      )}
                      {calculations.lifetime.totalInsurance > 0 && (
                        <div className="flex justify-between p-3 bg-muted rounded">
                          <span>Total Insurance:</span>
                          <span className="font-semibold">
                            ${calculations.lifetime.totalInsurance.toLocaleString('en-US', {maximumFractionDigits: 0})}
                          </span>
                        </div>
                      )}
                      {calculations.lifetime.totalHoa > 0 && (
                        <div className="flex justify-between p-3 bg-muted rounded">
                          <span>Total HOA Fees:</span>
                          <span className="font-semibold">
                            ${calculations.lifetime.totalHoa.toLocaleString('en-US', {maximumFractionDigits: 0})}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between p-4 bg-primary/10 rounded border-2 border-primary/20">
                        <span className="font-bold text-lg">Total Cost of Home:</span>
                        <span className="font-bold text-2xl">
                          ${calculations.lifetime.totalPaid.toLocaleString('en-US', {maximumFractionDigits: 0})}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                      <h5 className="font-semibold text-blue-800 mb-2">📊 Cost Breakdown</h5>
                      <div className="space-y-1 text-sm text-blue-700">
                        <p>• Loan Amount: {((calculations.lifetime.totalPrincipal / calculations.lifetime.totalPaid) * 100).toFixed(1)}%</p>
                        <p>• Interest: {((calculations.lifetime.totalInterest / calculations.lifetime.totalPaid) * 100).toFixed(1)}%</p>
                        {calculations.lifetime.totalTaxes > 0 && (
                          <p>• Taxes: {((calculations.lifetime.totalTaxes / calculations.lifetime.totalPaid) * 100).toFixed(1)}%</p>
                        )}
                        {calculations.lifetime.totalInsurance > 0 && (
                          <p>• Insurance: {((calculations.lifetime.totalInsurance / calculations.lifetime.totalPaid) * 100).toFixed(1)}%</p>
                        )}
                        {calculations.lifetime.totalHoa > 0 && (
                          <p>• HOA: {((calculations.lifetime.totalHoa / calculations.lifetime.totalPaid) * 100).toFixed(1)}%</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Enter loan details to calculate your mortgage</p>
                <p className="text-sm mt-2">All fields on the left are required</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <AdRow className="mt-6" />
    </ToolLayout>
  );
};

export default AdvancedMortgageCalculator;

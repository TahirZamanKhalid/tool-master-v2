import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Percent, Calendar } from "lucide-react";

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState<string>("10000");
  const [interestRate, setInterestRate] = useState<string>("5");
  const [loanTerm, setLoanTerm] = useState<string>("12");
  const [termUnit, setTermUnit] = useState<"months" | "years">("months");

  const principal = parseFloat(loanAmount) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = parseFloat(loanTerm) || 0;

  // Convert to months if years
  const months = termUnit === "years" ? term * 12 : term;

  // Calculate monthly payment using loan formula
  const monthlyRate = rate / 100 / 12;
  const monthlyPayment = months > 0 && monthlyRate > 0
    ? principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : principal / months;

  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;

  // Amortization schedule (first 12 months)
  const schedule = [];
  let balance = principal;
  for (let i = 1; i <= Math.min(12, months); i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;

    schedule.push({
      month: i,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance)
    });
  }

  return (
    <ToolLayout
      title="Loan Calculator"
      description="Calculate monthly loan payments, total interest, and amortization schedule. Perfect for personal loans, auto loans, and any installment loans. Free loan payment calculator."
      category="Calculators"
      instructions={[
        "Enter the loan amount",
        "Input annual interest rate",
        "Select loan term (months or years)",
        "View monthly payment, total interest, and payment schedule"
      ]}
      relatedTools={[
        { name: "Mortgage Calculator", path: "/tools/mortgage-calculator" },
        { name: "Investment Calculator", path: "/tools/investment-calculator" },
        { name: "Salary Calculator", path: "/tools/salary-calculator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Loan Amount */}
            <div>
              <Label htmlFor="loan-amount">Loan Amount</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="loan-amount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="10000"
                  className="pl-10"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
              <div className="relative mt-2">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="interest-rate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="5"
                  className="pl-10"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            {/* Loan Term */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loan-term">Loan Term</Label>
                <div className="relative mt-2">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="loan-term"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    placeholder="12"
                    className="pl-10"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label>Term Unit</Label>
                <Select value={termUnit} onValueChange={(value: "months" | "years") => setTermUnit(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {principal > 0 && months > 0 && (
          <>
            <Card className="border-primary/20">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div>
                      <span className="text-sm font-medium block">Monthly Payment</span>
                      <span className="text-xs text-muted-foreground">
                        for {months} months
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-green-600">
                      ${isFinite(monthlyPayment) ? monthlyPayment.toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <span className="text-xs font-medium block text-muted-foreground">Total Payment</span>
                      <span className="text-xl font-bold">${isFinite(totalPayment) ? totalPayment.toFixed(2) : '0.00'}</span>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <span className="text-xs font-medium block text-muted-foreground">Total Interest</span>
                      <span className="text-xl font-bold text-red-600">${isFinite(totalInterest) ? totalInterest.toFixed(2) : '0.00'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <h4 className="font-semibold text-sm mb-2">Loan Details</h4>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>• Loan Amount: ${principal.toFixed(2)}</p>
                      <p>• Interest Rate: {rate}% per year</p>
                      <p>• Loan Term: {months} months ({(months / 12).toFixed(1)} years)</p>
                      <p>• Total Interest Paid: ${isFinite(totalInterest) ? totalInterest.toFixed(2) : '0.00'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amortization Schedule */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Amortization Schedule
                  <span className="text-sm text-muted-foreground font-normal ml-2">
                    (First {Math.min(12, months)} months)
                  </span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Month</th>
                        <th className="text-right p-2">Payment</th>
                        <th className="text-right p-2">Principal</th>
                        <th className="text-right p-2">Interest</th>
                        <th className="text-right p-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((row) => (
                        <tr key={row.month} className="border-b hover:bg-muted/30">
                          <td className="p-2">{row.month}</td>
                          <td className="text-right p-2">${row.payment.toFixed(2)}</td>
                          <td className="text-right p-2 text-green-600">${row.principal.toFixed(2)}</td>
                          <td className="text-right p-2 text-red-600">${row.interest.toFixed(2)}</td>
                          <td className="text-right p-2 font-medium">${row.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {months > 12 && (
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Showing first 12 months of {months} total months
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ToolLayout>
  );
};

export default LoanCalculator;

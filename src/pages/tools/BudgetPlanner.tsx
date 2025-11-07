import { useState, useMemo } from "react";
import { Plus, Trash2, PiggyBank, TrendingUp, TrendingDown, DollarSign, Download, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: "monthly" | "yearly" | "weekly" | "daily";
}

interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  items: BudgetItem[];
}

const BudgetPlanner = () => {
  const [incomes, setIncomes] = useState<BudgetItem[]>([]);
  const [expenses, setExpenses] = useState<BudgetItem[]>([]);
  const [newIncomeName, setNewIncomeName] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [newIncomeFrequency, setNewIncomeFrequency] = useState<"monthly" | "yearly" | "weekly" | "daily">("monthly");
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("housing");
  const [newExpenseFrequency, setNewExpenseFrequency] = useState<"monthly" | "yearly" | "weekly" | "daily">("monthly");
  const [savingsGoal, setSavingsGoal] = useState<string>("20");

  const expenseCategories = [
    { value: "housing", label: "Housing", icon: "🏠" },
    { value: "transportation", label: "Transportation", icon: "🚗" },
    { value: "food", label: "Food & Dining", icon: "🍔" },
    { value: "utilities", label: "Utilities", icon: "💡" },
    { value: "healthcare", label: "Healthcare", icon: "🏥" },
    { value: "insurance", label: "Insurance", icon: "🛡️" },
    { value: "debt", label: "Debt Payments", icon: "💳" },
    { value: "entertainment", label: "Entertainment", icon: "🎬" },
    { value: "shopping", label: "Shopping", icon: "🛍️" },
    { value: "education", label: "Education", icon: "📚" },
    { value: "savings", label: "Savings & Investments", icon: "💰" },
    { value: "personal", label: "Personal Care", icon: "💅" },
    { value: "subscriptions", label: "Subscriptions", icon: "📱" },
    { value: "gifts", label: "Gifts & Donations", icon: "🎁" },
    { value: "other", label: "Other", icon: "📦" },
  ];

  const convertToMonthly = (amount: number, frequency: "monthly" | "yearly" | "weekly" | "daily"): number => {
    switch (frequency) {
      case "yearly":
        return amount / 12;
      case "weekly":
        return (amount * 52) / 12;
      case "daily":
        return (amount * 365) / 12;
      default:
        return amount;
    }
  };

  const calculations = useMemo(() => {
    const monthlyIncome = incomes.reduce((sum, income) =>
      sum + convertToMonthly(income.amount, income.frequency), 0
    );

    const monthlyExpenses = expenses.reduce((sum, expense) =>
      sum + convertToMonthly(expense.amount, expense.frequency), 0
    );

    const monthlyNet = monthlyIncome - monthlyExpenses;
    const yearlyIncome = monthlyIncome * 12;
    const yearlyExpenses = monthlyExpenses * 12;
    const yearlyNet = monthlyNet * 12;

    // Calculate category summaries
    const categoryTotals = new Map<string, { total: number; items: BudgetItem[] }>();

    expenses.forEach(expense => {
      const monthlyAmount = convertToMonthly(expense.amount, expense.frequency);
      const existing = categoryTotals.get(expense.category);

      if (existing) {
        existing.total += monthlyAmount;
        existing.items.push(expense);
      } else {
        categoryTotals.set(expense.category, {
          total: monthlyAmount,
          items: [expense],
        });
      }
    });

    const categorySummaries: CategorySummary[] = Array.from(categoryTotals.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        percentage: monthlyExpenses > 0 ? (data.total / monthlyExpenses) * 100 : 0,
        items: data.items,
      }))
      .sort((a, b) => b.total - a.total);

    // Recommended savings (20% of income)
    const recommendedSavings = monthlyIncome * (parseFloat(savingsGoal) / 100);
    const actualSavings = monthlyNet;
    const savingsRate = monthlyIncome > 0 ? (actualSavings / monthlyIncome) * 100 : 0;

    // 50/30/20 rule check
    const needs = expenses
      .filter(e => ["housing", "utilities", "food", "healthcare", "transportation", "insurance", "debt"].includes(e.category))
      .reduce((sum, e) => sum + convertToMonthly(e.amount, e.frequency), 0);

    const wants = expenses
      .filter(e => ["entertainment", "shopping", "subscriptions", "personal", "gifts"].includes(e.category))
      .reduce((sum, e) => sum + convertToMonthly(e.amount, e.frequency), 0);

    const savings = expenses
      .filter(e => e.category === "savings")
      .reduce((sum, e) => sum + convertToMonthly(e.amount, e.frequency), 0);

    const needsPercentage = monthlyIncome > 0 ? (needs / monthlyIncome) * 100 : 0;
    const wantsPercentage = monthlyIncome > 0 ? (wants / monthlyIncome) * 100 : 0;
    const savingsPercentage = monthlyIncome > 0 ? ((savings + monthlyNet) / monthlyIncome) * 100 : 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyNet,
      yearlyIncome,
      yearlyExpenses,
      yearlyNet,
      categorySummaries,
      recommendedSavings,
      actualSavings,
      savingsRate,
      rule503020: {
        needs,
        wants,
        savings: savings + monthlyNet,
        needsPercentage,
        wantsPercentage,
        savingsPercentage,
      },
    };
  }, [incomes, expenses, savingsGoal]);

  const addIncome = () => {
    if (newIncomeName && newIncomeAmount) {
      const newIncome: BudgetItem = {
        id: Date.now().toString(),
        name: newIncomeName,
        amount: parseFloat(newIncomeAmount),
        category: "income",
        frequency: newIncomeFrequency,
      };
      setIncomes([...incomes, newIncome]);
      setNewIncomeName("");
      setNewIncomeAmount("");
    }
  };

  const addExpense = () => {
    if (newExpenseName && newExpenseAmount) {
      const newExpense: BudgetItem = {
        id: Date.now().toString(),
        name: newExpenseName,
        amount: parseFloat(newExpenseAmount),
        category: newExpenseCategory,
        frequency: newExpenseFrequency,
      };
      setExpenses([...expenses, newExpense]);
      setNewExpenseName("");
      setNewExpenseAmount("");
    }
  };

  const removeIncome = (id: string) => {
    setIncomes(incomes.filter(income => income.id !== id));
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Budget Planner Report"],
      [""],
      ["INCOME"],
      ["Name", "Amount", "Frequency", "Monthly Amount"],
      ...incomes.map(income => [
        income.name,
        income.amount.toFixed(2),
        income.frequency,
        convertToMonthly(income.amount, income.frequency).toFixed(2),
      ]),
      ["Total Monthly Income", "", "", calculations.monthlyIncome.toFixed(2)],
      [""],
      ["EXPENSES"],
      ["Name", "Category", "Amount", "Frequency", "Monthly Amount"],
      ...expenses.map(expense => [
        expense.name,
        expenseCategories.find(c => c.value === expense.category)?.label || expense.category,
        expense.amount.toFixed(2),
        expense.frequency,
        convertToMonthly(expense.amount, expense.frequency).toFixed(2),
      ]),
      ["Total Monthly Expenses", "", "", "", calculations.monthlyExpenses.toFixed(2)],
      [""],
      ["SUMMARY"],
      ["Monthly Income", calculations.monthlyIncome.toFixed(2)],
      ["Monthly Expenses", calculations.monthlyExpenses.toFixed(2)],
      ["Monthly Net", calculations.monthlyNet.toFixed(2)],
      ["Savings Rate", `${calculations.savingsRate.toFixed(1)}%`],
      [""],
      ["CATEGORY BREAKDOWN"],
      ["Category", "Monthly Total", "Percentage"],
      ...calculations.categorySummaries.map(cat => [
        expenseCategories.find(c => c.value === cat.category)?.label || cat.category,
        cat.total.toFixed(2),
        `${cat.percentage.toFixed(1)}%`,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "budget-planner.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (categoryValue: string) => {
    return expenseCategories.find(c => c.value === categoryValue)?.icon || "📦";
  };

  const getCategoryLabel = (categoryValue: string) => {
    return expenseCategories.find(c => c.value === categoryValue)?.label || categoryValue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <PiggyBank className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Budget Planner
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your income and expenses, analyze spending by category, and reach your savings goals
          </p>
        </div>

        {/* Summary Cards */}
        {(incomes.length > 0 || expenses.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">Monthly Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${calculations.monthlyIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-sm opacity-90 mt-1">
                  ${calculations.yearlyIncome.toLocaleString("en-US", { maximumFractionDigits: 0 })}/year
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${calculations.monthlyExpenses.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-sm opacity-90 mt-1">
                  ${calculations.yearlyExpenses.toLocaleString("en-US", { maximumFractionDigits: 0 })}/year
                </p>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${calculations.monthlyNet >= 0 ? "from-blue-500 to-cyan-600" : "from-orange-500 to-red-600"} text-white`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">Monthly Net</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${Math.abs(calculations.monthlyNet).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-sm opacity-90 mt-1">
                  {calculations.monthlyNet >= 0 ? "Surplus" : "Deficit"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">Savings Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {calculations.savingsRate.toFixed(1)}%
                </div>
                <p className="text-sm opacity-90 mt-1">
                  Goal: {savingsGoal}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Budget Manager
              </CardTitle>
              {(incomes.length > 0 || expenses.length > 0) && (
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="income" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
              </TabsList>

              {/* Income Tab */}
              <TabsContent value="income" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add Income Source</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Income name (e.g., Salary)"
                      value={newIncomeName}
                      onChange={(e) => setNewIncomeName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addIncome()}
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={newIncomeAmount}
                      onChange={(e) => setNewIncomeAmount(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addIncome()}
                      min="0"
                      step="0.01"
                    />
                    <Select value={newIncomeFrequency} onValueChange={(v: any) => setNewIncomeFrequency(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addIncome} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Income
                    </Button>
                  </div>
                </div>

                {incomes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Income Sources</h3>
                    <div className="space-y-2">
                      {incomes.map((income) => (
                        <Card key={income.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">💵</span>
                                  <div>
                                    <h4 className="font-semibold">{income.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      ${income.amount.toLocaleString()} / {income.frequency}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">Monthly</div>
                                  <div className="text-lg font-bold text-green-600">
                                    ${convertToMonthly(income.amount, income.frequency).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeIncome(income.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Expenses Tab */}
              <TabsContent value="expenses" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add Expense</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Input
                      placeholder="Expense name"
                      value={newExpenseName}
                      onChange={(e) => setNewExpenseName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addExpense()}
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addExpense()}
                      min="0"
                      step="0.01"
                    />
                    <Select value={newExpenseCategory} onValueChange={setNewExpenseCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={newExpenseFrequency} onValueChange={(v: any) => setNewExpenseFrequency(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addExpense} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                </div>

                {expenses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Expenses</h3>
                    <div className="space-y-2">
                      {expenses.map((expense) => (
                        <Card key={expense.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                                  <div>
                                    <h4 className="font-semibold">{expense.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {getCategoryLabel(expense.category)} • ${expense.amount.toLocaleString()} / {expense.frequency}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">Monthly</div>
                                  <div className="text-lg font-bold text-red-600">
                                    ${convertToMonthly(expense.amount, expense.frequency).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeExpense(expense.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                {expenses.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Spending by Category</h3>
                      <div className="space-y-3">
                        {calculations.categorySummaries.map((category) => (
                          <Card key={category.category}>
                            <CardContent className="pt-6">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{getCategoryIcon(category.category)}</span>
                                    <span className="font-semibold">{getCategoryLabel(category.category)}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-lg">
                                      ${category.total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {category.percentage.toFixed(1)}% of expenses
                                    </div>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className="bg-blue-600 h-3 rounded-full transition-all"
                                    style={{ width: `${category.percentage}%` }}
                                  />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {category.items.length} item{category.items.length !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">50/30/20 Rule Analysis</h3>
                      <Alert>
                        <DollarSign className="h-4 w-4" />
                        <AlertDescription>
                          The 50/30/20 rule suggests spending 50% on needs, 30% on wants, and saving 20% of your income.
                        </AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className={calculations.rule503020.needsPercentage <= 50 ? "border-green-500" : "border-red-500"}>
                          <CardHeader>
                            <CardTitle className="text-lg">Needs (50%)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {calculations.rule503020.needsPercentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${calculations.rule503020.needs.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                            <div className={`text-sm mt-2 ${calculations.rule503020.needsPercentage <= 50 ? "text-green-600" : "text-red-600"}`}>
                              {calculations.rule503020.needsPercentage <= 50 ? "✓ On track" : "⚠ Over budget"}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className={calculations.rule503020.wantsPercentage <= 30 ? "border-green-500" : "border-orange-500"}>
                          <CardHeader>
                            <CardTitle className="text-lg">Wants (30%)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {calculations.rule503020.wantsPercentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${calculations.rule503020.wants.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                            <div className={`text-sm mt-2 ${calculations.rule503020.wantsPercentage <= 30 ? "text-green-600" : "text-orange-600"}`}>
                              {calculations.rule503020.wantsPercentage <= 30 ? "✓ On track" : "⚠ Over budget"}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className={calculations.rule503020.savingsPercentage >= 20 ? "border-green-500" : "border-red-500"}>
                          <CardHeader>
                            <CardTitle className="text-lg">Savings (20%)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {calculations.rule503020.savingsPercentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${calculations.rule503020.savings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                            <div className={`text-sm mt-2 ${calculations.rule503020.savingsPercentage >= 20 ? "text-green-600" : "text-red-600"}`}>
                              {calculations.rule503020.savingsPercentage >= 20 ? "✓ On track" : "⚠ Below goal"}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </>
                ) : (
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Add expenses to see detailed analysis and category breakdowns.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Savings Goal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="savingsGoal">Target Savings Rate (%)</Label>
                      <Input
                        id="savingsGoal"
                        type="number"
                        value={savingsGoal}
                        onChange={(e) => setSavingsGoal(e.target.value)}
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                  </div>
                </div>

                {incomes.length > 0 && (
                  <div className="space-y-4">
                    <Card className={calculations.savingsRate >= parseFloat(savingsGoal) ? "border-green-500" : "border-orange-500"}>
                      <CardHeader>
                        <CardTitle>Savings Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current: {calculations.savingsRate.toFixed(1)}%</span>
                            <span>Goal: {savingsGoal}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className={`h-4 rounded-full transition-all ${
                                calculations.savingsRate >= parseFloat(savingsGoal) ? "bg-green-500" : "bg-orange-500"
                              }`}
                              style={{ width: `${Math.min((calculations.savingsRate / parseFloat(savingsGoal)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Current Monthly Savings</div>
                            <div className="text-2xl font-bold">
                              ${calculations.actualSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Target Monthly Savings</div>
                            <div className="text-2xl font-bold">
                              ${calculations.recommendedSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        </div>

                        {calculations.actualSavings < calculations.recommendedSavings && (
                          <Alert>
                            <TrendingDown className="h-4 w-4" />
                            <AlertDescription>
                              You need to save an additional{" "}
                              <strong>
                                ${(calculations.recommendedSavings - calculations.actualSavings).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                              </strong>{" "}
                              per month to reach your {savingsGoal}% goal.
                            </AlertDescription>
                          </Alert>
                        )}

                        {calculations.actualSavings >= calculations.recommendedSavings && (
                          <Alert className="border-green-500">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-600">
                              Congratulations! You're exceeding your savings goal by{" "}
                              <strong>
                                ${(calculations.actualSavings - calculations.recommendedSavings).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                              </strong>{" "}
                              per month.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Yearly Projections</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Current Yearly Savings</div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${(calculations.actualSavings * 12).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Target Yearly Savings</div>
                            <div className="text-2xl font-bold text-green-600">
                              ${(calculations.recommendedSavings * 12).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">In 5 Years (Current Rate)</div>
                            <div className="text-xl font-bold">
                              ${(calculations.actualSavings * 60).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">In 5 Years (Target Rate)</div>
                            <div className="text-xl font-bold">
                              ${(calculations.recommendedSavings * 60).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetPlanner;

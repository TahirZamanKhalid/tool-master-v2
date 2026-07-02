import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Target, TrendingUp, Calendar, DollarSign, Plus, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSavings: number;
  monthlyContribution: number;
  interestRate: number;
  targetDate?: string;
}

interface GoalCalculation {
  goal: SavingsGoal;
  monthsToGoal: number;
  totalContributions: number;
  totalInterest: number;
  finalAmount: number;
  progressPercentage: number;
  requiredMonthlyPayment: number;
  projectedCompletionDate: Date;
  onTrack: boolean;
  isReachable: boolean;
}

const SavingsGoalCalculator = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalCurrent, setNewGoalCurrent] = useState("");
  const [newGoalMonthly, setNewGoalMonthly] = useState("");
  const [newGoalRate, setNewGoalRate] = useState("2");
  const [newGoalDate, setNewGoalDate] = useState("");

  const getTodayInputValue = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const calculateGoal = (goal: SavingsGoal): GoalCalculation => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentSavings);
    const monthlyRate = goal.interestRate / 100 / 12;

    let months = 0;
    let balance = goal.currentSavings;
    const contributions = goal.monthlyContribution;
    let isReachable = true;

    if (remaining === 0) {
      return {
        goal,
        monthsToGoal: 0,
        totalContributions: 0,
        totalInterest: 0,
        finalAmount: goal.currentSavings,
        progressPercentage: 100,
        requiredMonthlyPayment: 0,
        projectedCompletionDate: new Date(),
        onTrack: true,
        isReachable: true,
      };
    }

    if (contributions <= 0) {
      // No contributions, only compound interest
      if (monthlyRate > 0 && goal.currentSavings > 0) {
        months = Math.log(goal.targetAmount / goal.currentSavings) / Math.log(1 + monthlyRate);
      } else {
        isReachable = false;
      }
    } else {
      // With monthly contributions and compound interest
      if (monthlyRate > 0) {
        // Formula: FV = PV(1+r)^n + PMT * [((1+r)^n - 1) / r]
        // Solve for n (months)
        const pv = goal.currentSavings;
        const fv = goal.targetAmount;
        const pmt = contributions;
        const r = monthlyRate;

        // Iterative approach
        while (balance < goal.targetAmount && months < 1200) {
          balance = balance * (1 + monthlyRate) + contributions;
          months++;
        }
        if (balance < goal.targetAmount) isReachable = false;
      } else {
        // No interest, simple addition
        months = remaining / contributions;
      }
    }

    const roundedMonths = isReachable ? Math.ceil(months) : 0;
    const totalContributions = isReachable ? contributions * roundedMonths : 0;
    const totalInterest = isReachable ? Math.max(0, goal.targetAmount - goal.currentSavings - totalContributions) : 0;
    const progressPercentage = Math.min(100, (goal.currentSavings / goal.targetAmount) * 100);

    // Calculate required monthly payment if target date is set
    let requiredMonthlyPayment = contributions;
    if (goal.targetDate) {
      const targetDate = new Date(`${goal.targetDate}T00:00:00`);
      const today = new Date();
      const monthsToTarget = (targetDate.getFullYear() - today.getFullYear()) * 12 +
                             (targetDate.getMonth() - today.getMonth());

      if (monthsToTarget > 0 && monthlyRate > 0) {
        // PMT = (FV - PV(1+r)^n) / [((1+r)^n - 1) / r]
        const pvFuture = goal.currentSavings * Math.pow(1 + monthlyRate, monthsToTarget);
        const factor = (Math.pow(1 + monthlyRate, monthsToTarget) - 1) / monthlyRate;
        requiredMonthlyPayment = (goal.targetAmount - pvFuture) / factor;
      } else if (monthsToTarget > 0) {
        requiredMonthlyPayment = remaining / monthsToTarget;
      }
    }

    const projectedCompletionDate = new Date();
    if (isReachable) {
      projectedCompletionDate.setMonth(projectedCompletionDate.getMonth() + roundedMonths);
    }

    const onTrack = goal.targetDate
      ? isReachable && new Date(`${goal.targetDate}T00:00:00`) >= projectedCompletionDate
      : true;

    return {
      goal,
      monthsToGoal: roundedMonths,
      totalContributions,
      totalInterest,
      finalAmount: isReachable ? goal.targetAmount : goal.currentSavings,
      progressPercentage,
      requiredMonthlyPayment: Math.max(0, requiredMonthlyPayment),
      projectedCompletionDate,
      onTrack,
      isReachable,
    };
  };

  const calculations = useMemo<GoalCalculation[]>(() => {
    return goals.map(goal => calculateGoal(goal)).sort((a, b) => {
      const aMonths = a.isReachable ? a.monthsToGoal : Number.POSITIVE_INFINITY;
      const bMonths = b.isReachable ? b.monthsToGoal : Number.POSITIVE_INFINITY;
      return aMonths - bMonths;
    });
  }, [goals]);

  const addGoal = () => {
    const targetAmount = Math.max(0, parseFloat(newGoalTarget) || 0);
    const currentSavings = Math.max(0, parseFloat(newGoalCurrent) || 0);
    const monthlyContribution = Math.max(0, parseFloat(newGoalMonthly) || 0);
    const interestRate = Math.max(0, parseFloat(newGoalRate) || 0);

    if (!newGoalName.trim() || targetAmount <= 0) {
      toast.error("Enter a goal name and a target amount greater than zero");
      return;
    }

    if (currentSavings < targetAmount && monthlyContribution <= 0 && (interestRate <= 0 || currentSavings <= 0)) {
      toast.error("Add a monthly contribution or current savings with interest so the goal can be reached");
      return;
    }

    if (newGoalName && newGoalTarget) {
      const newGoal: SavingsGoal = {
        id: Date.now().toString(),
        name: newGoalName.trim(),
        targetAmount,
        currentSavings,
        monthlyContribution,
        interestRate,
        targetDate: newGoalDate || undefined,
      };
      setGoals([...goals, newGoal]);
      setNewGoalName("");
      setNewGoalTarget("");
      setNewGoalCurrent("");
      setNewGoalMonthly("");
      setNewGoalDate("");
    }
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const updateGoalCurrent = (id: string, amount: number) => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, currentSavings: Math.max(0, amount) } : goal
    ));
  };

  const updateGoalMonthly = (id: string, amount: number) => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, monthlyContribution: Math.max(0, amount) } : goal
    ));
  };

  const exportToCSV = () => {
    const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const csvContent = [
      ["Savings Goals Report"],
      [""],
      ["Goal", "Target Amount", "Current Savings", "Monthly Contribution", "Interest Rate", "Target Date", "Months to Goal", "Projected Completion", "Progress"],
      ...calculations.map(calc => [
        calc.goal.name,
        calc.goal.targetAmount.toFixed(2),
        calc.goal.currentSavings.toFixed(2),
        calc.goal.monthlyContribution.toFixed(2),
        `${calc.goal.interestRate}%`,
        calc.goal.targetDate || "Not set",
        calc.isReachable ? calc.monthsToGoal : "Not reachable",
        calc.isReachable ? calc.projectedCompletionDate.toLocaleDateString() : "Not reachable",
        `${calc.progressPercentage.toFixed(1)}%`,
      ]),
      [""],
      ["Summary"],
      ["Total Target Amount", calculations.reduce((sum, calc) => sum + calc.goal.targetAmount, 0).toFixed(2)],
      ["Total Current Savings", calculations.reduce((sum, calc) => sum + calc.goal.currentSavings, 0).toFixed(2)],
      ["Total Monthly Contributions", calculations.reduce((sum, calc) => sum + calc.goal.monthlyContribution, 0).toFixed(2)],
      ["Overall Progress", `${calculations.length > 0 ? (calculations.reduce((sum, calc) => sum + calc.progressPercentage, 0) / calculations.length).toFixed(1) : 0}%`],
    ]
      .map(row => row.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "savings-goals.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date): string => {
    if (Number.isNaN(date.getTime())) return "Not reachable";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const yearsMonths = (months: number): string => {
    if (!Number.isFinite(months)) return "Not reachable";
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? "s" : ""}`;
    } else {
      return `${years} year${years !== 1 ? "s" : ""}, ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
    }
  };

  const totalSummary = useMemo(() => {
    const totalTarget = calculations.reduce((sum, calc) => sum + calc.goal.targetAmount, 0);
    const totalCurrent = calculations.reduce((sum, calc) => sum + calc.goal.currentSavings, 0);
    const totalMonthly = calculations.reduce((sum, calc) => sum + calc.goal.monthlyContribution, 0);
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    const totalRemaining = totalTarget - totalCurrent;

    return {
      totalTarget,
      totalCurrent,
      totalMonthly,
      overallProgress,
      totalRemaining,
    };
  }, [calculations]);

  return (
    <ToolLayout title="Savings Goal Calculator" description="Plan and track multiple savings goals with timelines and monthly targets." category="Calculators">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-green-600 rounded-xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Savings Goal Calculator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plan and track multiple savings goals with compound interest calculations and timeline projections
          </p>
        </div>

        {/* Summary Cards */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">Total Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{goals.length}</div>
                <p className="text-sm opacity-90 mt-1">Active savings goals</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">Target Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${totalSummary.totalTarget.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-sm opacity-90 mt-1">Total target</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">Current Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${totalSummary.totalCurrent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-sm opacity-90 mt-1">
                  {totalSummary.overallProgress.toFixed(1)}% complete
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">Monthly Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${totalSummary.totalMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
                <p className="text-sm opacity-90 mt-1">Total per month</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Goal Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Savings Goal
            </CardTitle>
            <CardDescription>
              Set a new savings goal with target amount, timeline, and interest rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  placeholder="e.g., Emergency Fund"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addGoal()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="10000"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addGoal()}
                  min="0"
                  step="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentSavings">Current Savings ($)</Label>
                <Input
                  id="currentSavings"
                  type="number"
                  placeholder="0"
                  value={newGoalCurrent}
                  onChange={(e) => setNewGoalCurrent(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addGoal()}
                  min="0"
                  step="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Monthly Contribution ($)</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  placeholder="500"
                  value={newGoalMonthly}
                  onChange={(e) => setNewGoalMonthly(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addGoal()}
                  min="0"
                  step="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  placeholder="2"
                  value={newGoalRate}
                  onChange={(e) => setNewGoalRate(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addGoal()}
                  min="0"
                  max="50"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date (optional)</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  min={getTodayInputValue()}
                />
              </div>
            </div>

            <Button onClick={addGoal} className="mt-4 w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </CardContent>
        </Card>

        {/* Goals List */}
        {goals.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Savings Goals</CardTitle>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="goals" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="goals" className="space-y-4">
                  {calculations.map((calc) => (
                    <Card key={calc.goal.id} className={`border-l-4 ${!calc.isReachable ? "border-l-red-500" : calc.onTrack ? "border-l-green-500" : "border-l-orange-500"}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{calc.goal.name}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeGoal(calc.goal.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              ${calc.goal.currentSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })} of ${calc.goal.targetAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </span>
                            <span className="font-bold">{calc.progressPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-600 h-3 rounded-full transition-all"
                              style={{ width: `${Math.min(calc.progressPercentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Remaining</div>
                            <div className="text-lg font-bold">
                              ${Math.max(0, calc.goal.targetAmount - calc.goal.currentSavings).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Time to Goal</div>
                            <div className="text-lg font-bold">
                              {calc.isReachable ? yearsMonths(calc.monthsToGoal) : "Not reachable"}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Monthly Contribution</div>
                            <div className="text-lg font-bold">
                              ${calc.goal.monthlyContribution.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-muted-foreground">Interest Earned</div>
                            <div className="text-lg font-bold text-green-600">
                              ${calc.totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        </div>

                        {/* Target Date Info */}
                        {calc.goal.targetDate && (
                          <Alert className={calc.onTrack ? "border-green-500" : "border-orange-500"}>
                            <Calendar className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-1">
                                <div>
                                  <strong>Target Date:</strong> {formatDate(new Date(calc.goal.targetDate))}
                                </div>
                                <div>
                                  <strong>Projected Completion:</strong> {calc.isReachable ? formatDate(calc.projectedCompletionDate) : "Not reachable"}
                                </div>
                                {!calc.isReachable && (
                                  <div className="text-red-600 mt-2">
                                    Add a monthly contribution or increase current savings to make this goal reachable.
                                  </div>
                                )}
                                {calc.isReachable && !calc.onTrack && (
                                  <div className="text-orange-600 mt-2">
                                    You need to save <strong>${calc.requiredMonthlyPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}/month</strong> to reach your goal by the target date.
                                  </div>
                                )}
                                {calc.isReachable && calc.onTrack && calc.goal.monthlyContribution < calc.requiredMonthlyPayment && (
                                  <div className="text-green-600 mt-2">
                                    On track. Current pace will reach goal by {formatDate(calc.projectedCompletionDate)}
                                  </div>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Quick Update Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <Label>Update Current Savings</Label>
                            <Input
                              type="number"
                              value={calc.goal.currentSavings}
                              onChange={(e) => updateGoalCurrent(calc.goal.id, parseFloat(e.target.value) || 0)}
                              min="0"
                              step="100"
                            />
                          </div>
                          <div>
                            <Label>Update Monthly Contribution</Label>
                            <Input
                              type="number"
                              value={calc.goal.monthlyContribution}
                              onChange={(e) => updateGoalMonthly(calc.goal.id, parseFloat(e.target.value) || 0)}
                              min="0"
                              step="50"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Goals are sorted by projected completion date (earliest first)
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {calculations.map((calc, index) => (
                      <Card key={calc.goal.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-xl font-bold text-green-600">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{calc.goal.name}</h3>
                              <div className="text-sm text-muted-foreground">
                                Projected completion: {calc.isReachable ? formatDate(calc.projectedCompletionDate) : "Not reachable"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {calc.isReachable ? `${yearsMonths(calc.monthsToGoal)} from now` : "Not reachable"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                ${calc.goal.targetAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {calc.progressPercentage.toFixed(1)}% complete
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">First goal completion:</span>
                        <span className="font-semibold">
                          {calculations.length > 0 ? (calculations[0].isReachable ? formatDate(calculations[0].projectedCompletionDate) : "Not reachable") : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last goal completion:</span>
                        <span className="font-semibold">
                          {calculations.length > 0 ? (calculations[calculations.length - 1].isReachable ? formatDate(calculations[calculations.length - 1].projectedCompletionDate) : "Not reachable") : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total timespan:</span>
                        <span className="font-semibold">
                          {calculations.length > 0 ? (calculations[calculations.length - 1].isReachable ? yearsMonths(calculations[calculations.length - 1].monthsToGoal) : "Not reachable") : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t">
                        <span className="text-muted-foreground">Total to save:</span>
                        <span className="font-bold text-lg">
                          ${totalSummary.totalRemaining.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
};

export default SavingsGoalCalculator;

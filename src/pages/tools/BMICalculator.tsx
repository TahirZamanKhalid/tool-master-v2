import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAdRefresh } from "@/hooks/useAdRefresh";
import {
  Activity,
  TrendingUp,
  Target,
  Heart,
  Scale,
  Ruler,
  AlertCircle,
  Info,
  Calendar,
  User,
  Download,
  Share2,
  History,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const EnhancedBMICalculator = () => {
  const adRefreshKey = useAdRefresh(3);
  
  // Basic inputs
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");
  const [age, setAge] = useState("30");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  // Advanced options
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goalWeight, setGoalWeight] = useState("65");
  const [bodyFat, setBodyFat] = useState("20");
  const [waist, setWaist] = useState("80");
  const [hip, setHip] = useState("95");
  const [neck, setNeck] = useState("35");

  // Display options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar" | "area" | "radar">("area");
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [showGoals, setShowGoals] = useState(true);
  const [showHealthMetrics, setShowHealthMetrics] = useState(true);

  // History tracking
  const [history, setHistory] = useState<Array<{ date: string; bmi: number; weight: number }>>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Animation state
  const [animatedBMI, setAnimatedBMI] = useState(0);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (isNaN(w) || isNaN(h) || h === 0) return 0;

    if (unit === "metric") {
      const heightInMeters = h / 100;
      return w / (heightInMeters * heightInMeters);
    } else {
      return (w / (h * h)) * 703;
    }
  };

  const calculateBMR = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    if (isNaN(w) || isNaN(h) || isNaN(a)) return 0;

    // Mifflin-St Jeor Equation
    if (unit === "metric") {
      if (gender === "male") {
        return 10 * w + 6.25 * h - 5 * a + 5;
      } else {
        return 10 * w + 6.25 * h - 5 * a - 161;
      }
    } else {
      const wKg = w * 0.453592;
      const hCm = h * 2.54;
      if (gender === "male") {
        return 10 * wKg + 6.25 * hCm - 5 * a + 5;
      } else {
        return 10 * wKg + 6.25 * hCm - 5 * a - 161;
      }
    }
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const multipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };
    return bmr * multipliers[activityLevel];
  };

  const calculateIdealWeight = () => {
    const h = parseFloat(height);
    if (isNaN(h)) return { min: 0, max: 0 };

    if (unit === "metric") {
      const heightInMeters = h / 100;
      return {
        min: 18.5 * heightInMeters * heightInMeters,
        max: 24.9 * heightInMeters * heightInMeters,
      };
    } else {
      const min = (18.5 * h * h) / 703;
      const max = (24.9 * h * h) / 703;
      return { min, max };
    }
  };

  const calculateBodyFatPercentage = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const waistVal = parseFloat(waist);
    const neckVal = parseFloat(neck);
    const hipVal = parseFloat(hip);

    if (isNaN(w) || isNaN(h) || isNaN(waistVal) || isNaN(neckVal)) return 0;

    // US Navy Method
    if (gender === "male") {
      return 495 / (1.0324 - 0.19077 * Math.log10(waistVal - neckVal) + 0.15456 * Math.log10(h)) - 450;
    } else {
      if (isNaN(hipVal)) return 0;
      return 495 / (1.29579 - 0.35004 * Math.log10(waistVal + hipVal - neckVal) + 0.221 * Math.log10(h)) - 450;
    }
  };

  const calculateWHR = () => {
    const waistVal = parseFloat(waist);
    const hipVal = parseFloat(hip);
    if (isNaN(waistVal) || isNaN(hipVal) || hipVal === 0) return 0;
    return waistVal / hipVal;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return {
        category: "Underweight",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        description: "You may need to gain weight. Consult a healthcare provider.",
        risk: "Increased risk of nutritional deficiencies and weakened immunity.",
      };
    if (bmi < 25)
      return {
        category: "Normal weight",
        color: "text-green-600",
        bgColor: "bg-green-50",
        description: "You're at a healthy weight. Maintain your current lifestyle!",
        risk: "Lowest risk for weight-related health issues.",
      };
    if (bmi < 30)
      return {
        category: "Overweight",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        description: "Consider lifestyle changes for better health.",
        risk: "Moderate risk for heart disease, diabetes, and hypertension.",
      };
    if (bmi < 35)
      return {
        category: "Obese Class I",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        description: "Health risks are present. Consult a healthcare provider.",
        risk: "High risk for chronic diseases and health complications.",
      };
    if (bmi < 40)
      return {
        category: "Obese Class II",
        color: "text-red-600",
        bgColor: "bg-red-50",
        description: "Significant health risks. Medical intervention recommended.",
        risk: "Very high risk for serious health conditions.",
      };
    return {
      category: "Obese Class III",
      color: "text-red-700",
      bgColor: "bg-red-100",
      description: "Severe obesity. Immediate medical consultation advised.",
      risk: "Extremely high risk requiring immediate medical attention.",
    };
  };

  const getBodyFatCategory = (bf: number) => {
    if (gender === "male") {
      if (bf < 6) return { category: "Essential Fat", color: "text-blue-600" };
      if (bf < 14) return { category: "Athletes", color: "text-green-600" };
      if (bf < 18) return { category: "Fitness", color: "text-green-500" };
      if (bf < 25) return { category: "Average", color: "text-yellow-600" };
      return { category: "Obese", color: "text-red-600" };
    } else {
      if (bf < 14) return { category: "Essential Fat", color: "text-blue-600" };
      if (bf < 21) return { category: "Athletes", color: "text-green-600" };
      if (bf < 25) return { category: "Fitness", color: "text-green-500" };
      if (bf < 32) return { category: "Average", color: "text-yellow-600" };
      return { category: "Obese", color: "text-red-600" };
    }
  };

  const getWHRCategory = (whr: number) => {
    if (gender === "male") {
      if (whr < 0.95) return { category: "Low Risk", color: "text-green-600" };
      if (whr < 1.0) return { category: "Moderate Risk", color: "text-yellow-600" };
      return { category: "High Risk", color: "text-red-600" };
    } else {
      if (whr < 0.8) return { category: "Low Risk", color: "text-green-600" };
      if (whr < 0.85) return { category: "Moderate Risk", color: "text-yellow-600" };
      return { category: "High Risk", color: "text-red-600" };
    }
  };

  const bmi = calculateBMI();
  const bmr = calculateBMR();
  const tdee = calculateTDEE();
  const idealWeight = calculateIdealWeight();
  const bodyFatPercent = showAdvanced ? calculateBodyFatPercentage() : parseFloat(bodyFat);
  const whr = calculateWHR();
  const { category, color, bgColor, description, risk } = getBMICategory(bmi);
  const bodyFatCategory = getBodyFatCategory(bodyFatPercent);
  const whrCategory = getWHRCategory(whr);

  // Animate BMI counter
  useEffect(() => {
    if (animationEnabled) {
      const duration = 1000;
      const steps = 60;
      const increment = bmi / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= bmi) {
          setAnimatedBMI(bmi);
          clearInterval(timer);
        } else {
          setAnimatedBMI(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedBMI(bmi);
    }
  }, [bmi, animationEnabled]);

  // Generate BMI range data for chart
  const generateBMIRangeData = () => {
    const data = [];
    for (let i = 15; i <= 40; i += 0.5) {
      let category = "";
      if (i < 18.5) category = "Underweight";
      else if (i < 25) category = "Normal";
      else if (i < 30) category = "Overweight";
      else category = "Obese";

      data.push({
        bmi: i,
        value: i,
        category,
        isUser: Math.abs(i - bmi) < 0.25,
      });
    }
    return data;
  };

  // Generate weight progress data
  const generateWeightProgressData = () => {
    const current = parseFloat(weight);
    const goal = parseFloat(goalWeight);
    if (isNaN(current) || isNaN(goal)) return [];

    const weeks = Math.abs(current - goal) / 0.5; // Assuming 0.5 kg/week loss
    const data = [];
    const step = (goal - current) / Math.min(weeks, 52);

    for (let i = 0; i <= Math.min(weeks, 52); i++) {
      data.push({
        week: i,
        weight: current + step * i,
        goal: goal,
      });
    }
    return data;
  };

  // Health metrics radar data
  const getHealthMetricsData = () => {
    const bmiScore = Math.max(0, 100 - Math.abs(bmi - 21.5) * 5);
    const bodyFatScore =
      gender === "male"
        ? Math.max(0, 100 - Math.abs(bodyFatPercent - 15) * 4)
        : Math.max(0, 100 - Math.abs(bodyFatPercent - 23) * 4);
    const whrScore = Math.max(
      0,
      100 - (whr > (gender === "male" ? 0.95 : 0.8) ? (whr - (gender === "male" ? 0.95 : 0.8)) * 100 : 0),
    );

    return [
      { metric: "BMI", value: Math.min(100, bmiScore), fullMark: 100 },
      { metric: "Body Fat", value: Math.min(100, bodyFatScore), fullMark: 100 },
      { metric: "WHR", value: Math.min(100, whrScore), fullMark: 100 },
      {
        metric: "Activity",
        value:
          activityLevel === "sedentary"
            ? 20
            : activityLevel === "light"
              ? 40
              : activityLevel === "moderate"
                ? 60
                : activityLevel === "active"
                  ? 80
                  : 100,
        fullMark: 100,
      },
      { metric: "Hydration", value: 75, fullMark: 100 },
    ];
  };

  const addToHistory = () => {
    const newEntry = {
      date: new Date().toLocaleDateString(),
      bmi: bmi,
      weight: parseFloat(weight),
    };
    setHistory((prev) => [newEntry, ...prev].slice(0, 10));
  };

  const exportData = () => {
    const data = {
      date: new Date().toISOString(),
      personalInfo: {
        age: age,
        gender: gender,
        unit: unit,
      },
      measurements: {
        weight: weight,
        height: height,
        waist: waist,
        hip: hip,
        neck: neck,
      },
      results: {
        bmi: bmi.toFixed(1),
        category: category,
        bmr: bmr.toFixed(0),
        tdee: tdee.toFixed(0),
        bodyFat: bodyFatPercent.toFixed(1),
        whr: whr.toFixed(2),
        idealWeightRange: `${idealWeight.min.toFixed(1)} - ${idealWeight.max.toFixed(1)}`,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bmi-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

  return (
    <ToolLayout
      title="Advanced BMI Calculator"
      description="Comprehensive Body Mass Index calculator with health metrics, goals tracking, and detailed insights"
      category="Calculators"
      adRefreshKey={adRefreshKey}
      relatedTools={[
        { name: "Percentage Calculator", path: "/tools/percentage-calculator" },
        { name: "Unit Converter", path: "/tools/unit-converter" },
        { name: "Currency Converter", path: "/tools/currency-converter" },
      ]}
    >
      <div className="space-y-6">
        {/* Control Panel */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={animationEnabled} onCheckedChange={setAnimationEnabled} id="animations" />
              <Label htmlFor="animations" className="cursor-pointer text-sm">
                Animations
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showGoals} onCheckedChange={setShowGoals} id="goals" />
              <Label htmlFor="goals" className="cursor-pointer text-sm">
                Show Goals
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showHealthMetrics} onCheckedChange={setShowHealthMetrics} id="health" />
              <Label htmlFor="health" className="cursor-pointer text-sm">
                Health Metrics
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} id="advanced" />
              <Label htmlFor="advanced" className="cursor-pointer text-sm">
                Advanced Mode
              </Label>
            </div>
            <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="radar">Radar Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      Personal Information
                    </Label>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="age" className="text-sm">
                          Age
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Gender</Label>
                        <RadioGroup value={gender} onValueChange={(v: any) => setGender(v)} className="flex gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male" className="cursor-pointer">
                              Male
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female" className="cursor-pointer">
                              Female
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label className="text-sm">Unit System</Label>
                        <RadioGroup value={unit} onValueChange={(v: any) => setUnit(v)} className="flex gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="metric" id="metric" />
                            <Label htmlFor="metric" className="cursor-pointer">
                              Metric
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="imperial" id="imperial" />
                            <Label htmlFor="imperial" className="cursor-pointer">
                              Imperial
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Scale className="w-4 h-4" />
                      Body Measurements
                    </Label>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="weight" className="text-sm">
                          Weight {unit === "metric" ? "(kg)" : "(lbs)"}
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="mt-1"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height" className="text-sm">
                          Height {unit === "metric" ? "(cm)" : "(inches)"}
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="mt-1"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Measurements */}
                {showAdvanced && (
                  <div className="border-t pt-6">
                    <Label className="flex items-center gap-2 mb-4">
                      <Ruler className="w-4 h-4" />
                      Advanced Measurements
                    </Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="waist" className="text-sm">
                          Waist {unit === "metric" ? "(cm)" : "(in)"}
                        </Label>
                        <Input
                          id="waist"
                          type="number"
                          value={waist}
                          onChange={(e) => setWaist(e.target.value)}
                          className="mt-1"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hip" className="text-sm">
                          Hip {unit === "metric" ? "(cm)" : "(in)"}
                        </Label>
                        <Input
                          id="hip"
                          type="number"
                          value={hip}
                          onChange={(e) => setHip(e.target.value)}
                          className="mt-1"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="neck" className="text-sm">
                          Neck {unit === "metric" ? "(cm)" : "(in)"}
                        </Label>
                        <Input
                          id="neck"
                          type="number"
                          value={neck}
                          onChange={(e) => setNeck(e.target.value)}
                          className="mt-1"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Level */}
                <div>
                  <Label htmlFor="activity" className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4" />
                    Activity Level
                  </Label>
                  <Select value={activityLevel} onValueChange={setActivityLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                      <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                      <SelectItem value="veryActive">Very Active (2x per day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Results Card */}
            <Card className={`p-8 ${bgColor} border-2 transition-all duration-500`}>
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <Activity className={`w-8 h-8 ${color}`} />
                  <h3 className="font-semibold text-2xl">Your Results</h3>
                </div>

                <div className="relative">
                  <p className={`text-7xl font-bold ${color} transition-all duration-300`}>{animatedBMI.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground mt-2">Body Mass Index</p>
                </div>

                <div className={`inline-block px-6 py-3 rounded-full ${color} bg-white font-semibold text-xl`}>
                  {category}
                </div>

                <p className="text-base max-w-2xl mx-auto">{description}</p>

                <div className="flex justify-center gap-4 mt-4">
                  <Button onClick={addToHistory} variant="outline" size="sm">
                    <History className="w-4 h-4 mr-2" />
                    Save to History
                  </Button>
                  <Button onClick={exportData} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4 text-center hover:shadow-lg transition-shadow">
                <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-muted-foreground">BMR</p>
                <p className="text-2xl font-bold">{bmr.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">cal/day</p>
              </Card>
              <Card className="p-4 text-center hover:shadow-lg transition-shadow">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">TDEE</p>
                <p className="text-2xl font-bold">{tdee.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">cal/day</p>
              </Card>
              <Card className="p-4 text-center hover:shadow-lg transition-shadow">
                <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-muted-foreground">Ideal Weight</p>
                <p className="text-xl font-bold">
                  {idealWeight.min.toFixed(1)} - {idealWeight.max.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">{unit === "metric" ? "kg" : "lbs"}</p>
              </Card>
              {showAdvanced && (
                <Card className="p-4 text-center hover:shadow-lg transition-shadow">
                  <Activity className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm text-muted-foreground">Body Fat</p>
                  <p className="text-2xl font-bold">{bodyFatPercent.toFixed(1)}%</p>
                  <p className={`text-xs ${bodyFatCategory.color}`}>{bodyFatCategory.category}</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">BMI Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <>
                  {chartType === "area" && (
                    <AreaChart data={generateBMIRangeData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bmi" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                        animationDuration={animationEnabled ? 1000 : 0}
                      />
                    </AreaChart>
                  )}
                  {chartType === "line" && (
                    <LineChart data={generateBMIRangeData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bmi" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={false}
                        animationDuration={animationEnabled ? 1000 : 0}
                      />
                    </LineChart>
                  )}
                  {chartType === "bar" && (
                    <BarChart data={generateBMIRangeData().filter((_, i) => i % 5 === 0)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bmi" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" animationDuration={animationEnabled ? 1000 : 0} />
                    </BarChart>
                  )}
                  {chartType === "radar" && showHealthMetrics && (
                    <RadarChart data={getHealthMetricsData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Health Score"
                        dataKey="value"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                        animationDuration={animationEnabled ? 1000 : 0}
                      />
                    </RadarChart>
                  )}
                </>
              </ResponsiveContainer>
            </Card>

            {/* BMI Categories Reference */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">BMI Categories & Health Risks</h3>
              <div className="space-y-3">
                {[
                  {
                    range: "< 18.5",
                    category: "Underweight",
                    color: "bg-blue-100 text-blue-700",
                    risk: "Nutritional deficiency, weakened immunity",
                  },
                  {
                    range: "18.5 - 24.9",
                    category: "Normal",
                    color: "bg-green-100 text-green-700",
                    risk: "Lowest risk for weight-related diseases",
                  },
                  {
                    range: "25 - 29.9",
                    category: "Overweight",
                    color: "bg-yellow-100 text-yellow-700",
                    risk: "Increased risk for type 2 diabetes, heart disease",
                  },
                  {
                    range: "30 - 34.9",
                    category: "Obese I",
                    color: "bg-orange-100 text-orange-700",
                    risk: "High risk for cardiovascular disease",
                  },
                  {
                    range: "35 - 39.9",
                    category: "Obese II",
                    color: "bg-red-100 text-red-700",
                    risk: "Very high risk for health complications",
                  },
                  {
                    range: "≥ 40",
                    category: "Obese III",
                    color: "bg-red-200 text-red-800",
                    risk: "Extremely high risk, medical intervention needed",
                  },
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${item.color} flex justify-between items-center`}>
                    <div>
                      <p className="font-semibold">{item.category}</p>
                      <p className="text-sm opacity-90">{item.risk}</p>
                    </div>
                    <span className="font-mono font-bold">{item.range}</span>
                  </div>
                ))}
              </div>
            </Card>

            {showAdvanced && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Waist-to-Hip Ratio</h3>
                  <div className="text-center space-y-4">
                    <p className="text-5xl font-bold">{whr.toFixed(2)}</p>
                    <p className={`text-xl font-semibold ${whrCategory.color}`}>{whrCategory.category}</p>
                    <p className="text-sm text-muted-foreground">
                      WHR indicates body fat distribution and cardiovascular risk
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Body Composition</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Body Fat</span>
                        <span className="text-sm font-semibold">{bodyFatPercent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${bodyFatCategory.color.replace("text-", "bg-")}`}
                          style={{ width: `${Math.min(100, bodyFatPercent)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Lean Mass</span>
                        <span className="text-sm font-semibold">{(100 - bodyFatPercent).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-green-500"
                          style={{ width: `${100 - Math.min(100, bodyFatPercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            {showGoals && (
              <>
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Weight Goal Tracker
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="goalWeight">Goal Weight {unit === "metric" ? "(kg)" : "(lbs)"}</Label>
                      <Input
                        id="goalWeight"
                        type="number"
                        value={goalWeight}
                        onChange={(e) => setGoalWeight(e.target.value)}
                        className="mt-2"
                        step="0.1"
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Current Weight:</span>
                        <span className="font-semibold">
                          {weight} {unit === "metric" ? "kg" : "lbs"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Goal Weight:</span>
                        <span className="font-semibold">
                          {goalWeight} {unit === "metric" ? "kg" : "lbs"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Difference:</span>
                        <span className="font-semibold">
                          {Math.abs(parseFloat(weight) - parseFloat(goalWeight)).toFixed(1)}{" "}
                          {unit === "metric" ? "kg" : "lbs"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Time:</span>
                        <span className="font-semibold">
                          {(Math.abs(parseFloat(weight) - parseFloat(goalWeight)) / 0.5).toFixed(0)} weeks
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Weight Progress Projection</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={generateWeightProgressData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" label={{ value: "Weeks", position: "insideBottom", offset: -5 }} />
                      <YAxis
                        label={{
                          value: unit === "metric" ? "Weight (kg)" : "Weight (lbs)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Projected Weight"
                        animationDuration={animationEnabled ? 1500 : 0}
                      />
                      <Line
                        type="monotone"
                        dataKey="goal"
                        stroke="#82ca9d"
                        strokeDasharray="5 5"
                        name="Goal"
                        animationDuration={animationEnabled ? 1500 : 0}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Calorie Targets</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">Maintain Weight</p>
                      <p className="text-3xl font-bold text-green-600">{tdee.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground mt-1">calories/day</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">Lose Weight</p>
                      <p className="text-3xl font-bold text-blue-600">{(tdee - 500).toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground mt-1">calories/day (-0.5 kg/week)</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">Gain Weight</p>
                      <p className="text-3xl font-bold text-purple-600">{(tdee + 500).toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground mt-1">calories/day (+0.5 kg/week)</p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                Health Insights & Recommendations
              </h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <p className="font-semibold mb-2">Risk Assessment</p>
                  <p className="text-sm">{risk}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Personalized Recommendations:</h4>
                  {bmi < 18.5 && (
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Increase calorie intake with nutrient-dense foods</li>
                      <li>Include strength training to build muscle mass</li>
                      <li>Consult a nutritionist for a healthy weight gain plan</li>
                      <li>Monitor for underlying health conditions</li>
                    </ul>
                  )}
                  {bmi >= 18.5 && bmi < 25 && (
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Maintain current healthy habits</li>
                      <li>Continue balanced diet and regular exercise</li>
                      <li>Stay active with at least 150 minutes of moderate activity per week</li>
                      <li>Regular health check-ups for prevention</li>
                    </ul>
                  )}
                  {bmi >= 25 && bmi < 30 && (
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Aim for a 5-10% weight reduction initially</li>
                      <li>Increase physical activity to 300 minutes per week</li>
                      <li>Focus on portion control and mindful eating</li>
                      <li>Reduce processed foods and added sugars</li>
                      <li>Track daily calorie intake</li>
                    </ul>
                  )}
                  {bmi >= 30 && (
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>Consult with healthcare provider for comprehensive plan</li>
                      <li>Consider supervised weight loss program</li>
                      <li>Focus on sustainable lifestyle changes</li>
                      <li>Screen for obesity-related conditions (diabetes, hypertension)</li>
                      <li>Possible need for medical interventions</li>
                      <li>Regular monitoring and support essential</li>
                    </ul>
                  )}
                </div>
              </div>
            </Card>

            {showHistory && history.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  History
                </h3>
                <div className="space-y-2">
                  {history.map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">{entry.date}</span>
                      <div className="flex gap-4">
                        <span className="text-sm">
                          BMI: <strong>{entry.bmi.toFixed(1)}</strong>
                        </span>
                        <span className="text-sm">
                          Weight: <strong>{entry.weight.toFixed(1)}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Understanding Your Metrics
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold">BMI (Body Mass Index)</p>
                  <p className="text-muted-foreground">
                    A measure of body fat based on height and weight. While widely used, it doesn't account for muscle
                    mass, bone density, or fat distribution.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">BMR (Basal Metabolic Rate)</p>
                  <p className="text-muted-foreground">
                    The number of calories your body needs at rest to maintain vital functions. This is your minimum
                    daily calorie requirement.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">TDEE (Total Daily Energy Expenditure)</p>
                  <p className="text-muted-foreground">
                    Your total calorie burn including activity. This is how many calories you need to maintain your
                    current weight.
                  </p>
                </div>
                {showAdvanced && (
                  <>
                    <div>
                      <p className="font-semibold">Body Fat Percentage</p>
                      <p className="text-muted-foreground">
                        The proportion of fat vs. lean tissue. More accurate than BMI for assessing health risks and
                        fitness level.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Waist-to-Hip Ratio</p>
                      <p className="text-muted-foreground">
                        Indicates fat distribution. Higher ratios suggest more abdominal fat, which increases
                        cardiovascular risk.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <p className="font-semibold">Important Disclaimer</p>
                  <p className="text-sm text-muted-foreground">
                    This calculator provides estimates based on standard formulas and should not replace professional
                    medical advice. BMI has limitations and doesn't account for muscle mass, bone density, age, sex, and
                    ethnicity. Athletes and very muscular individuals may have high BMI despite low body fat. Always
                    consult healthcare professionals for personalized health assessments and before starting any diet or
                    exercise program.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
};

export default EnhancedBMICalculator;

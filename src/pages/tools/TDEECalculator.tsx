import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Activity, Calculator, Target, TrendingDown, TrendingUp, Scale, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MacroBreakdown {
  protein: number;
  carbs: number;
  fats: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

interface CalorieTarget {
  calories: number;
  description: string;
  weeklyChange: number;
  macros: MacroBreakdown;
}

interface TDEEResult {
  bmr: number;
  tdee: number;
  goals: {
    extremeLoss: CalorieTarget;
    moderateLoss: CalorieTarget;
    mildLoss: CalorieTarget;
    maintenance: CalorieTarget;
    mildGain: CalorieTarget;
    moderateGain: CalorieTarget;
  };
  bmi: number;
  bmiCategory: string;
  idealWeightRange: { min: number; max: number };
}

const TDEECalculator = () => {
  const [age, setAge] = useState<string>("30");
  const [gender, setGender] = useState<string>("male");
  const [weight, setWeight] = useState<string>("70");
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [height, setHeight] = useState<string>("170");
  const [heightUnit, setHeightUnit] = useState<string>("cm");
  const [activityLevel, setActivityLevel] = useState<string>("1.55");
  const [bodyFat, setBodyFat] = useState<string>("");
  const [bmrFormula, setBmrFormula] = useState<string>("mifflin");
  const [dietType, setDietType] = useState<string>("balanced");

  const convertToMetric = (value: number, unit: string, type: "weight" | "height"): number => {
    if (type === "weight") {
      return unit === "kg" ? value : value * 0.453592; // lbs to kg
    } else {
      if (unit === "cm") return value;
      if (unit === "ft") return value * 30.48; // feet to cm
      return value * 2.54; // inches to cm
    }
  };

  const getMacroSplit = (calories: number, type: string): MacroBreakdown => {
    let proteinPercent = 0, carbsPercent = 0, fatsPercent = 0;

    switch (type) {
      case "balanced":
        proteinPercent = 30;
        carbsPercent = 40;
        fatsPercent = 30;
        break;
      case "high-protein":
        proteinPercent = 40;
        carbsPercent = 30;
        fatsPercent = 30;
        break;
      case "low-carb":
        proteinPercent = 35;
        carbsPercent = 20;
        fatsPercent = 45;
        break;
      case "keto":
        proteinPercent = 25;
        carbsPercent = 5;
        fatsPercent = 70;
        break;
      case "high-carb":
        proteinPercent = 25;
        carbsPercent = 55;
        fatsPercent = 20;
        break;
      default:
        proteinPercent = 30;
        carbsPercent = 40;
        fatsPercent = 30;
    }

    const proteinCals = calories * (proteinPercent / 100);
    const carbsCals = calories * (carbsPercent / 100);
    const fatsCals = calories * (fatsPercent / 100);

    return {
      protein: proteinPercent,
      carbs: carbsPercent,
      fats: fatsPercent,
      proteinGrams: Math.round(proteinCals / 4),
      carbsGrams: Math.round(carbsCals / 4),
      fatsGrams: Math.round(fatsCals / 9),
    };
  };

  const calculations = useMemo((): TDEEResult | null => {
    const ageNum = parseFloat(age);
    const weightKg = convertToMetric(parseFloat(weight), weightUnit, "weight");
    const heightCm = convertToMetric(parseFloat(height), heightUnit, "height");
    const activityMultiplier = parseFloat(activityLevel);
    const bodyFatPercent = bodyFat ? parseFloat(bodyFat) : null;

    if (
      isNaN(ageNum) ||
      isNaN(weightKg) ||
      isNaN(heightCm) ||
      isNaN(activityMultiplier) ||
      ageNum <= 0 ||
      weightKg <= 0 ||
      heightCm <= 0
    ) {
      return null;
    }
    const safeBodyFatPercent = bodyFatPercent !== null && bodyFatPercent > 0 && bodyFatPercent < 100
      ? bodyFatPercent
      : null;

    let bmr = 0;

    // Calculate BMR based on selected formula
    if (bmrFormula === "mifflin") {
      // Mifflin-St Jeor (most accurate for general population)
      if (gender === "male") {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
      }
    } else if (bmrFormula === "harris") {
      // Harris-Benedict (revised)
      if (gender === "male") {
        bmr = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * ageNum;
      } else {
        bmr = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * ageNum;
      }
    } else if (bmrFormula === "katch" && safeBodyFatPercent !== null) {
      // Katch-McArdle (uses lean body mass - more accurate if body fat % is known)
      const leanMass = weightKg * (1 - safeBodyFatPercent / 100);
      bmr = 370 + 21.6 * leanMass;
    } else {
      // Default to Mifflin if Katch selected but no body fat provided
      if (gender === "male") {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
      }
    }

    const tdee = bmr * activityMultiplier;

    // Calculate BMI
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    let bmiCategory = "";
    if (bmi < 18.5) bmiCategory = "Underweight";
    else if (bmi < 25) bmiCategory = "Normal weight";
    else if (bmi < 30) bmiCategory = "Overweight";
    else bmiCategory = "Obese";

    // Ideal weight range (BMI 18.5-24.9)
    const idealWeightMin = 18.5 * heightM * heightM;
    const idealWeightMax = 24.9 * heightM * heightM;

    const createCalorieTarget = (offset: number, description: string, weeklyChange: number): CalorieTarget => {
      const calories = Math.max(0, Math.round(tdee + offset));
      return {
        calories,
        description,
        weeklyChange,
        macros: getMacroSplit(calories, dietType),
      };
    };

    // Create calorie targets for different goals
    const goals = {
      extremeLoss: createCalorieTarget(-1000, "Extreme Weight Loss (2 lbs/week)", -2),
      moderateLoss: createCalorieTarget(-500, "Moderate Weight Loss (1 lb/week)", -1),
      mildLoss: createCalorieTarget(-250, "Mild Weight Loss (0.5 lbs/week)", -0.5),
      maintenance: createCalorieTarget(0, "Maintain Current Weight", 0),
      mildGain: createCalorieTarget(250, "Mild Weight Gain (0.5 lbs/week)", 0.5),
      moderateGain: createCalorieTarget(500, "Moderate Weight Gain (1 lb/week)", 1),
    };

    return {
      bmr,
      tdee,
      goals,
      bmi,
      bmiCategory,
      idealWeightRange: {
        min: idealWeightMin,
        max: idealWeightMax,
      },
    };
  }, [age, gender, weight, weightUnit, height, heightUnit, activityLevel, bodyFat, bmrFormula, dietType]);

  const activityLevels = [
    { value: "1.2", label: "Sedentary", description: "Little or no exercise" },
    { value: "1.375", label: "Lightly Active", description: "Light exercise 1-3 days/week" },
    { value: "1.55", label: "Moderately Active", description: "Moderate exercise 3-5 days/week" },
    { value: "1.725", label: "Very Active", description: "Hard exercise 6-7 days/week" },
    { value: "1.9", label: "Extremely Active", description: "Very hard exercise & physical job" },
  ];

  return (
    <ToolLayout title="TDEE Calculator" description="Calculate your Total Daily Energy Expenditure and get personalized nutrition recommendations." category="Calculators">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-orange-600 rounded-xl">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              TDEE & Calorie Calculator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate your Total Daily Energy Expenditure, BMR, and personalized calorie targets with macro breakdowns
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Your Information
            </CardTitle>
            <CardDescription>
              Enter your details to calculate your daily calorie needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="30"
                    min="1"
                    max="120"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup value={gender} onValueChange={setGender}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="font-normal cursor-pointer">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="font-normal cursor-pointer">
                          Female
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Body Fat % (optional)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    placeholder="15"
                    min="3"
                    max="50"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Weight & Height */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70"
                      min="1"
                      step="0.1"
                      className="flex-1"
                    />
                    <Select value={weightUnit} onValueChange={setWeightUnit}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <div className="flex gap-2">
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="170"
                      min="1"
                      step="0.1"
                      className="flex-1"
                    />
                    <Select value={heightUnit} onValueChange={setHeightUnit}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="ft">ft</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Activity Level */}
              <div className="space-y-2">
                <Label htmlFor="activity">Activity Level</Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger id="activity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label} - {level.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Formula Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="formula">BMR Formula</Label>
                  <Select value={bmrFormula} onValueChange={setBmrFormula}>
                    <SelectTrigger id="formula">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mifflin">Mifflin-St Jeor (Recommended)</SelectItem>
                      <SelectItem value="harris">Harris-Benedict (Revised)</SelectItem>
                      <SelectItem value="katch">Katch-McArdle (Requires Body Fat %)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diet">Diet Type (Macro Split)</Label>
                  <Select value={dietType} onValueChange={setDietType}>
                    <SelectTrigger id="diet">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced (30/40/30)</SelectItem>
                      <SelectItem value="high-protein">High Protein (40/30/30)</SelectItem>
                      <SelectItem value="low-carb">Low Carb (35/20/45)</SelectItem>
                      <SelectItem value="keto">Keto (25/5/70)</SelectItem>
                      <SelectItem value="high-carb">High Carb (25/55/20)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {calculations && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">BMR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round(calculations.bmr)}
                  </div>
                  <p className="text-sm opacity-90 mt-1">Calories at rest</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">TDEE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round(calculations.tdee)}
                  </div>
                  <p className="text-sm opacity-90 mt-1">Daily calories burned</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">BMI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{calculations.bmi.toFixed(1)}</div>
                  <p className="text-sm opacity-90 mt-1">{calculations.bmiCategory}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Ideal Weight</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {weightUnit === "kg"
                      ? `${calculations.idealWeightRange.min.toFixed(1)} - ${calculations.idealWeightRange.max.toFixed(1)} kg`
                      : `${(calculations.idealWeightRange.min * 2.20462).toFixed(1)} - ${(calculations.idealWeightRange.max * 2.20462).toFixed(1)} lbs`}
                  </div>
                  <p className="text-sm opacity-90 mt-1">Healthy range</p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                <strong>Your TDEE is {Math.round(calculations.tdee)} calories/day.</strong> This is the number
                of calories you burn daily with your current activity level. Adjust your intake based on your goals below.
              </AlertDescription>
            </Alert>

            {/* Detailed Results */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Calorie & Macro Targets</CardTitle>
                <CardDescription>
                  Choose your goal and follow the recommended daily intake
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="goals" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="macros">Macros</TabsTrigger>
                    <TabsTrigger value="info">Information</TabsTrigger>
                  </TabsList>

                  <TabsContent value="goals" className="space-y-4">
                    <div className="space-y-4">
                      {/* Weight Loss Goals */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                          Weight Loss Goals
                        </h3>

                        <Card className="border-l-4 border-l-red-600">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {calculations.goals.extremeLoss.description}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Aggressive deficit - not recommended for everyone
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-red-600">
                                  {calculations.goals.extremeLoss.calories}
                                </div>
                                <div className="text-sm text-muted-foreground">calories/day</div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Deficit: {Math.round(calculations.tdee - calculations.goals.extremeLoss.calories)} calories/day
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-orange-500">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {calculations.goals.moderateLoss.description}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Sustainable and effective for most people
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-orange-600">
                                  {calculations.goals.moderateLoss.calories}
                                </div>
                                <div className="text-sm text-muted-foreground">calories/day</div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Deficit: {Math.round(calculations.tdee - calculations.goals.moderateLoss.calories)} calories/day
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-yellow-500">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {calculations.goals.mildLoss.description}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Gentle approach, easier to maintain
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-yellow-600">
                                  {calculations.goals.mildLoss.calories}
                                </div>
                                <div className="text-sm text-muted-foreground">calories/day</div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Deficit: {Math.round(calculations.tdee - calculations.goals.mildLoss.calories)} calories/day
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Maintenance */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Scale className="w-5 h-5 text-blue-600" />
                          Maintenance
                        </h3>

                        <Card className="border-l-4 border-l-blue-600">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {calculations.goals.maintenance.description}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Stay at your current weight
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                  {calculations.goals.maintenance.calories}
                                </div>
                                <div className="text-sm text-muted-foreground">calories/day</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Weight Gain Goals */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          Weight Gain Goals
                        </h3>

                        <Card className="border-l-4 border-l-green-500">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {calculations.goals.mildGain.description}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Lean muscle gain with minimal fat
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">
                                  {calculations.goals.mildGain.calories}
                                </div>
                                <div className="text-sm text-muted-foreground">calories/day</div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Surplus: {Math.round(calculations.goals.mildGain.calories - calculations.tdee)} calories/day
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-emerald-600">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {calculations.goals.moderateGain.description}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Faster muscle and strength gains
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-emerald-600">
                                  {calculations.goals.moderateGain.calories}
                                </div>
                                <div className="text-sm text-muted-foreground">calories/day</div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Surplus: {Math.round(calculations.goals.moderateGain.calories - calculations.tdee)} calories/day
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="macros" className="space-y-4">
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        Macro breakdown for <strong>{dietType}</strong> diet type. Protein/Carbs/Fats percentages shown.
                      </AlertDescription>
                    </Alert>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left font-semibold">Goal</th>
                            <th className="p-3 text-right font-semibold">Calories</th>
                            <th className="p-3 text-right font-semibold">Protein</th>
                            <th className="p-3 text-right font-semibold">Carbs</th>
                            <th className="p-3 text-right font-semibold">Fats</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(calculations.goals).map(([key, goal]) => (
                            <tr key={key} className="border-b hover:bg-muted/30">
                              <td className="p-3 font-medium">{goal.description}</td>
                              <td className="p-3 text-right font-semibold">{goal.calories} cal</td>
                              <td className="p-3 text-right">
                                <div>{goal.macros.proteinGrams}g</div>
                                <div className="text-xs text-muted-foreground">
                                  ({goal.macros.protein}%)
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <div>{goal.macros.carbsGrams}g</div>
                                <div className="text-xs text-muted-foreground">
                                  ({goal.macros.carbs}%)
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <div>{goal.macros.fatsGrams}g</div>
                                <div className="text-xs text-muted-foreground">
                                  ({goal.macros.fats}%)
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="info" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">About BMR</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p>
                            <strong>Basal Metabolic Rate (BMR)</strong> is the number of calories your body
                            burns at rest to maintain vital functions like breathing, circulation, and cell
                            production.
                          </p>
                          <p className="text-muted-foreground">
                            Your BMR: <strong>{Math.round(calculations.bmr)} calories/day</strong>
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">About TDEE</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p>
                            <strong>Total Daily Energy Expenditure (TDEE)</strong> is your BMR multiplied by
                            your activity level. It represents the total calories you burn in a day.
                          </p>
                          <p className="text-muted-foreground">
                            Your TDEE: <strong>{Math.round(calculations.tdee)} calories/day</strong>
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Formulas Used</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div>
                            <strong>Mifflin-St Jeor:</strong> Most accurate for general population
                          </div>
                          <div>
                            <strong>Harris-Benedict:</strong> Older formula, still widely used
                          </div>
                          <div>
                            <strong>Katch-McArdle:</strong> Most accurate when body fat % is known
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <ul className="list-disc list-inside space-y-1">
                            <li>Weight loss: Create a 500-1000 calorie daily deficit</li>
                            <li>Weight gain: Add 250-500 calories to your TDEE</li>
                            <li>Track your progress and adjust as needed</li>
                            <li>Aim for 0.5-2 lbs per week for sustainable results</li>
                            <li>Prioritize protein to maintain muscle mass</li>
                          </ul>
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
    </ToolLayout>
  );
};

export default TDEECalculator;

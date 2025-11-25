import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GraduationCap } from "lucide-react";

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: number;
}

const GPACalculator = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "", grade: "A", credits: 3 }
  ]);
  const [gradeScale, setGradeScale] = useState<"4.0" | "5.0">("4.0");

  const gradePoints = gradeScale === "4.0" ? {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "F": 0.0
  } : {
    "A+": 5.0, "A": 5.0, "A-": 4.7,
    "B+": 4.3, "B": 4.0, "B-": 3.7,
    "C+": 3.3, "C": 3.0, "C-": 2.7,
    "D+": 2.3, "D": 2.0, "F": 0.0
  };

  const addCourse = () => {
    setCourses([...courses, {
      id: Date.now().toString(),
      name: "",
      grade: "A",
      credits: 3
    }]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = courses.reduce((sum, c) => sum + (gradePoints[c.grade as keyof typeof gradePoints] * c.credits), 0);
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return (
    <ToolLayout
      title="GPA Calculator"
      description="Calculate your Grade Point Average (GPA) easily. Supports 4.0 and 5.0 scales. Perfect for students tracking academic performance. Free GPA calculator."
      category="Calculators"
      instructions={[
        "Select GPA scale (4.0 or 5.0)",
        "Add courses with grades and credit hours",
        "Enter course names for reference",
        "View calculated GPA and credit totals"
      ]}
      relatedTools={[
        { name: "Grade Calculator", path: "/tools/grade-calculator" },
        { name: "Percentage Calculator", path: "/tools/percentage-calculator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* GPA Scale Selection */}
            <div>
              <Label>GPA Scale</Label>
              <Select value={gradeScale} onValueChange={(value: "4.0" | "5.0") => setGradeScale(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.0">4.0 Scale (US Standard)</SelectItem>
                  <SelectItem value="5.0">5.0 Scale (Weighted)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base">Courses</Label>
                <Button onClick={addCourse} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </div>

              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="grid grid-cols-12 gap-3 p-4 border rounded-lg bg-muted/30">
                    <div className="col-span-12 md:col-span-5">
                      <Input
                        placeholder="Course name (optional)"
                        value={course.name}
                        onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="col-span-6 md:col-span-3">
                      <Select
                        value={course.grade}
                        onValueChange={(value) => updateCourse(course.id, "grade", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(gradePoints).map(grade => (
                            <SelectItem key={grade} value={grade}>
                              {grade} ({gradePoints[grade as keyof typeof gradePoints].toFixed(1)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-4 md:col-span-3">
                      <Input
                        type="number"
                        placeholder="Credits"
                        value={course.credits}
                        onChange={(e) => updateCourse(course.id, "credits", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1 flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCourse(course.id)}
                        disabled={courses.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Your GPA Results</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div>
                  <span className="text-sm font-medium block text-muted-foreground">Cumulative GPA</span>
                  <span className="text-xs text-muted-foreground">
                    On {gradeScale} scale
                  </span>
                </div>
                <span className="text-4xl font-bold text-primary">
                  {gpa.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <span className="text-xs font-medium block text-muted-foreground">Total Credits</span>
                  <span className="text-2xl font-bold">{totalCredits.toFixed(1)}</span>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <span className="text-xs font-medium block text-muted-foreground">Quality Points</span>
                  <span className="text-2xl font-bold">{totalPoints.toFixed(2)}</span>
                </div>
              </div>

              {/* GPA Interpretation */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-sm mb-3">GPA Interpretation</h4>
                <div className="space-y-2 text-sm">
                  {gpa >= (gradeScale === "4.0" ? 3.7 : 4.7) && (
                    <p className="text-green-600 font-medium">🎉 Excellent! Summa Cum Laude</p>
                  )}
                  {gpa >= (gradeScale === "4.0" ? 3.3 : 4.3) && gpa < (gradeScale === "4.0" ? 3.7 : 4.7) && (
                    <p className="text-blue-600 font-medium">✨ Very Good! Magna Cum Laude</p>
                  )}
                  {gpa >= (gradeScale === "4.0" ? 3.0 : 4.0) && gpa < (gradeScale === "4.0" ? 3.3 : 4.3) && (
                    <p className="text-primary font-medium">👍 Good! Cum Laude</p>
                  )}
                  {gpa >= (gradeScale === "4.0" ? 2.0 : 3.0) && gpa < (gradeScale === "4.0" ? 3.0 : 4.0) && (
                    <p className="text-orange-600 font-medium">📚 Satisfactory - Room for improvement</p>
                  )}
                  {gpa < (gradeScale === "4.0" ? 2.0 : 3.0) && gpa > 0 && (
                    <p className="text-red-600 font-medium">⚠️ Needs Improvement - Seek academic support</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grade Scale Reference */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Grade Scale Reference ({gradeScale})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(gradePoints).map(([grade, points]) => (
                <div key={grade} className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="font-bold text-lg">{grade}</p>
                  <p className="text-sm text-muted-foreground">{points.toFixed(1)} points</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default GPACalculator;

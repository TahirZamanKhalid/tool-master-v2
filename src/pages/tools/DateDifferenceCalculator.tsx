import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Calendar, Clock, Plus, Minus, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

interface DateDifference {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalYears: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  businessDays: number;
}

interface Holiday {
  month: number;
  day: number;
  name: string;
}

const DateDifferenceCalculator = () => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("00:00");
  const [includeTime, setIncludeTime] = useState(false);
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [excludeHolidays, setExcludeHolidays] = useState(false);
  const [addDays, setAddDays] = useState<string>("");
  const [addMonths, setAddMonths] = useState<string>("");
  const [addYears, setAddYears] = useState<string>("");

  // US Federal Holidays (simplified - fixed dates)
  const usHolidays: Holiday[] = [
    { month: 1, day: 1, name: "New Year's Day" },
    { month: 7, day: 4, name: "Independence Day" },
    { month: 11, day: 11, name: "Veterans Day" },
    { month: 12, day: 25, name: "Christmas Day" },
  ];

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const isHoliday = (date: Date): boolean => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return usHolidays.some(h => h.month === month && h.day === day);
  };

  const calculateBusinessDays = (start: Date, end: Date): number => {
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      if (!isWeekend(current)) {
        if (!excludeHolidays || !isHoliday(current)) {
          count++;
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  const calculations = useMemo((): DateDifference | null => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate + (includeTime ? `T${startTime}:00` : "T00:00:00"));
    const end = new Date(endDate + (includeTime ? `T${endTime}:00` : "T00:00:00"));

    const diffMs = Math.abs(end.getTime() - start.getTime());

    // Calculate total units
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);

    // Calculate broken down units
    let tempStart = new Date(start);
    const tempEnd = new Date(end);

    let years = 0;
    let months = 0;

    // Calculate years
    while (tempStart.getFullYear() + years < tempEnd.getFullYear()) {
      const nextYear = new Date(tempStart);
      nextYear.setFullYear(nextYear.getFullYear() + years + 1);
      if (nextYear <= tempEnd) {
        years++;
      } else {
        break;
      }
    }

    // Calculate months
    tempStart = new Date(start);
    tempStart.setFullYear(tempStart.getFullYear() + years);

    while (tempStart.getMonth() + months !== tempEnd.getMonth() || tempStart.getFullYear() !== tempEnd.getFullYear()) {
      const nextMonth = new Date(tempStart);
      nextMonth.setMonth(nextMonth.getMonth() + months + 1);
      if (nextMonth <= tempEnd) {
        months++;
      } else {
        break;
      }
    }

    // Calculate remaining days
    tempStart = new Date(start);
    tempStart.setFullYear(tempStart.getFullYear() + years);
    tempStart.setMonth(tempStart.getMonth() + months);

    const remainingMs = tempEnd.getTime() - tempStart.getTime();
    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    // Calculate business days
    const businessDays = excludeWeekends || excludeHolidays
      ? calculateBusinessDays(start, end)
      : totalDays;

    // Approximate total months and years
    const totalMonths = Math.floor(totalDays / 30.44);
    const totalYears = Math.floor(totalDays / 365.25);

    return {
      years,
      months,
      weeks: Math.floor(remainingDays / 7),
      days: remainingDays % 7,
      hours: remainingHours,
      minutes: remainingMinutes,
      seconds: remainingSeconds,
      totalDays,
      totalWeeks,
      totalMonths,
      totalYears,
      totalHours,
      totalMinutes,
      totalSeconds,
      businessDays,
    };
  }, [startDate, endDate, startTime, endTime, includeTime, excludeWeekends, excludeHolidays]);

  const addToDate = () => {
    const days = parseInt(addDays) || 0;
    const months = parseInt(addMonths) || 0;
    const years = parseInt(addYears) || 0;

    const date = new Date(startDate);
    date.setDate(date.getDate() + days);
    date.setMonth(date.getMonth() + months);
    date.setFullYear(date.getFullYear() + years);

    setEndDate(date.toISOString().split("T")[0]);
    setAddDays("");
    setAddMonths("");
    setAddYears("");
  };

  const subtractFromDate = () => {
    const days = parseInt(addDays) || 0;
    const months = parseInt(addMonths) || 0;
    const years = parseInt(addYears) || 0;

    const date = new Date(startDate);
    date.setDate(date.getDate() - days);
    date.setMonth(date.getMonth() - months);
    date.setFullYear(date.getFullYear() - years);

    setEndDate(date.toISOString().split("T")[0]);
    setAddDays("");
    setAddMonths("");
    setAddYears("");
  };

  const setToToday = () => {
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
  };

  const swapDates = () => {
    const tempDate = startDate;
    const tempTime = startTime;
    setStartDate(endDate);
    setStartTime(endTime);
    setEndDate(tempDate);
    setEndTime(tempTime);
  };

  return (
    <ToolLayout title="Date Difference Calculator" description="Calculate the exact difference between two dates in years, months, days, hours and more." category="Calculators">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Date Difference Calculator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate the exact difference between two dates with multiple formats, business days, and date arithmetic
          </p>
        </div>

        {/* Date Input Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Date Selection
            </CardTitle>
            <CardDescription>
              Choose start and end dates to calculate the difference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                {includeTime && (
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                {includeTime && (
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTime"
                  checked={includeTime}
                  onCheckedChange={(checked) => setIncludeTime(checked === true)}
                />
                <Label htmlFor="includeTime" className="cursor-pointer">
                  Include time
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="excludeWeekends"
                  checked={excludeWeekends}
                  onCheckedChange={(checked) => setExcludeWeekends(checked === true)}
                />
                <Label htmlFor="excludeWeekends" className="cursor-pointer">
                  Exclude weekends (business days)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="excludeHolidays"
                  checked={excludeHolidays}
                  onCheckedChange={(checked) => setExcludeHolidays(checked === true)}
                />
                <Label htmlFor="excludeHolidays" className="cursor-pointer">
                  Exclude US holidays
                </Label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={setToToday} variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Set to Today
              </Button>
              <Button onClick={swapDates} variant="outline" size="sm">
                Swap Dates
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {calculations && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Total Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {calculations.totalDays.toLocaleString()}
                  </div>
                  <p className="text-sm opacity-90 mt-1">
                    {calculations.totalWeeks.toLocaleString()} weeks
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Total Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {calculations.totalHours.toLocaleString()}
                  </div>
                  <p className="text-sm opacity-90 mt-1">
                    {calculations.totalMinutes.toLocaleString()} minutes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Years & Months</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {calculations.years}y {calculations.months}m
                  </div>
                  <p className="text-sm opacity-90 mt-1">
                    {calculations.days}d
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium opacity-90">Business Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {calculations.businessDays.toLocaleString()}
                  </div>
                  <p className="text-sm opacity-90 mt-1">
                    {excludeWeekends ? "Excl. weekends" : "All days"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="breakdown" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                    <TabsTrigger value="totals">All Formats</TabsTrigger>
                    <TabsTrigger value="arithmetic">Date Math</TabsTrigger>
                  </TabsList>

                  <TabsContent value="breakdown" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Time Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Years:</span>
                            <span className="font-semibold">{calculations.years}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Months:</span>
                            <span className="font-semibold">{calculations.months}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weeks:</span>
                            <span className="font-semibold">{calculations.weeks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Days:</span>
                            <span className="font-semibold">{calculations.days}</span>
                          </div>
                          {includeTime && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Hours:</span>
                                <span className="font-semibold">{calculations.hours}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Minutes:</span>
                                <span className="font-semibold">{calculations.minutes}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Seconds:</span>
                                <span className="font-semibold">{calculations.seconds}</span>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Alert>
                            <Calendar className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-1">
                                <div className="font-semibold">
                                  {calculations.years > 0 && `${calculations.years} year${calculations.years !== 1 ? "s" : ""}`}
                                  {calculations.months > 0 && `, ${calculations.months} month${calculations.months !== 1 ? "s" : ""}`}
                                  {calculations.days > 0 && `, ${calculations.days} day${calculations.days !== 1 ? "s" : ""}`}
                                  {calculations.years === 0 && calculations.months === 0 && calculations.days === 0 && "Same date"}
                                </div>
                                {includeTime && (calculations.hours > 0 || calculations.minutes > 0 || calculations.seconds > 0) && (
                                  <div className="text-sm">
                                    {calculations.hours > 0 && `${calculations.hours} hour${calculations.hours !== 1 ? "s" : ""}`}
                                    {calculations.minutes > 0 && `, ${calculations.minutes} minute${calculations.minutes !== 1 ? "s" : ""}`}
                                    {calculations.seconds > 0 && `, ${calculations.seconds} second${calculations.seconds !== 1 ? "s" : ""}`}
                                  </div>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Calendar days:</span>
                              <span className="font-semibold">{calculations.totalDays.toLocaleString()}</span>
                            </div>
                            {(excludeWeekends || excludeHolidays) && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Business days:</span>
                                <span className="font-semibold">{calculations.businessDays.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Approximate years:</span>
                              <span className="font-semibold">{calculations.totalYears.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Approximate months:</span>
                              <span className="font-semibold">{calculations.totalMonths.toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="totals" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{calculations.totalYears.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Total Years (approx)</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{calculations.totalMonths.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Total Months (approx)</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{calculations.totalWeeks.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Total Weeks</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{calculations.totalDays.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Total Days</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{calculations.totalHours.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Total Hours</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{calculations.totalMinutes.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Total Minutes</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{calculations.totalSeconds.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Total Seconds</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{calculations.businessDays.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            Business Days{excludeWeekends && " (excl. weekends)"}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="arithmetic" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Add/Subtract Time</h3>
                      <Alert>
                        <Plus className="h-4 w-4" />
                        <AlertDescription>
                          Add or subtract years, months, and days from the start date to calculate a new end date
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="addYears">Years</Label>
                          <Input
                            id="addYears"
                            type="number"
                            placeholder="0"
                            value={addYears}
                            onChange={(e) => setAddYears(e.target.value)}
                            min="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="addMonths">Months</Label>
                          <Input
                            id="addMonths"
                            type="number"
                            placeholder="0"
                            value={addMonths}
                            onChange={(e) => setAddMonths(e.target.value)}
                            min="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="addDays">Days</Label>
                          <Input
                            id="addDays"
                            type="number"
                            placeholder="0"
                            value={addDays}
                            onChange={(e) => setAddDays(e.target.value)}
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={addToDate} className="flex-1">
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Start Date
                        </Button>
                        <Button onClick={subtractFromDate} variant="outline" className="flex-1">
                          <Minus className="w-4 h-4 mr-2" />
                          Subtract from Start Date
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Common Date Calculations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const date = new Date(startDate);
                            date.setDate(date.getDate() + 30);
                            setEndDate(date.toISOString().split("T")[0]);
                          }}
                        >
                          + 30 days
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const date = new Date(startDate);
                            date.setDate(date.getDate() + 90);
                            setEndDate(date.toISOString().split("T")[0]);
                          }}
                        >
                          + 90 days (3 months)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const date = new Date(startDate);
                            date.setMonth(date.getMonth() + 6);
                            setEndDate(date.toISOString().split("T")[0]);
                          }}
                        >
                          + 6 months
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const date = new Date(startDate);
                            date.setFullYear(date.getFullYear() + 1);
                            setEndDate(date.toISOString().split("T")[0]);
                          }}
                        >
                          + 1 year
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const date = new Date(startDate);
                            date.setFullYear(date.getFullYear() + 5);
                            setEndDate(date.toISOString().split("T")[0]);
                          }}
                        >
                          + 5 years
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const date = new Date(startDate);
                            date.setFullYear(date.getFullYear() + 10);
                            setEndDate(date.toISOString().split("T")[0]);
                          }}
                        >
                          + 10 years
                        </Button>
                      </div>
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

export default DateDifferenceCalculator;

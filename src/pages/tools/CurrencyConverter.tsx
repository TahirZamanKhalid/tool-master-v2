import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, RefreshCw, Star, TrendingUp, History, Calculator, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
  popular?: boolean;
}

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("PKR");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>(["USD", "EUR", "GBP", "JPY", "PKR", "INR"]);
  const [showFavorites, setShowFavorites] = useState(true);
  const [conversionHistory, setConversionHistory] = useState<
    Array<{
      from: string;
      to: string;
      amount: number;
      result: number;
      date: string;
    }>
  >([]);
  const { toast } = useToast();

  const currencies: Currency[] = [
    { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", popular: true },
    { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", popular: true },
    { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", popular: true },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", popular: true },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
    { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", popular: true },
    { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰", popular: true },
    { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "🇲🇽" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
    { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴" },
    { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
    { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
    { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦" },
    { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩" },
    { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱" },
    { code: "CZK", name: "Czech Koruna", symbol: "Kč", flag: "🇨🇿" },
    { code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "🇭🇺" },
    { code: "ILS", name: "Israeli Shekel", symbol: "₪", flag: "🇮🇱" },
    { code: "EGP", name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬" },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
    { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪" },
    { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩" },
    { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", flag: "🇱🇰" },
    { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳" },
    { code: "ARS", name: "Argentine Peso", symbol: "$", flag: "🇦🇷" },
    { code: "CLP", name: "Chilean Peso", symbol: "$", flag: "🇨🇱" },
    { code: "COP", name: "Colombian Peso", symbol: "$", flag: "🇨🇴" },
  ];

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await response.json();
      setExchangeRates(data.rates);
      setLastUpdated(new Date(data.time_last_updated * 1000).toLocaleString());
      toast({
        title: "Exchange rates updated",
        description: "Live rates have been fetched successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to fetch rates",
        description: "Using cached rates. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const convertCurrency = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || !exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return "0.00";

    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];

    const inUSD = amountNum / fromRate;
    const result = inUSD * toRate;

    // Add to history
    if (amountNum > 0) {
      const newHistory = [
        {
          from: fromCurrency,
          to: toCurrency,
          amount: amountNum,
          result: parseFloat(result.toFixed(2)),
          date: new Date().toLocaleString(),
        },
        ...conversionHistory.slice(0, 9), // Keep only last 10
      ];
      setConversionHistory(newHistory);
    }

    return result.toFixed(2);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const toggleFavorite = (currencyCode: string) => {
    setFavorites((prev) =>
      prev.includes(currencyCode) ? prev.filter((c) => c !== currencyCode) : [...prev, currencyCode],
    );
  };

  const result = convertCurrency();
  const fromCurrencyData = currencies.find((c) => c.code === fromCurrency);
  const toCurrencyData = currencies.find((c) => c.code === toCurrency);
  const fromSymbol = fromCurrencyData?.symbol || "";
  const toSymbol = toCurrencyData?.symbol || "";

  const exchangeRate =
    exchangeRates[toCurrency] && exchangeRates[fromCurrency]
      ? (exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(4)
      : "0.0000";

  const inverseExchangeRate =
    exchangeRates[fromCurrency] && exchangeRates[toCurrency]
      ? (exchangeRates[fromCurrency] / exchangeRates[toCurrency]).toFixed(4)
      : "0.0000";

  const filteredCurrencies = useMemo(() => {
    if (showFavorites) {
      return currencies.filter((currency) => favorites.includes(currency.code));
    }
    return currencies;
  }, [showFavorites, favorites]);

  const exportHistory = () => {
    const csv = conversionHistory
      .map((entry) => `${entry.amount} ${entry.from},${entry.result} ${entry.to},${entry.date}`)
      .join("\n");

    const blob = new Blob([`Amount From,Result To,Date\n${csv}`], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "currency-conversion-history.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header />
      <ToolLayout
        title="Currency Converter"
        description="Convert between 40+ world currencies with live exchange rates, historical data, and powerful features"
        category="Finance"
        instructions={[
          "Enter the amount you want to convert",
          "Select source and target currencies from 40+ options",
          "View instant conversion with live exchange rates",
          "Save favorite currencies for quick access",
          "Track your conversion history",
        ]}
        relatedTools={[
          { name: "Percentage Calculator", path: "/tools/percentage-calculator" },
          { name: "Unit Converter", path: "/tools/unit-converter" },
          { name: "Investment Calculator", path: "/tools/investment-calculator" },
        ]}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Main Converter Card */}
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-950 border-blue-200 dark:border-blue-800">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Live Currency Converter
                  </h2>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Live Rates
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchExchangeRates}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Amount to Convert
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="text-3xl h-16 border-0 bg-transparent p-0 font-bold"
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {fromCurrency}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Currency Selection */}
              <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-end">
                {/* From Currency */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">From Currency</Label>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
                    <Select value={fromCurrency} onValueChange={setFromCurrency} disabled={loading}>
                      <SelectTrigger className="h-12 border-0 bg-transparent text-lg font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-96">
                        <div className="p-2 border-b">
                          <div className="flex items-center justify-between">
                            <Label>Favorites Only</Label>
                            <Switch checked={showFavorites} onCheckedChange={setShowFavorites} />
                          </div>
                        </div>
                        {filteredCurrencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{currency.flag}</span>
                                <div>
                                  <div className="font-medium">{currency.code}</div>
                                  <div className="text-sm text-muted-foreground">{currency.name}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {currency.popular && (
                                  <Badge variant="secondary" className="text-xs">
                                    Popular
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(currency.code);
                                  }}
                                >
                                  <Star
                                    className={`h-3 w-3 ${
                                      favorites.includes(currency.code)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </Button>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Swap Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapCurrencies}
                  className="h-12 w-12 rounded-full border-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  disabled={loading}
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </Button>

                {/* To Currency */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">To Currency</Label>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
                    <Select value={toCurrency} onValueChange={setToCurrency} disabled={loading}>
                      <SelectTrigger className="h-12 border-0 bg-transparent text-lg font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-96">
                        <div className="p-2 border-b">
                          <div className="flex items-center justify-between">
                            <Label>Favorites Only</Label>
                            <Switch checked={showFavorites} onCheckedChange={setShowFavorites} />
                          </div>
                        </div>
                        {filteredCurrencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{currency.flag}</span>
                                <div>
                                  <div className="font-medium">{currency.code}</div>
                                  <div className="text-sm text-muted-foreground">{currency.name}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {currency.popular && (
                                  <Badge variant="secondary" className="text-xs">
                                    Popular
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(currency.code);
                                  }}
                                >
                                  <Star
                                    className={`h-3 w-3 ${
                                      favorites.includes(currency.code)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </Button>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Result Display */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-blue-100 dark:border-blue-900">
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Converted Amount</p>
                  <p className="text-5xl font-bold text-primary bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      `${toSymbol}${parseFloat(result).toLocaleString()} ${toCurrency}`
                    )}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Exchange Rate</p>
                      <p className="text-lg font-semibold">
                        1 {fromCurrency} = {toSymbol}
                        {exchangeRate} {toCurrency}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Inverse Rate</p>
                      <p className="text-lg font-semibold">
                        1 {toCurrency} = {fromSymbol}
                        {inverseExchangeRate} {fromCurrency}
                      </p>
                    </div>
                  </div>

                  {lastUpdated && <p className="text-xs text-muted-foreground pt-2">Last updated: {lastUpdated}</p>}
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Features */}
          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Conversion History
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Currency Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Conversions</h3>
                  {conversionHistory.length > 0 && (
                    <Button variant="outline" size="sm" onClick={exportHistory} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                  )}
                </div>
                {conversionHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No conversion history yet</p>
                    <p className="text-sm">Your conversions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversionHistory.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">
                            {currencies.find((c) => c.code === entry.from)?.flag}
                            <ArrowRightLeft className="h-4 w-4 inline mx-2" />
                            {currencies.find((c) => c.code === entry.to)?.flag}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {entry.amount.toLocaleString()} {entry.from} → {entry.result.toLocaleString()} {entry.to}
                            </p>
                            <p className="text-sm text-muted-foreground">{entry.date}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Rate: {(entry.result / entry.amount).toFixed(4)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Currency Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <span className="text-2xl">{fromCurrencyData?.flag}</span>
                      <div>
                        <p className="font-semibold">{fromCurrencyData?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {fromCurrencyData?.code} • {fromCurrencyData?.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>💡 Base currency for conversion calculations</p>
                      <p>📊 Popular global currency</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <span className="text-2xl">{toCurrencyData?.flag}</span>
                      <div>
                        <p className="font-semibold">{toCurrencyData?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {toCurrencyData?.code} • {toCurrencyData?.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>💡 Target currency for conversion</p>
                      <p>📈 Exchange rate updated in real-time</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">🌍</div>
              <h4 className="font-semibold">40+ Currencies</h4>
              <p className="text-sm text-muted-foreground">Global coverage</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold">Live Rates</h4>
              <p className="text-sm text-muted-foreground">Real-time data</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">💾</div>
              <h4 className="font-semibold">History</h4>
              <p className="text-sm text-muted-foreground">Track conversions</p>
            </Card>
          </div>
        </div>
      </ToolLayout>
    </>
  );
};

export default CurrencyConverter;

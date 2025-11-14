import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("PKR");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const { toast } = useToast();

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
    { code: "MXN", name: "Mexican Peso", symbol: "$" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$" },
    { code: "ZAR", name: "South African Rand", symbol: "R" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
    { code: "DKK", name: "Danish Krone", symbol: "kr" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
    { code: "KRW", name: "South Korean Won", symbol: "₩" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
    { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
    { code: "THB", name: "Thai Baht", symbol: "฿" },
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
    { code: "PHP", name: "Philippine Peso", symbol: "₱" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł" },
    { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
    { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
    { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
    { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
    { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
    { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
    { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
    { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
    { code: "ARS", name: "Argentine Peso", symbol: "$" },
    { code: "CLP", name: "Chilean Peso", symbol: "$" },
    { code: "COP", name: "Colombian Peso", symbol: "$" },
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

    return result.toFixed(2);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const result = convertCurrency();
  const fromSymbol = currencies.find((c) => c.code === fromCurrency)?.symbol || "";
  const toSymbol = currencies.find((c) => c.code === toCurrency)?.symbol || "";
  const exchangeRate =
    exchangeRates[toCurrency] && exchangeRates[fromCurrency]
      ? (exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(4)
      : "0.0000";

  return (
    <>
      <Header />
      <ToolLayout
        title="Currency Converter"
        description="Convert between 40+ world currencies with live exchange rates updated daily"
        category="Calculators"
        instructions={[
          "Enter the amount you want to convert",
          "Select the source and target currencies",
          "View instant conversion with live exchange rates",
          "Rates are updated automatically from global markets",
        ]}
        relatedTools={[
          { name: "Percentage Calculator", path: "/tools/percentage-calculator" },
          { name: "Unit Converter", path: "/tools/unit-converter" },
        ]}
      >
        <Card className="p-8 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="text-2xl h-16 mt-2"
                  disabled={loading}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchExchangeRates}
                disabled={loading}
                className="ml-4 mt-8"
                title="Refresh exchange rates"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
              <div>
                <Label htmlFor="from">From</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency} disabled={loading}>
                  <SelectTrigger id="from" className="h-12 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="icon" onClick={swapCurrencies} className="mb-0.5" disabled={loading}>
                <ArrowRightLeft className="h-4 w-4" />
              </Button>

              <div>
                <Label htmlFor="to">To</Label>
                <Select value={toCurrency} onValueChange={setToCurrency} disabled={loading}>
                  <SelectTrigger id="to" className="h-12 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Converted Amount</p>
                <p className="text-4xl font-bold text-primary">
                  {loading ? "Loading..." : `${toSymbol}${result} ${toCurrency}`}
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  {fromSymbol}1 {fromCurrency} = {toSymbol}
                  {exchangeRate} {toCurrency}
                </p>
                {lastUpdated && <p className="text-xs text-muted-foreground mt-2">Last updated: {lastUpdated}</p>}
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                💡 Live exchange rates powered by ExchangeRate-API. Rates are updated daily from global financial
                markets. For exact rates, please check with your bank or financial institution.
              </p>
            </div>
          </div>
        </Card>
      </ToolLayout>
    </>
  );
};

export default CurrencyConverter;

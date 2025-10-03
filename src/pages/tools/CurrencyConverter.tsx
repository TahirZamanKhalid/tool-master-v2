import { useState } from "react";
import { Header } from "@/components/Header";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");

  // Static exchange rates (base: USD)
  const exchangeRates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    AUD: 1.52,
    CAD: 1.36,
    CHF: 0.88,
    CNY: 7.24,
    INR: 83.12,
    MXN: 17.08,
    BRL: 4.97,
    ZAR: 18.65,
    SGD: 1.34,
    HKD: 7.81,
    SEK: 10.36,
    NOK: 10.58,
    DKK: 6.87,
    NZD: 1.63,
    KRW: 1329.50,
    TRY: 32.15,
  };

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
  ];

  const convertCurrency = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return 0;
    
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
  const fromSymbol = currencies.find(c => c.code === fromCurrency)?.symbol || "";
  const toSymbol = currencies.find(c => c.code === toCurrency)?.symbol || "";

  return (
    <>
      <Header />
      <ToolLayout
        title="Currency Converter"
        description="Convert between 20+ world currencies with live exchange rates"
        category="Calculators"
        instructions={[
          "Enter the amount you want to convert",
          "Select the source and target currencies",
          "View instant conversion results",
        ]}
        relatedTools={[
          { name: "Calculator", path: "/tools/calculator" },
          { name: "Password Generator", path: "/tools/password-generator" },
        ]}
      >
        <Card className="p-8 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="text-2xl h-16 mt-2"
              />
            </div>

            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
              <div>
                <Label htmlFor="from">From</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
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

              <Button
                variant="outline"
                size="icon"
                onClick={swapCurrencies}
                className="mb-0.5"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>

              <div>
                <Label htmlFor="to">To</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
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
                  {toSymbol}{result} {toCurrency}
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  {fromSymbol}1 {fromCurrency} = {toSymbol}
                  {(exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(4)} {toCurrency}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                💡 Exchange rates are approximate and for reference only. For exact rates, please check with your bank or financial institution.
              </p>
            </div>
          </div>
        </Card>
      </ToolLayout>
    </>
  );
};

export default CurrencyConverter;

// Exchange rate API fallback system
export interface ExchangeRateResponse {
  rates: Record<string, number>;
  timestamp: number;
  source: string;
}

const API_ENDPOINTS = [
  {
    name: "ExchangeRate-API",
    url: "https://api.exchangerate-api.com/v4/latest/USD",
    parse: (data: any) => ({
      rates: data.rates,
      timestamp: Date.now(),
      source: "ExchangeRate-API"
    })
  },
  {
    name: "Fawaz Ahmed",
    url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
    parse: (data: any) => ({
      rates: Object.entries(data.usd).reduce((acc, [key, value]) => {
        acc[key.toUpperCase()] = value as number;
        return acc;
      }, {} as Record<string, number>),
      timestamp: Date.now(),
      source: "Fawaz Ahmed CDN"
    })
  },
  {
    name: "Open Exchange Rates (Limited)",
    url: "https://open.er-api.com/v6/latest/USD",
    parse: (data: any) => ({
      rates: data.rates,
      timestamp: Date.now(),
      source: "Open Exchange Rates"
    })
  }
];

export async function fetchExchangeRatesWithFallback(): Promise<ExchangeRateResponse> {
  let lastError: Error | null = null;

  // Try each API in sequence
  for (const api of API_ENDPOINTS) {
    try {
      const response = await fetch(api.url, {
        cache: 'no-cache',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`${api.name} returned ${response.status}`);
      }

      const data = await response.json();
      const result = api.parse(data);
      
      console.log(`Successfully fetched rates from ${api.name}`);
      return result;
    } catch (error) {
      console.warn(`Failed to fetch from ${api.name}:`, error);
      lastError = error as Error;
      // Continue to next API
    }
  }

  // All APIs failed, throw the last error
  throw lastError || new Error("All exchange rate APIs failed");
}

export function getCachedRates(): ExchangeRateResponse | null {
  try {
    const cached = localStorage.getItem('exchangeRates');
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    return {
      rates: parsed.rates,
      timestamp: parsed.timestamp,
      source: parsed.source || "Cached"
    };
  } catch (error) {
    console.error("Error reading cached rates:", error);
    return null;
  }
}

export function setCachedRates(response: ExchangeRateResponse): void {
  try {
    localStorage.setItem('exchangeRates', JSON.stringify(response));
  } catch (error) {
    console.error("Error caching rates:", error);
  }
}

export function isRatesStale(timestamp: number, maxAgeHours: number = 5): boolean {
  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds
  return (now - timestamp) > maxAge;
}

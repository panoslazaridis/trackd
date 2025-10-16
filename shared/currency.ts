export type Currency = 'GBP' | 'EUR' | 'USD';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  countryHint: string[];
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    countryHint: ['GB', 'UK', 'United Kingdom'],
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    countryHint: ['GR', 'Greece', 'DE', 'FR', 'IT', 'ES'],
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    countryHint: ['US', 'USA', 'United States'],
  },
};

/**
 * Format a price with the appropriate currency symbol
 */
export function formatPrice(amount: number, currency: Currency): string {
  const info = CURRENCIES[currency];
  return `${info.symbol}${amount.toFixed(2)}`;
}

/**
 * Detect user's currency based on their location/country code
 * Defaults to GBP if unknown
 */
export function detectCurrency(countryCode?: string): Currency {
  if (!countryCode) return 'GBP';
  
  const upperCode = countryCode.toUpperCase();
  
  // Check EUR countries
  if (CURRENCIES.EUR.countryHint.some(hint => upperCode.includes(hint.toUpperCase()))) {
    return 'EUR';
  }
  
  // Check USD countries
  if (CURRENCIES.USD.countryHint.some(hint => upperCode.includes(hint.toUpperCase()))) {
    return 'USD';
  }
  
  // Check GBP countries
  if (CURRENCIES.GBP.countryHint.some(hint => upperCode.includes(hint.toUpperCase()))) {
    return 'GBP';
  }
  
  return 'GBP'; // Default
}

/**
 * Get price for a tier in the specified currency
 */
export function getTierPrice(
  pricing: { gbp: number; eur: number; usd: number },
  currency: Currency
): number {
  switch (currency) {
    case 'GBP':
      return pricing.gbp;
    case 'EUR':
      return pricing.eur;
    case 'USD':
      return pricing.usd;
  }
}

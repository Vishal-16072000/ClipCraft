export type PricingCurrency = "INR" | "EUR";

export interface PricingPlanInput {
  price: number;
  originalPrice: number;
  yearlyPrice: number;
  originalYearlyPrice: number;
  priceEur: number;
  originalPriceEur: number;
}

export interface ResolvedPlanPrices {
  price: number;
  originalPrice: number;
  yearlyPrice: number;
  originalYearlyPrice: number;
  symbol: string;
  locale: string;
}

export function getPricingCurrency(countryCode: string | null): PricingCurrency {
  return countryCode === "IN" ? "INR" : "EUR";
}

function deriveEurPrices(plan: PricingPlanInput): Omit<ResolvedPlanPrices, "symbol" | "locale"> {
  const priceRatio = plan.priceEur / plan.price;
  const originalRatio = plan.originalPriceEur / plan.originalPrice;

  return {
    price: plan.priceEur,
    originalPrice: plan.originalPriceEur,
    yearlyPrice: Math.round(plan.yearlyPrice * priceRatio),
    originalYearlyPrice: Math.round(plan.originalYearlyPrice * originalRatio),
  };
}

export function getPlanPrices(
  plan: PricingPlanInput,
  currency: PricingCurrency,
): ResolvedPlanPrices {
  if (currency === "INR") {
    return {
      price: plan.price,
      originalPrice: plan.originalPrice,
      yearlyPrice: plan.yearlyPrice,
      originalYearlyPrice: plan.originalYearlyPrice,
      symbol: "₹",
      locale: "en-IN",
    };
  }

  return {
    ...deriveEurPrices(plan),
    symbol: "€",
    locale: "en-IE",
  };
}

export function formatPlanAmount(amount: number, locale: string): string {
  return amount.toLocaleString(locale);
}

import { useEffect, useState } from "react";
import { getPricingCurrency, type PricingCurrency } from "../lib/pricing";

const STORAGE_KEY = "clipcraft_pricing_country";

function readCachedCountry(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function cacheCountry(country: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, country);
  } catch {
    // ignore
  }
}

export function usePricingRegion() {
  const [country, setCountry] = useState<string | null>(readCachedCountry);
  const [loading, setLoading] = useState(() => readCachedCountry() === null);

  useEffect(() => {
    if (country) return;

    let cancelled = false;

    fetch("/api/geo")
      .then((response) => response.json())
      .then((data: { country?: string }) => {
        if (cancelled) return;
        const resolved = (data.country ?? "IN").toUpperCase();
        setCountry(resolved);
        cacheCountry(resolved);
      })
      .catch(() => {
        if (cancelled) return;
        setCountry("IN");
        cacheCountry("IN");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [country]);

  const currency: PricingCurrency = getPricingCurrency(country);

  return { country, currency, loading };
}

/** Production site origin for auth redirects (must include https://). */
function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Canonical app origin for Supabase email/OAuth/password-reset redirects.
 * Prefer VITE_SITE_URL in production so links never point at localhost.
 */
export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (fromEnv) {
    return normalizeSiteUrl(fromEnv);
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

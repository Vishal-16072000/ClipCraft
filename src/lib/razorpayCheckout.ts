let razorpayScriptLoading: Promise<void> | null = null;

export async function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") return;

  if (window.Razorpay) return;

  if (!razorpayScriptLoading) {
    razorpayScriptLoading = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-razorpay="checkout"]',
      );
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Razorpay script failed.")));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.dataset.razorpay = "checkout";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Razorpay script failed."));
      document.body.appendChild(script);
    });
  }

  return razorpayScriptLoading;
}

export type RazorpayCheckoutHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}


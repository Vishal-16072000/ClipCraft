import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { pricingPlans, pricingSection, pricingMicrocopy } from "../../data/content";
import { SectionHeader } from "../ui/SectionHeader";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { loadRazorpayCheckoutScript, type RazorpayCheckoutHandlerResponse } from "../../lib/razorpayCheckout";

export function Pricing() {
  const [yearly, setYearly] = useState(false);
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [checkoutLoadingPlanId, setCheckoutLoadingPlanId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const billingCycle = yearly ? "yearly" : "monthly";

  const planById = useMemo(() => {
    return new Map(pricingPlans.map((p) => [p.id, p]));
  }, []);

  async function verifyPaymentAndRedirect(
    response: RazorpayCheckoutHandlerResponse,
  ) {
    if (!session?.access_token) {
      throw new Error("Missing session access token. Please sign in again.");
    }

    const verifyRes = await fetch("/api/razorpay/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      }),
    });

    const verifyJson = (await verifyRes.json().catch(() => null)) as
      | { success?: boolean; error?: string }
      | null;

    if (!verifyRes.ok || !verifyJson?.success) {
      throw new Error(verifyJson?.error ?? "Payment verification failed.");
    }

    navigate("/dashboard");
  }

  async function startCheckout(
    planId: string,
    billingCycleOverride?: "monthly" | "yearly",
  ) {
    const effectiveBillingCycle = billingCycleOverride ?? billingCycle;
    if (checkoutLoadingPlanId) return;
    setCheckoutError(null);

    if (!user || !session?.access_token) {
      localStorage.setItem(
        "clipcraft_pending_subscription",
        JSON.stringify({ planId, billingCycle: effectiveBillingCycle }),
      );
      navigate("/signin", { state: { from: "/#pricing" } });
      return;
    }

    const plan = planById.get(planId);
    if (!plan) {
      setCheckoutError("Invalid plan selected.");
      return;
    }

    setCheckoutLoadingPlanId(planId);
    try {
      const createRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planId, billingCycle: effectiveBillingCycle }),
      });

      const createText = await createRes.text().catch(() => "");
      const createJson = (() => {
        try {
          return (createText ? JSON.parse(createText) : null) as
            | { success?: boolean; error?: string; orderId?: string; amountInPaise?: number; currency?: string; keyId?: string }
            | null;
        } catch {
          return null;
        }
      })();

      if (
        !createRes.ok ||
        !createJson?.success ||
        !createJson.orderId ||
        !createJson.amountInPaise ||
        !createJson.currency ||
        !createJson.keyId
      ) {
        const statusHint = createRes.ok ? "" : ` (HTTP ${createRes.status})`;
        throw new Error(createJson?.error ?? (createText ? `Could not start Razorpay checkout${statusHint}.` : `Could not start Razorpay checkout${statusHint}.`));
      }

      await loadRazorpayCheckoutScript();

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not available. Please try again.");
      }

      const checkoutOptions: Record<string, unknown> = {
        key: createJson.keyId,
        amount: createJson.amountInPaise,
        currency: createJson.currency,
        name: "ClipCraft",
        description: `${plan.name} plan · ${
          effectiveBillingCycle === "yearly" ? "Annual" : "Monthly"
        } billing`,
        order_id: createJson.orderId,
        prefill: { email: user.email ?? "" },
        handler: async (response: RazorpayCheckoutHandlerResponse) => {
          try {
            await verifyPaymentAndRedirect(response);
          } catch (e) {
            const message = e instanceof Error ? e.message : "Payment verification failed.";
            setCheckoutError(message);
          }
        },
        theme: { color: "#7C3AED" },
      };

      const rzp = new window.Razorpay(checkoutOptions);
      rzp.open();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not start payment.";
      setCheckoutError(message);
    } finally {
      setCheckoutLoadingPlanId(null);
    }
  }

  useEffect(() => {
    if (!user) return;

    try {
      const raw = localStorage.getItem("clipcraft_pending_subscription");
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        planId?: string;
        billingCycle?: string;
      };

      if (!parsed.planId || !parsed.billingCycle) return;

      localStorage.removeItem("clipcraft_pending_subscription");

      // Start checkout based on stored billing cycle.
      window.setTimeout(() => {
        startCheckout(
          parsed.planId as string,
          parsed.billingCycle === "yearly" ? "yearly" : "monthly",
        ).catch(() => undefined);
      }, 0);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <section id="pricing" className="section-padding bg-surface-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={pricingSection.label}
          title={pricingSection.title}
          description={pricingSection.description}
        />

        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-1 glass rounded-full p-1.5 border border-white/10">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                !yearly
                  ? "bg-white text-surface-900 shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {pricingMicrocopy.monthly}
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                yearly
                  ? "bg-white text-surface-900 shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {pricingMicrocopy.yearly}
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  yearly ? "bg-brand-100 text-brand-700" : "bg-accent-500/20 text-accent-400"
                }`}
              >
                {pricingMicrocopy.yearlyBadge}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
          {checkoutError && (
            <div className="sm:col-span-2 xl:col-span-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {checkoutError}
            </div>
          )}
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? "bg-linear-to-b from-brand-600/25 via-brand-900/20 to-surface-900 border-2 border-brand-500/50 glow-brand scale-[1.02] z-10"
                  : "glass border border-white/10 hover:border-white/20 hover:-translate-y-1"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-surface-900 text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    {pricingMicrocopy.popularBadge}
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="mt-6 pb-6 border-b border-white/10">
                {plan.yearlyPrice && yearly ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold text-white tracking-tight">
                        ₹{Math.round(plan.yearlyPrice / 12).toLocaleString("en-IN")}
                      </span>
                      <span className="text-gray-500 text-sm">/mo</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ₹{plan.yearlyPrice.toLocaleString("en-IN")}/yr billed annually
                    </p>
                  </>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-white tracking-tight">
                      ₹{plan.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                )}
              </div>

              <ul className="mt-6 space-y-3.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 block text-center font-bold py-3.5 rounded-xl transition-all ${
                  plan.popular
                    ? "bg-white text-surface-900 hover:bg-gray-100 shadow-lg"
                    : "glass hover:bg-white/10 text-white border border-white/10"
                }`}
                onClick={() => startCheckout(plan.id, billingCycle)}
                disabled={checkoutLoadingPlanId === plan.id}
              >
                {checkoutLoadingPlanId === plan.id ? "Processing..." : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Check } from "lucide-react";
import { pricingPlans } from "../../data/content";

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-brand-400 font-semibold text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Plans for Every Creator
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            Transparent INR pricing. No hidden fees. Cancel anytime.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 glass rounded-full p-1.5">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !yearly
                  ? "bg-brand-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                yearly
                  ? "bg-brand-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs text-accent-400">2 mo free</span>
            </button>
          </div>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col ${
                plan.popular
                  ? "bg-gradient-to-b from-brand-600/20 to-surface-800 border-2 border-brand-500/50 glow-brand"
                  : "glass"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-brand-500 to-accent-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
              </div>

              <div className="mt-6">
                {plan.yearlyPrice && yearly ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold text-white">
                        ₹{Math.round(plan.yearlyPrice / 12).toLocaleString("en-IN")}
                      </span>
                      <span className="text-gray-500">/mo</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ₹{plan.yearlyPrice.toLocaleString("en-IN")}/year billed
                      annually
                    </p>
                  </>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-white">
                      ₹{plan.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-gray-500">/mo</span>
                  </div>
                )}
              </div>

              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-brand-400 shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className={`mt-8 block text-center font-semibold py-3.5 rounded-xl transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-600/25"
                    : "glass hover:bg-white/10 text-white"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

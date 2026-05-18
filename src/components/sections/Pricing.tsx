import { useState } from "react";
import { Check } from "lucide-react";
import { pricingPlans } from "../../data/content";
import { SectionHeader } from "../ui/SectionHeader";

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="section-padding bg-surface-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Pricing"
          title="Plans that scale with your content"
          description="Transparent monthly pricing. No hidden fees. Upgrade, downgrade, or cancel anytime."
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
              Monthly
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
              Yearly
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  yearly ? "bg-brand-100 text-brand-700" : "bg-accent-500/20 text-accent-400"
                }`}
              >
                2 mo free
              </span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-b from-brand-600/25 via-brand-900/20 to-surface-900 border-2 border-brand-500/50 glow-brand scale-[1.02] z-10"
                  : "glass border border-white/10 hover:border-white/20 hover:-translate-y-1"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-surface-900 text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most popular
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

              <a
                href="#cta"
                className={`mt-8 block text-center font-bold py-3.5 rounded-xl transition-all ${
                  plan.popular
                    ? "bg-white text-surface-900 hover:bg-gray-100 shadow-lg"
                    : "glass hover:bg-white/10 text-white border border-white/10"
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

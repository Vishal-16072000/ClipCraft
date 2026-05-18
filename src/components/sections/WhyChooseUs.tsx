import { whyChooseUs, competitors } from "../../data/content";
import { SectionHeader } from "../ui/SectionHeader";
import { FeatureIcon } from "../ui/FeatureIcon";
import { X } from "lucide-react";

export function WhyChooseUs() {
  return (
    <section id="why-us" className="section-padding bg-surface-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          <div>
            <SectionHeader
              align="left"
              label="Why ClipCraft"
              title="Your editing team — without hiring one"
              description="We combine agency-grade post-production with SaaS reliability. One subscription replaces freelancers, chaos, and 10-hour timelines."
            />

            <div className="mt-10 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                What you&apos;re replacing
              </p>
              {competitors.map((c) => (
                <div
                  key={c.name}
                  className="flex items-start gap-3 glass rounded-xl px-4 py-3 border border-white/5"
                >
                  <X className="h-4 w-4 text-red-400/80 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <span className="text-white font-medium">{c.name}</span>
                    <span className="text-gray-500"> — {c.issue}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {whyChooseUs.map((item) => (
              <article
                key={item.title}
                className="group glass rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-brand-500/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/15 text-brand-400 group-hover:bg-brand-600/25 transition-colors">
                    <FeatureIcon name={item.icon} className="w-6 h-6" />
                  </div>
                  <span className="font-display text-sm font-bold text-brand-400/80">
                    {item.stat}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

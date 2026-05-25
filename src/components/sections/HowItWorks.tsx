import { processSteps, howItWorksSection } from "../../data/content";
import { SectionHeader } from "../ui/SectionHeader";
import { FeatureIcon } from "../ui/FeatureIcon";
import { ArrowRight } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="process" className="section-padding relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={howItWorksSection.label}
          title={howItWorksSection.title}
          description={howItWorksSection.description}
        />

        <div className="mt-16 grid md:grid-cols-3 gap-6 lg:gap-8">
          {processSteps.map((item, index) => (
            <div key={item.step} className="relative group">
              {index < processSteps.length - 1 && (
                <div className="hidden md:flex absolute top-14 -right-4 lg:-right-6 z-10 text-brand-500/40">
                  <ArrowRight className="h-6 w-6" />
                </div>
              )}
              <div className="glass rounded-3xl p-8 h-full hover:bg-white/[0.06] transition-all duration-300 border border-white/5 hover:border-brand-500/20 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600/30 to-brand-500/10 text-brand-300 group-hover:from-brand-600/40 transition-colors">
                    <FeatureIcon name={item.icon} className="w-7 h-7" />
                  </div>
                  <span className="font-display text-5xl font-bold text-white/[0.04] group-hover:text-brand-500/15 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-gray-400 leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="mt-12 text-center">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-semibold text-sm transition-colors"
          >
            {howItWorksSection.cta}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div> */}
      </div>
    </section>
  );
}

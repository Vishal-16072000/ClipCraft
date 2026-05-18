import { howItWorks } from "../../data/content";
import { FeatureIcon } from "../ui/FeatureIcon";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-brand-400 font-semibold text-sm uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Shoot. Upload. Publish.
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            Three steps between you and professionally edited content — no
            editing skills required.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {howItWorks.map((item, index) => (
            <div key={item.step} className="relative group">
              {index < howItWorks.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-500/50 to-transparent" />
              )}
              <div className="glass rounded-3xl p-8 h-full hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/20 text-brand-400 group-hover:bg-brand-600/30 transition-colors">
                    <FeatureIcon name={item.icon} className="w-7 h-7" />
                  </div>
                  <span className="font-display text-5xl font-bold text-white/5 group-hover:text-brand-500/20 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

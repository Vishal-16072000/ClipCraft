import { founder } from "../../data/content";
import { SectionHeader } from "../ui/SectionHeader";
import { Check } from "lucide-react";

export function Founder() {
  return (
    <section id="founder" className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-strong border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-accent-500/5" />
          <div className="relative grid lg:grid-cols-5 gap-10 lg:gap-16 p-8 sm:p-12 lg:p-16 items-center">
            <div className="lg:col-span-2 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="relative">
                <div className="h-36 w-36 sm:h-44 sm:w-44 rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 flex items-center justify-center font-display text-4xl font-bold text-white shadow-2xl shadow-brand-600/30">
                  {founder.avatar}
                </div>
                <div className="absolute -bottom-2 -right-2 glass rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  Founder-led QA
                </div>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold text-white">
                {founder.name}
              </h3>
              <p className="text-brand-400 font-medium">{founder.title}</p>
            </div>

            <div className="lg:col-span-3">
              <SectionHeader
                align="left"
                label="From the founder"
                title="Built by an editor who got tired of creator burnout"
              />
              <p className="mt-6 text-gray-400 text-lg leading-relaxed">
                {founder.bio}
              </p>
              <ul className="mt-8 space-y-3">
                {founder.credentials.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/20">
                      <Check className="h-3.5 w-3.5 text-brand-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import {
  trustMetrics,
  clientLogos,
  testimonials,
  trustSection,
} from "../../data/content";
import { SectionHeader } from "../ui/SectionHeader";
import { Quote, Star } from "lucide-react";

export function Trust() {
  const logos = [...clientLogos, ...clientLogos];

  return (
    <section className="section-padding border-y border-white/5 bg-surface-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={trustSection.label}
          title={trustSection.title}
          description={trustSection.description}
        />

        <div className="mt-14 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface-900 to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee w-max gap-12 items-center">
            {logos.map((logo, i) => (
              <span
                key={`${logo}-${i}`}
                className="font-display text-lg sm:text-xl font-semibold text-white/20 hover:text-white/40 transition-colors whitespace-nowrap"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trustMetrics.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-6 text-center hover:bg-white/[0.05] transition-colors"
            >
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((t) => (
            <div
              key={t.name}
              className="glass rounded-2xl p-6 hover:bg-white/[0.05] transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <Quote className="h-6 w-6 text-brand-500/40 mb-3" />
              <p className="text-gray-300 text-sm leading-relaxed italic flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center justify-between gap-4 pt-5 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg shrink-0">
                  {t.metric}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

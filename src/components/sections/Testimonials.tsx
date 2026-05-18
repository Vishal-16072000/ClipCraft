import { Quote } from "lucide-react";
import { testimonials } from "../../data/content";

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32 bg-surface-800/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-brand-400 font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white">
            Creators Love ClipCraft
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            Real feedback from creators who got their time back.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass rounded-3xl p-8 flex flex-col hover:bg-white/[0.07] transition-colors"
            >
              <Quote className="h-8 w-8 text-brand-500/50 mb-4" />
              <p className="text-gray-300 leading-relaxed flex-1 italic">
                "{t.quote}"
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-display font-bold text-white text-sm">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

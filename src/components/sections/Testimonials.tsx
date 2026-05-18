import { Quote, Star } from "lucide-react";
import { testimonials } from "../../data/content";
import { SectionHeader } from "../ui/SectionHeader";

export function Testimonials() {
  return (
    <section id="testimonials" className="section-padding border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Social proof"
          title="Creators who stopped editing, started growing"
          description="Real results from YouTubers, coaches, and agencies shipping more content with less burnout."
        />

        <div className="mt-14 grid md:grid-cols-2 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass rounded-2xl p-7 sm:p-8 flex flex-col hover:bg-white/[0.05] transition-all hover:-translate-y-0.5 border border-white/5"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  {t.metric}
                </span>
              </div>
              <Quote className="h-7 w-7 text-brand-500/30 mb-3" />
              <p className="text-gray-300 leading-relaxed flex-1 text-[15px]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-4 pt-6 border-t border-white/5">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-display font-bold text-white text-sm shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

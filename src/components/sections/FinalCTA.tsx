import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Clock, Zap } from "lucide-react";
import { finalCta } from "../../data/content";

export function FinalCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="cta" className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-600 to-accent-600" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-20 lg:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm text-white/90 mb-6">
                <Clock className="h-4 w-4" />
                <span>{finalCta.badge}</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                {finalCta.headline}
              </h2>
              <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
                {finalCta.subheadline}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {finalCta.perks[0]}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {finalCta.perks[1]}
                </span>
              </div>

              {submitted ? (
                <div className="mt-10 glass rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
                  <CheckCircle2 className="h-12 w-12 text-white mx-auto mb-4" />
                  <p className="font-display text-xl font-bold text-white">
                    {finalCta.successTitle}
                  </p>
                  <p className="mt-2 text-white/80 text-sm">
                    We&apos;ll reach out at {email}. {finalCta.successMessage}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={finalCta.placeholder}
                    className="flex-1 rounded-2xl bg-white/10 border border-white/25 px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-2xl hover:bg-white/95 transition-colors shrink-0"
                  >
                    {finalCta.cta}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </form>
              )}

              <p className="mt-6 text-xs text-white/50">{finalCta.disclaimer}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

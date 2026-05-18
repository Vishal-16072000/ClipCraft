import { features, competitors } from "../../data/content";
import { FeatureIcon } from "../ui/FeatureIcon";
import { X, Check } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-surface-800/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <span className="text-brand-400 font-semibold text-sm uppercase tracking-wider">
              Why ClipCraft
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white">
              Netflix for Video Editing
            </h2>
            <p className="mt-4 text-gray-400 text-lg leading-relaxed">
              Freelancer chaos → predictable monthly subscription. You know
              exactly what you get: same quality, same style, guaranteed
              delivery.
            </p>

            <div className="mt-10 space-y-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Others can't match this
              </p>
              {competitors.map((c) => (
                <div
                  key={c.name}
                  className="flex items-start gap-3 glass rounded-xl px-4 py-3"
                >
                  <X className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-medium">{c.name}</span>
                    <span className="text-gray-500"> — {c.issue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-colors group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/20 text-brand-400 mb-4 group-hover:scale-110 transition-transform">
                  <FeatureIcon name={feature.icon} />
                </div>
                <h3 className="font-display font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 glass rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-500/20">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display text-xl font-bold text-white">
              India-first. Creator-first.
            </h3>
            <p className="mt-2 text-gray-400">
              INR pricing, Hindi/regional language support, UPI payments, and
              editors who understand Indian creator culture. Built for you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/20 via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm text-brand-300 mb-6">
              <Sparkles className="h-4 w-4" />
              <span>India's #1 Managed Video Editing Platform</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              Stop Editing.{" "}
              <span className="text-gradient">Start Creating.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-xl">
              Upload your raw footage. Get professionally edited videos in 48
              hours — with a dedicated editor who knows your style. No Fiverr
              chaos. No DIY stress.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="#waitlist"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-brand-600/30 hover:shadow-brand-500/40 glow-brand"
              >
                Join Early Access
                <ArrowRight className="h-5 w-5" />
              </a>
              <Link
                to="/upload"
                className="inline-flex items-center justify-center gap-2 glass hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all"
              >
                Try Upload Portal
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Starting at{" "}
              <span className="text-brand-400 font-semibold">₹999/month</span> ·
              48hr turnaround · Cancel anytime
            </p>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden glass-strong glow-brand aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-br from-surface-700 via-surface-800 to-surface-900" />
              <div className="absolute inset-0 flex flex-col">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/20">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    clipcraft.in/upload
                  </span>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-surface-600/50 p-4 border border-white/5">
                      <div className="text-xs text-gray-500 mb-2">Raw Footage</div>
                      <div className="h-20 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <span className="text-2xl opacity-50">📹</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-brand-600/20 p-4 border border-brand-500/30">
                      <div className="text-xs text-brand-300 mb-2">Edited ✨</div>
                      <div className="h-20 rounded-lg bg-gradient-to-br from-brand-600/40 to-accent-500/30 flex items-center justify-center">
                        <span className="text-2xl">🎬</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-surface-600 overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 animate-pulse" />
                    </div>
                    <span className="text-xs text-brand-400 font-medium">
                      Editing...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-3 shadow-xl">
              <div className="text-2xl font-display font-bold text-white">48hr</div>
              <div className="text-xs text-gray-400">Delivery Guarantee</div>
            </div>
            <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 shadow-xl">
              <div className="text-2xl font-display font-bold text-accent-400">
                50%
              </div>
              <div className="text-xs text-gray-400">Gross Margin</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

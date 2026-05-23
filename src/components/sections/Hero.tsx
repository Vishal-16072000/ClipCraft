import { ArrowRight, Play, Sparkles, Star, TrendingUp, UploadCloud, Wand2 } from "lucide-react";
import { heroContent, heroMicrocopy, audienceTags } from "../../data/content";

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-28 pb-16 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 mesh-gradient" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/15 rounded-full blur-[120px] -z-10 animate-pulse-glow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2.5 rounded-full glass px-4 py-2 text-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <span className="text-gray-300">{heroContent.badge}</span>
              <span className="flex items-center gap-0.5 text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span className="text-xs font-semibold">4.9</span>
              </span>
            </div>

            <h1 className="font-display text-[2.5rem] sm:text-5xl lg:text-6xl xl:text-[4rem] font-extrabold text-white leading-[1.05] tracking-tight">
              {heroContent.headline}{" "}
              <span className="text-gradient-accent block sm:inline ">
                {heroContent.headlineAccent}
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-xl">
              {heroContent.subheadline}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {audienceTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-gray-500 glass rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up-delay-2">
              <a
                href="#pricing"
                className="group inline-flex items-center justify-center gap-2 bg-white text-surface-900 font-bold px-8 py-4 rounded-2xl transition-all hover:bg-gray-100 shadow-[0_0_40px_-8px_rgba(255,255,255,0.4)]"
              >
                {heroContent.primaryCta}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#portfolio"
                className="inline-flex items-center justify-center gap-2 glass hover:bg-white/[0.08] text-white font-semibold px-8 py-4 rounded-2xl transition-all"
              >
                <Play className="h-4 w-4 fill-current" />
                {heroContent.secondaryCta}
              </a>
            </div>

            <p className="mt-6 text-sm text-gray-500 animate-fade-up-delay-3">
              {heroContent.proofLine}
            </p>
          </div>

          <div className="relative animate-fade-up-delay-1 lg:pl-4">
            <div className="relative glass-strong rounded-3xl overflow-hidden glow-brand border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-accent-500/5 pointer-events-none" />
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/30">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-[11px] text-gray-500 ml-2 font-mono">
                  dashboard.clipcraft.in
                </span>
                <span className="ml-auto text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10">
                  {heroMicrocopy.dashboardStatus}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">{heroMicrocopy.activeProjects}</p>
                    <p className="font-display text-2xl font-bold text-white">3</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{heroMicrocopy.nextDelivery}</p>
                    <p className="font-display text-lg font-bold text-brand-300">18h</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
                    <div className="rounded-2xl border border-white/10 bg-surface-900/70 p-4">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-gray-300">
                          <UploadCloud className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-gray-500">
                            Raw footage
                          </p>
                          <p className="text-sm font-semibold text-white">12 clips uploaded</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {[72, 54, 86].map((width, index) => (
                          <div key={width} className="rounded-xl bg-white/[0.04] p-2">
                            <div className="flex items-center gap-1.5">
                              <span className="h-8 w-5 rounded-md bg-surface-700" />
                              <div className="min-w-0 flex-1">
                                <div
                                  className="h-2 rounded-full bg-gray-500/50"
                                  style={{ width: `${width}%` }}
                                />
                                <div className="mt-1 h-1.5 w-1/2 rounded-full bg-gray-700" />
                              </div>
                              <span className="text-[10px] text-gray-600">0{index + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-400/30 bg-brand-600/20 text-brand-200 shadow-[0_0_40px_-10px_rgba(124,58,237,0.8)]">
                        <Wand2 className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-emerald-200/70">
                            Viral-ready output
                          </p>
                          <p className="text-sm font-semibold text-white">Final edit ready</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-end gap-1.5">
                          {[38, 62, 45, 88, 72, 96].map((height) => (
                            <span
                              key={height}
                              className="w-full rounded-t bg-gradient-to-t from-emerald-500 to-brand-300"
                              style={{ height: `${height}px` }}
                            />
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[10px]">
                          <span className="text-gray-500">Hook score</span>
                          <span className="font-bold text-emerald-300">94%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-surface-900/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-wide text-gray-500">
                        ClipCraft editing layer
                      </p>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                        <TrendingUp className="h-3 w-3" />
                        Retention-first
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {["Hook rewrite", "Pacing cut", "Captions + sound"].map((step) => (
                        <div
                          key={step}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-300"
                        >
                          <span className="mr-2 text-emerald-300">✓</span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 glass rounded-xl p-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    SK
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium">Your editor · Sameep</p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {heroMicrocopy.editorStatus}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-brand-300 bg-brand-500/15 px-2 py-1 rounded-lg shrink-0">
                    {heroMicrocopy.reviewCta}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-2 sm:-left-6 glass rounded-2xl px-5 py-3.5 shadow-2xl animate-float border border-white/10">
              <p className="font-display text-2xl font-bold text-white">{heroMicrocopy.floatSpeed}</p>
              <p className="text-xs text-gray-400">{heroMicrocopy.floatSpeedLabel}</p>
            </div>
            <div className="absolute -top-4 -right-2 sm:-right-6 glass rounded-2xl px-5 py-3.5 shadow-2xl animate-float-delayed border border-white/10">
              <p className="font-display text-2xl font-bold text-emerald-400">{heroMicrocopy.floatRetention}</p>
              <p className="text-xs text-gray-400">{heroMicrocopy.floatRetentionLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

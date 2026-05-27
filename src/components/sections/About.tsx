import { SectionHeader } from "../ui/SectionHeader";

export function About() {
  return (
    <section id="about" className="section-padding bg-surface-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <SectionHeader
              align="left"
              label="About"
              title="A small team obsessed with retention"
              description="ClipCraft is built for creators who want consistent, scroll-stopping edits without the timeline grind."
            />

            <div className="mt-8 space-y-3 text-sm text-gray-400 leading-relaxed">
              <p>
                We work like an extension of your content team: briefs in, edits
                out, feedback loop tight.
              </p>
              <p>
                Every cut is optimized for hooks, pacing, and clarity—so your
                content performs, not just looks good.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "Speed with structure",
                desc: "Clear workflow, fast turnarounds, fewer revisions.",
              },
              {
                title: "Hook-first edits",
                desc: "Retention cues, pattern interrupts, tight storytelling.",
              },
              {
                title: "Creator-native",
                desc: "Reels, Shorts, podcasts, ads—platform-ready delivery.",
              },
              {
                title: "One place to ship",
                desc: "Upload, track, review—everything stays organized.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="glass rounded-2xl p-6 border border-white/5 hover:bg-white/5 transition-colors"
              >
                <h3 className="font-display text-base font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


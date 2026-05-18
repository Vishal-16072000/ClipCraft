import { useState } from "react";
import { Play, Eye } from "lucide-react";
import {
  portfolioCategories,
  portfolioItems,
  type PortfolioCategory,
} from "../../data/content";
import { SectionHeader } from "../ui/SectionHeader";

export function Portfolio() {
  const [active, setActive] = useState<PortfolioCategory>("All");

  const filtered =
    active === "All"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === active);

  return (
    <section id="portfolio" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-brand-900/5 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Portfolio"
          title="Edits that perform on every platform"
          description="Reel-style previews from real client work — hooks, pacing, and polish built for retention."
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {portfolioCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active === cat
                  ? "bg-white text-surface-900 shadow-lg"
                  : "glass text-gray-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="group relative aspect-[9/14] rounded-2xl overflow-hidden glass border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_48px_-12px_rgba(124,58,237,0.25)]"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} transition-transform duration-700 group-hover:scale-105`}
              />
              <div className="absolute inset-0 reel-scanline opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="h-14 w-14 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
                  <Play className="h-6 w-6 fill-white text-white ml-1" />
                </div>
              </div>

              <div className="absolute top-4 left-4">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white/90 border border-white/10"
                  style={{ borderColor: `${item.accent}40` }}
                >
                  {item.category}
                </span>
              </div>

              <div className="absolute bottom-0 inset-x-0 p-5">
                <p className="font-display font-semibold text-white text-lg">
                  {item.title}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">{item.client}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-300">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{item.views} views</span>
                </div>
              </div>

              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)` }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

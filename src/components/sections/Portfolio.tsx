import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Eye } from "lucide-react";
import {
  portfolioCategories,
  portfolioItems,
  portfolioSection,
} from "../../data/content";
import { SectionHeader } from "../ui/SectionHeader";

export function Portfolio() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const hoverRef = useRef(false);
  const draggingRef = useRef(false);
  const pausedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const marqueeBase = Array.from({ length: 4 }, () => portfolioItems).flat();
  const marqueeItems = [...marqueeBase, ...marqueeBase];

  useEffect(() => {
    let frameId = 0;
    let lastTimestamp = 0;
    const pixelsPerSecond = 22;

    function tick(timestamp: number) {
      const scroller = scrollerRef.current;

      if (scroller) {
        const delta = lastTimestamp ? timestamp - lastTimestamp : 0;

        if (!pausedRef.current && delta > 0) {
          scroller.scrollLeft += (delta / 1000) * pixelsPerSecond;

          const loopPoint = scroller.scrollWidth / 2;
          if (loopPoint > 0 && scroller.scrollLeft >= loopPoint) {
            scroller.scrollLeft -= loopPoint;
          }
        }
      }

      lastTimestamp = timestamp;
      frameId = window.requestAnimationFrame(tick);
    }

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function syncPauseState() {
    pausedRef.current = hoverRef.current || draggingRef.current;
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    draggingRef.current = true;
    syncPauseState();
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = scroller.scrollLeft;
    scroller.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const scroller = scrollerRef.current;
    if (!scroller || !draggingRef.current) return;

    event.preventDefault();
    scroller.scrollLeft = dragStartScrollLeftRef.current - (event.clientX - dragStartXRef.current);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const scroller = scrollerRef.current;
    draggingRef.current = false;
    syncPauseState();
    scroller?.releasePointerCapture(event.pointerId);
  }

  return (
    <section id="portfolio" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-brand-900/5 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={portfolioSection.label}
          title={portfolioSection.title}
          description={portfolioSection.description}
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {portfolioCategories.map((cat) => (
            <span
              key={cat}
              className="glass rounded-full px-4 py-2 text-sm font-medium text-gray-400"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="relative mt-12 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface-950 to-transparent sm:w-28" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface-950 to-transparent sm:w-28" />
          <div
            ref={scrollerRef}
            className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
            onMouseEnter={() => {
              hoverRef.current = true;
              syncPauseState();
            }}
            onMouseLeave={() => {
              hoverRef.current = false;
              syncPauseState();
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="flex w-max gap-5">
              {marqueeItems.map((item, index) => {
                const videoUrl = (item as { videoUrl?: string }).videoUrl;

                return (
                  <article
                    key={`${item.id}-${index}`}
                    className="group/card relative aspect-[9/14] w-[min(72vw,18rem)] shrink-0 rounded-2xl overflow-hidden glass border border-white/10 hover:border-white/20 transition-all duration-1000 hover:-translate-y-2 hover:shadow-[0_24px_48px_-12px_rgba(124,58,237,0.25)] sm:w-72 lg:w-80"
                  >
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${item.gradient} transition-transform duration-700 group-hover/card:scale-105`}
                      />
                    )}
                    <div className="absolute inset-0 reel-scanline opacity-40 group-hover/card:opacity-70 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

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
                      className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)` }}
                    />
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

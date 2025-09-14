"use client";

import React, { useEffect, useRef, useState } from "react";

const logos = [
  { name: "Acme", path: "/vercel.svg" },
  { name: "Globex", path: "/next.svg" },
  { name: "Umbrella", path: "/globe.svg" },
  { name: "Soylent", path: "/window.svg" },
  { name: "Initech", path: "/file.svg" },
];

const palettes: [string, string][] = [
  ["#6366F1", "#22D3EE"], // indigo -> cyan
  ["#F472B6", "#FB7185"], // pink -> rose
  ["#34D399", "#60A5FA"], // emerald -> blue
  ["#F59E0B", "#F472B6"], // amber -> pink
  ["#10B981", "#4F46E5"], // green -> indigo
];

export default function BrandMarquee() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [duration, setDuration] = useState<number>(20);

  // Respect reduced motion and start animation only when visible
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPref = () => setReduced(mq.matches);
    onPref();
    mq.addEventListener?.("change", onPref);

    const el = containerRef.current;
    if (el) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) setActive(e.isIntersecting);
        },
        { threshold: 0, rootMargin: "0px 0px -10% 0px" }
      );
      io.observe(el);
      return () => {
        io.disconnect();
        mq.removeEventListener?.("change", onPref);
      };
    }
    return () => mq.removeEventListener?.("change", onPref);
  }, []);

  // Measure loop width and compute duration based on px/sec speed
  useEffect(() => {
    const measure = () => {
      const loop = loopRef.current;
      if (!loop) return;
      const loopWidth = loop.scrollWidth; // width of one copy
      const speed = window.innerWidth < 768 ? 80 : 120; // px per second
      const d = Math.max(12, +(loopWidth / speed).toFixed(2));
      setDuration(d);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (loopRef.current) ro.observe(loopRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  return (
    <section className="py-10 border-y border-border/50 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-muted-foreground mb-6">
          Trusted by teams that lead their markets
        </div>
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={
            {
              maskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            } as React.CSSProperties
          }
        >
          <div
            className={
              "flex gap-10 items-center will-change-transform " +
              (active && !reduced
                ? "[animation:marquee_var(--marquee-duration)_linear_infinite] hover:[animation-play-state:paused]"
                : "")
            }
            style={{ ["--marquee-duration" as any]: `${duration}s` }}
          >
            <div ref={loopRef} className="flex gap-10 items-center shrink-0">
              {logos.map((logo, i) => {
                const [c1, c2] = palettes[i % palettes.length];
                return (
                  <div key={`loop1-${i}`} className="relative group">
                    <div
                      className="p-[1.5px] rounded-full"
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${c1}, ${c2})`,
                      }}
                    >
                      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/70 border border-white/10 backdrop-blur-md shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                        <img
                          src={logo.path}
                          alt={logo.name}
                          className="h-6 w-auto"
                          loading="lazy"
                        />
                        <span className="hidden sm:inline text-xs text-foreground/90">
                          {logo.name}
                        </span>
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -top-1 -left-1 size-1.5 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${c1}, transparent 60%)`,
                      }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-1 -right-1 size-1.5 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${c2}, transparent 60%)`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div
              className="flex gap-10 items-center shrink-0"
              aria-hidden="true"
            >
              {logos.map((logo, i) => {
                const [c1, c2] = palettes[i % palettes.length];
                return (
                  <div key={`loop2-${i}`} className="relative group">
                    <div
                      className="p-[1.5px] rounded-full"
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${c1}, ${c2})`,
                      }}
                    >
                      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/70 border border-white/10 backdrop-blur-md shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                        <img
                          src={logo.path}
                          alt={logo.name}
                          className="h-6 w-auto"
                          loading="lazy"
                        />
                        <span className="hidden sm:inline text-xs text-foreground/90">
                          {logo.name}
                        </span>
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -top-1 -left-1 size-1.5 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${c1}, transparent 60%)`,
                      }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-1 -right-1 size-1.5 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${c2}, transparent 60%)`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          {/* sheen overlay */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/6 to-transparent [animation:sheen_6s_linear_infinite]" />
          </div>
        </div>
      </div>
    </section>
  );
}

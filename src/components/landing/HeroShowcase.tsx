"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Play, Shield, Sparkles, Zap } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function HeroShowcase() {
  const [open, setOpen] = useState(false);
  return (
    <section className="relative pt-24 pb-20 sm:pt-28 sm:pb-28">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 backdrop-blur">
            <Sparkles className="size-4 text-accent-primary" />
            <span className="text-sm">
              SpikeUp • AI for Live & Recorded Webinars
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Host webinars that feel personal—powered by AI
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
            Onboard, engage, and convert your audience with an assistant that
            listens, answers, and follows up at scale. Crafted for teams that
            care about experience and outcomes.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-white bg-gradient-to-r from-accent-primary to-accent-secondary shadow-lg shadow-accent-primary/20 transition-all hover:shadow-xl hover:from-accent-primary/90 hover:to-accent-secondary/90"
            >
              Start free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-xl px-6 py-3 border border-border/60 bg-card/50 hover:bg-accent/30 transition-colors">
                  <Play className="size-4" /> Watch demo
                </button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-3xl p-0 overflow-hidden"
                showCloseButton
              >
                <DialogTitle className="sr-only">Watch demo</DialogTitle>
                <DialogDescription className="sr-only">
                  SpikeUp product demo video showcasing the webinar experience.
                </DialogDescription>
                <AspectRatio ratio={16 / 9}>
                  {open ? (
                    <iframe
                      src="https://www.youtube.com/embed/8fjYtAWYgbM"
                      title="SpikeUp •  Demo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-black/80 flex items-center justify-center text-white/70 text-sm">
                      Loading…
                    </div>
                  )}
                </AspectRatio>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2 justify-center lg:justify-start">
            <div className="inline-flex items-center gap-1">
              <Shield className="size-4" /> SOC2 & GDPR ready
            </div>
            <div className="inline-flex items-center gap-1">
              <Zap className="size-4" /> 99.9% uptime
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="lg:col-span-6 relative">
          <Reveal className="relative mx-auto w-full max-w-xl" as="div">
            {/* 3D Tilt wrapper */}
            <TiltCard>
              {/* Device card */}
              <div className="relative rounded-3xl border border-border/60 bg-gradient-to-b from-background/40 to-card/60 backdrop-blur-md overflow-hidden shadow-[0_0_0_1px_theme(colors.border/.3),0_10px_30px_-10px_theme(colors.accent-primary/.25)] [transform-style:preserve-3d]">
                {/* Shine overlay (moved by tilt) */}
                <div
                  data-shine
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-60 mix-blend-screen"
                />

                <div className="aspect-video relative [transform-style:preserve-3d]">
                  {/* Fake UI */}
                  <div className="absolute inset-0 p-4 sm:p-6">
                    <div
                      className="flex items-center gap-2"
                      style={{ transform: "translateZ(22px)" }}
                    >
                      <div className="size-2.5 rounded-full bg-red-400/80" />
                      <div className="size-2.5 rounded-full bg-yellow-400/80" />
                      <div className="size-2.5 rounded-full bg-green-400/80" />
                    </div>

                    <div className="mt-4 grid grid-cols-12 grid-rows-[auto_auto] gap-3 items-start">
                      {/* Playing video mock */}
                      <div
                        className="col-span-8 relative rounded-xl border border-border/60 h-40 overflow-hidden"
                        style={{ transform: "translateZ(28px)" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-transparent" />
                        {/* moving diagonal highlight to simulate motion */}
                        <div className="absolute -inset-y-8 -left-1/2 w-[160%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[6px] animate-sheen" />
                        {/* LIVE viewers chip */}
                        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] text-white/80">
                          <span className="size-1.5 rounded-full bg-red-500 animate-blink" />
                          LIVE • 1,248 watching
                        </div>
                        {/* mini controls */}
                        <div className="absolute left-3 bottom-2 right-3 flex items-center gap-2">
                          <span className="size-2 rounded-full bg-red-500" />
                          <div className="relative h-1.5 flex-1 rounded bg-white/10 overflow-hidden">
                            <span className="absolute left-0 top-0 h-full rounded bg-accent-primary/80 animate-progress" />
                          </div>
                          <span className="text-[10px] text-white/70">
                            01:24
                          </span>
                        </div>
                        {/* tiny equalizer at corner */}
                        <div className="absolute right-3 top-3 flex items-end gap-1 opacity-80">
                          {[0, 1, 2, 3].map((i) => (
                            <span
                              key={i}
                              className="w-1 rounded bg-accent-secondary/80 animate-eq"
                              style={{
                                height: `${6 + i * 3}px`,
                                animationDelay: `${i * 0.08}s`,
                              }}
                            />
                          ))}
                        </div>
                        {/* Chat moved to sidebar */}
                      </div>

                      {/* Sidebar chatbox */}
                      <div
                        className="col-span-4 row-span-2 self-start rounded-xl bg-card/60 border border-border/60 p-3 sm:p-4 space-y-6"
                        style={{ transform: "translateZ(24px)" }}
                      >
                        <div className="text-[11px] uppercase tracking-wide text-white/60">
                          Chat
                        </div>
                        <div className="space-y-2.5 text-[12px]">
                          {[
                            { name: "Dev", text: "Audio is super crisp 👌" },
                            {
                              name: "Mia",
                              text: "Can you share slides later?",
                            },
                          ].map((m, i) => (
                            <div
                              key={m.name}
                              className="rounded-xl border border-border/40 bg-black/35 backdrop-blur px-3 py-2 text-white/85 animate-chat-in"
                              style={{ animationDelay: `${i * 120}ms` }}
                            >
                              <span className="font-medium mr-1 text-white/90">
                                {m.name}:
                              </span>
                              <span className="opacity-90">{m.text}</span>
                            </div>
                          ))}
                        </div>
                        {/* input stub */}
                        <div className="mt-1 h-8 rounded-lg bg-white/5 border border-white/10" />
                      </div>

                      {/* Action tiles under player */}
                      <div
                        className="col-span-8 row-start-2 grid grid-cols-2 gap-3"
                        style={{ transform: "translateZ(18px)" }}
                      >
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-20 rounded-xl border border-border/60 bg-card/60 relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-40" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Floating chips */}
            <Reveal
              className="absolute -left-6 -top-6 rounded-2xl border border-border/60 bg-card/70 backdrop-blur px-3 py-2 text-xs shadow"
              delayMs={120}
            >
              Auto Q&A • Lead scoring
            </Reveal>
            <Reveal
              className="absolute -right-6 -bottom-6 rounded-2xl border border-border/60 bg-card/70 backdrop-blur px-3 py-2 text-xs shadow"
              delayMs={240}
            >
              Smart summaries • Follow-ups
            </Reveal>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// Lightweight parallax tilt with dynamic shine; disabled on touch and reduced motion
function TiltCard({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    enabledRef.current = isFine && !reduced;
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabledRef.current || !containerRef.current || !cardRef.current)
      return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;
    const rotateY = (px - 0.5) * 16; // left-right
    const rotateX = (0.5 - py) * 10; // up-down

    cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    cardRef.current.style.transition = "transform 20ms linear";

    const gx = Math.round(px * 100);
    const gy = Math.round(py * 100);
    if (shineRef.current) {
      shineRef.current.style.background = `radial-gradient(600px at ${gx}% ${gy}%, rgba(255,255,255,0.16), transparent 40%)`;
      shineRef.current.style.transform = "translateZ(40px)";
    }
  };

  const onEnter = () => {
    if (!enabledRef.current || !cardRef.current) return;
    cardRef.current.style.willChange = "transform";
    cardRef.current.style.transition = "transform 180ms ease-out";
  };

  const onLeave = () => {
    if (!cardRef.current || !shineRef.current) return;
    cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    cardRef.current.style.transition = "transform 250ms ease-out";
    shineRef.current.style.background =
      "radial-gradient(600px at 50% 50%, rgba(255,255,255,0.0), transparent 40%)";
  };

  return (
    <div
      ref={containerRef}
      className="relative group [perspective:1200px]"
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        ref={cardRef}
        className="transition-transform duration-200 [transform-style:preserve-3d]"
      >
        {/* inject shine target into first child */}
        {React.Children.map(children as any, (child: any) => {
          if (!child || !child.props) return child;
          return React.cloneElement(child, {
            children: React.Children.map(child.props.children, (grand: any) => {
              if (!grand || !grand.props) return grand;
              if (grand.props?.["data-shine"] !== undefined) {
                return React.cloneElement(grand, { ref: shineRef });
              }
              return grand;
            }),
          });
        })}
      </div>
    </div>
  );
}

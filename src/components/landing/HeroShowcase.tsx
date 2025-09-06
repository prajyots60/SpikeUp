"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Play, Shield, Sparkles, Zap } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
            {/* Device card */}
            <div className="relative rounded-3xl border border-border/60 bg-gradient-to-b from-background/40 to-card/60 backdrop-blur-md overflow-hidden shadow-[0_0_0_1px_theme(colors.border/.3),0_10px_30px_-10px_theme(colors.accent-primary/.25)]">
              <div className="aspect-video relative">
                {/* Fake UI */}
                <div className="absolute inset-0 p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-red-400/80" />
                    <div className="size-2.5 rounded-full bg-yellow-400/80" />
                    <div className="size-2.5 rounded-full bg-green-400/80" />
                  </div>

                  <div className="mt-4 grid grid-cols-12 gap-3">
                    <div className="col-span-8 rounded-xl bg-accent/50 border border-border/60 h-40" />
                    <div className="col-span-4 rounded-xl bg-card/60 border border-border/60 p-3 space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 rounded bg-accent/50" />
                      ))}
                    </div>
                    <div className="col-span-12 grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-16 rounded-xl bg-card/60 border border-border/60"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

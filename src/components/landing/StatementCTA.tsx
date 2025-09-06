"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useMemo } from "react";

export default function StatementCTA() {
  // Reduce re-renders and keep styles stable
  const maskStyle = useMemo(
    () => ({
      WebkitMaskImage:
        "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
      maskImage:
        "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)",
    }),
    []
  );

  return (
    <section className="relative py-24 sm:py-28 overflow-hidden">
      {/* Background layer: soft grid + gradient blobs + conic ring + beam */}
      <div className="pointer-events-none absolute inset-0">
        {/* Soft grid */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(127,127,127,0.12) 0px, rgba(127,127,127,0.12) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(127,127,127,0.12) 0px, rgba(127,127,127,0.12) 1px, transparent 1px, transparent 32px)",
          }}
        />

        {/* Mesh blobs */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl bg-gradient-to-tr from-accent-primary/30 to-accent-secondary/30 animate-blob" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl bg-gradient-to-br from-accent-secondary/25 to-accent-primary/25 animate-blob animation-delay-200" />

        {/* Rotating conic ring */}
        <div
          className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full animate-rotate-slow"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.12) 60deg, transparent 120deg)",
            boxShadow: "0 0 80px rgba(167,110,246,0.25)",
            WebkitMask:
              "radial-gradient(closest-side, transparent calc(100% - 14px), black calc(100% - 14px))",
            mask: "radial-gradient(closest-side, transparent calc(100% - 14px), black calc(100% - 14px))",
          }}
        />

        {/* Diagonal beam sweep */}
        <div className="absolute inset-0" style={maskStyle}>
          <div className="absolute -inset-x-1/2 top-1/3 rotate-[-12deg]">
            <div className="mx-auto h-24 w-[160%] bg-gradient-to-r from-transparent via-white/12 to-transparent blur-[6px] animate-sheen" />
          </div>
        </div>
      </div>

      {/* Foreground content card */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-10 sm:p-14 rounded-3xl border border-white/10 bg-gradient-to-b from-background/70 to-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/45 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]">
          {/* Sheen overlay on hover */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" style={maskStyle}>
            <div className="absolute -left-1/2 top-0 h-full w-[200%] bg-gradient-to-r from-transparent via-white/5 to-transparent animate-sheen" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to revolutionize your webinars?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using SpikeUp to create engaging,
            high-converting webinars with AI automation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center gap-2 rounded-xl px-8 py-4 text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary opacity-90 group-hover:opacity-100" />
              <span className="relative">Start Your Free Trial</span>
              <ArrowRight className="relative w-5 h-5 transition-transform group-hover:translate-x-1" />
              {/* glossy highlight */}
              <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/15 to-transparent opacity-80" />
            </Link>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

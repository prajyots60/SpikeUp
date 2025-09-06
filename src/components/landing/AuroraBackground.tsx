"use client";

import React from "react";

type AuroraBackgroundProps = {
  className?: string;
};

// Subtle animated aurora + grid + orbits background for AI webinar theme
export default function AuroraBackground({
  className = "",
}: AuroraBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* Soft grid */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_19px,theme(colors.border/.12)_20px),repeating-linear-gradient(0deg,transparent,transparent_19px,theme(colors.border/.12)_20px)] [background-size:20px_20px]" />

      {/* Aurora blobs */}
      <div
        aria-hidden
        className="absolute -top-32 -left-10 w-[60rem] h-[60rem] rounded-full blur-3xl bg-[conic-gradient(from_180deg_at_50%_50%,theme(colors.accent-primary/.25),theme(colors.accent-secondary/.2),transparent_70%)] anim-reveal"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -right-20 w-[55rem] h-[55rem] rounded-full blur-3xl bg-[conic-gradient(from_0deg_at_50%_50%,theme(colors.accent-secondary/.25),theme(colors.accent-primary/.2),transparent_70%)] anim-reveal anim-reveal-delay-1"
      />

      {/* Concentric orbits with subtle motion */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[28, 40, 54].map((size, i) => (
          <div
            key={size}
            className={"relative"}
            style={{
              width: `${size}rem`,
              height: `${size}rem`,
              animation: `orbit-rotate ${18 + i * 6}s linear infinite` as any,
            }}
          >
            <div className="absolute inset-0 rounded-full border border-border/40" />
            {/* Node */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 rounded-full bg-accent-primary shadow-[0_0_12px_theme(colors.accent-primary/.7)]"
              style={{
                animation: `node-pulse 3s ease-in-out ${
                  i * 0.4
                }s infinite` as any,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

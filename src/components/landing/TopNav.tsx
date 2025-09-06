"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Triangle } from "lucide-react";

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={
        "sticky top-0 z-50 transition-colors border-b " +
        (scrolled
          ? "backdrop-blur bg-background/70 border-border/60"
          : "backdrop-blur-sm bg-background/50 border-transparent")
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="iconBackground p-2 relative overflow-hidden group">
              <Triangle className="w-6 h-6 fill-primary/20 stroke-2 group-hover:scale-110 transition-all duration-300" />
              <div
                className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin opacity-20 group-hover:opacity-60 transition-opacity duration-300"
                style={{ animationDuration: "8s" }}
              />
              <div className="absolute -top-0.5 left-1/2 w-0.5 h-2 bg-gradient-to-t from-primary/60 to-transparent -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold">SpikeUp</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </a>
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/90 hover:to-accent-secondary/90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { CalendarCheck, Handshake, Headphones, Rocket } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const steps = [
  {
    title: "Plan",
    description:
      "Import your deck, set goals, and let AI suggest the ideal run of show.",
    Icon: CalendarCheck,
  },
  {
    title: "Host",
    description:
      "Go live with studio-grade streaming and built-in interactive layers.",
    Icon: Headphones,
  },
  {
    title: "Engage",
    description:
      "Your AI co-host answers questions, scores leads, and captures intent.",
    Icon: Handshake,
  },
  {
    title: "Convert",
    description:
      "Auto follow-ups, CRM sync, and insights to improve the next session.",
    Icon: Rocket,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How it works</h2>
          <p className="text-muted-foreground text-lg">
            A streamlined flow from setup to results
          </p>
        </div>

        <ol className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ title, description, Icon }, i) => (
            <Reveal
              as="li"
              key={title}
              delayMs={i * 80}
              className="group p-6 rounded-2xl bg-card/50 border border-border/50"
            >
              <div className="iconBackground p-3 w-fit mb-4">
                <Icon className="size-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

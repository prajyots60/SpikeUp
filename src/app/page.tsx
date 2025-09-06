import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Triangle,
  Users,
  Video,
  BarChart3,
  Bot,
  Calendar,
  MessageSquare,
  Star,
} from "lucide-react";
import AuroraBackground from "@/components/landing/AuroraBackground";
import HeroShowcase from "@/components/landing/HeroShowcase";
import BrandMarquee from "@/components/landing/BrandMarquee";
import TopNav from "@/components/landing/TopNav";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingTeaser from "@/components/landing/PricingTeaser";
import StatementCTA from "@/components/landing/StatementCTA";

export default async function RootPage() {
  const user = await currentUser();

  if (user) redirect("/home");

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <TopNav />

      {/* Advanced Hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground />
        <HeroShowcase />
      </section>

      <BrandMarquee />

      <section className="py-20 bg-card/30" id="stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent-primary">50K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent-primary">1M+</div>
              <div className="text-muted-foreground">Webinars Hosted</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent-primary">300%</div>
              <div className="text-muted-foreground">Avg. Conversion Boost</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent-primary">
                99.9%
              </div>
              <div className="text-muted-foreground">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                scale your webinars
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Precision-built for engagement, data, and outcomes—without noise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "AI Co-Host",
                description:
                  "Real-time Q&A, intent detection, and lead qualification—human when needed, autonomous at scale.",
              },
              {
                icon: BarChart3,
                title: "Behavioral Analytics",
                description:
                  "See where attention peaks and drops, map sentiment, and optimize flows with clarity.",
              },
              {
                icon: Users,
                title: "Elastic Capacity",
                description:
                  "Go from 10 to tens of thousands—latency-aware infra scales with you automatically.",
              },
              {
                icon: Video,
                title: "Studio-Grade Video",
                description:
                  "Crisp, adaptive streaming with instant recovery and device-aware tuning.",
              },
              {
                icon: MessageSquare,
                title: "Interactive Layers",
                description:
                  "Chat, polls, and breakout rooms with programmable prompts and actions.",
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description:
                  "Timezone-aware invites, multi-touch reminders, and calendar integrations.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-accent-primary/50 transition-all duration-300 hover:shadow-lg anim-reveal"
              >
                <div className="mb-4">
                  <div className="relative w-12 h-12 p-[1.5px] rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary shadow-[0_0_0_1px_theme(colors.accent-primary/.2),0_10px_25px_-10px_theme(colors.accent-primary/.4)]">
                    <div className="w-full h-full rounded-[10px] bg-background/70 backdrop-blur flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-accent-primary" />
                    </div>
                    <span
                      className="pointer-events-none absolute -top-0.5 -left-0.5 size-1.5 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, var(--accent-primary), transparent 60%)",
                      }}
                    />
                    <span
                      className="pointer-events-none absolute -bottom-0.5 -right-0.5 size-1.5 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, var(--accent-secondary), transparent 60%)",
                      }}
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      <section id="testimonials" className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by{" "}
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                thousands of businesses
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers are saying
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Shubham Shinde",
                role: "Marketing Director",
                company: "TechCorp",
                content:
                  "SpikeUp transformed our webinar strategy. The AI insights helped us increase engagement by 300% and our conversion rates doubled.",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "CEO",
                company: "StartupXYZ",
                content:
                  "The automation features saved us 20 hours per week. We can now focus on content while SpikeUp handles everything else.",
                rating: 5,
              },
              {
                name: "Emily Rodriguez",
                role: "Sales Manager",
                company: "ScaleUp Inc",
                content:
                  "Best webinar platform we've used. The AI assistant handles lead qualification perfectly, and our sales team loves it.",
                rating: 5,
              },
            ].map((t, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-background border border-border"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  &quot;{t.content}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.role} at {t.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingTeaser />

      <StatementCTA />

      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="iconBackground p-2">
                <Triangle className="w-5 h-5 fill-primary/20 stroke-2" />
              </div>
              <span className="font-semibold">SpikeUp</span>
              <span className="text-muted-foreground text-sm">
                AI Assistant Webinar Management
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
              <span>© 2024 SpikeUp. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

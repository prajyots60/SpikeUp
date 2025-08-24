import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Triangle,
  Sparkles,
  Users,
  Video,
  BarChart3,
  Bot,
  CheckCircle,
  ArrowRight,
  Play,
  Calendar,
  MessageSquare,
  Star,
} from "lucide-react";

export default async function RootPage() {
  const user = await currentUser();

  // If user is signed in, redirect to home
  if (user) {
    redirect("/home");
  }

  // If not signed in, show landing page
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="iconBackground p-2 relative overflow-hidden group">
                <Triangle className="w-6 h-6 fill-primary/20 stroke-2 group-hover:scale-110 transition-all duration-300" />
                <div
                  className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin opacity-20 group-hover:opacity-60 transition-opacity duration-300"
                  style={{ animationDuration: "8s" }}
                ></div>
                <div className="absolute -top-0.5 left-1/2 w-0.5 h-2 bg-gradient-to-t from-primary/60 to-transparent transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-xl font-bold">Spotlight</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
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

            {/* Auth Buttons */}
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-accent-secondary/10 to-accent-primary/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-card/50 border border-border/50 rounded-full px-4 py-2 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span className="text-sm font-medium">
                AI-Powered Webinar Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Transform Your Webinars with{" "}
              <span className="bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-clip-text text-transparent animate-pulse">
                AI Intelligence
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Create, manage, and optimize high-converting webinars with
              intelligent automation. Join thousands of businesses scaling their
              revenue with Spotlight.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link
                href="/sign-up"
                className="group bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/90 hover:to-accent-secondary/90 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group bg-card/50 border border-border hover:bg-accent text-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="pt-16">
              <p className="text-sm text-muted-foreground mb-6">
                Trusted by leading companies worldwide
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50">
                <div className="flex items-center justify-center h-12 bg-card/30 rounded-lg">
                  <span className="font-semibold">Microsoft</span>
                </div>
                <div className="flex items-center justify-center h-12 bg-card/30 rounded-lg">
                  <span className="font-semibold">Salesforce</span>
                </div>
                <div className="flex items-center justify-center h-12 bg-card/30 rounded-lg">
                  <span className="font-semibold">HubSpot</span>
                </div>
                <div className="flex items-center justify-center h-12 bg-card/30 rounded-lg">
                  <span className="font-semibold">Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card/30">
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

      {/* Features Section */}
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
              Powerful features designed to maximize engagement and conversions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "AI Assistant Integration",
                description:
                  "Intelligent automation that handles Q&A, lead qualification, and follow-ups automatically.",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description:
                  "Deep insights into attendee behavior, engagement metrics, and conversion optimization.",
              },
              {
                icon: Users,
                title: "Unlimited Attendees",
                description:
                  "Scale your webinars to thousands of participants without compromising quality.",
              },
              {
                icon: Video,
                title: "HD Streaming",
                description:
                  "Crystal clear video quality with adaptive bitrate streaming for any device.",
              },
              {
                icon: MessageSquare,
                title: "Interactive Chat",
                description:
                  "Real-time chat, polls, Q&A sessions, and breakout rooms for maximum engagement.",
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description:
                  "Automated reminders, timezone detection, and calendar integrations.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-accent-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="iconBackground p-3 mb-4 w-fit">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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
                name: "Sarah Johnson",
                role: "Marketing Director",
                company: "TechCorp",
                content:
                  "Spotlight transformed our webinar strategy. The AI insights helped us increase engagement by 300% and our conversion rates doubled.",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "CEO",
                company: "StartupXYZ",
                content:
                  "The automation features saved us 20 hours per week. We can now focus on content while Spotlight handles everything else.",
                rating: 5,
              },
              {
                name: "Emily Rodriguez",
                role: "Sales Manager",
                company: "ScaleUp Inc",
                content:
                  "Best webinar platform we&apos;ve used. The AI assistant handles lead qualification perfectly, and our sales team loves it.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-background border border-border"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-accent-primary/10 border border-accent-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to revolutionize your webinars?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using Spotlight to create engaging,
              high-converting webinars with AI automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/sign-up"
                className="group bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/90 hover:to-accent-secondary/90 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="iconBackground p-2">
                <Triangle className="w-5 h-5 fill-primary/20 stroke-2" />
              </div>
              <span className="font-semibold">Spotlight</span>
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
              <span>© 2024 Spotlight. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

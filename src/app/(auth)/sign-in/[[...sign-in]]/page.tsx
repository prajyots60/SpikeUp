"use client";
import { SignIn } from "@clerk/nextjs";
import { Triangle, Sparkles, Users, Video, Zap } from "lucide-react";
import Link from "next/link";
import React from "react";

const Signin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="iconBackground p-4 relative overflow-hidden group">
              <Triangle className="w-8 h-8 fill-primary/20 stroke-2 group-hover:scale-110 transition-all duration-300" />
              <div
                className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin opacity-20 group-hover:opacity-60 transition-opacity duration-300"
                style={{ animationDuration: "8s" }}
              ></div>
              <div className="absolute inset-2 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
              <div className="absolute -top-1 left-1/2 w-0.5 h-3 bg-gradient-to-t from-primary/60 to-transparent transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                SpikeUp
              </h1>
              <p className="text-muted-foreground text-sm">
                AI Assistant Webinar Management
              </p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Welcome back to the future of{" "}
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                webinar management
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sign in to access your AI-powered webinar platform. Create,
              manage, and optimize your webinars with intelligent automation.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
              <div className="iconBackground p-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI-Powered Automation</h3>
                <p className="text-sm text-muted-foreground">
                  Smart webinar management with intelligent insights
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
              <div className="iconBackground p-2">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Audience Engagement</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced tools to keep your audience engaged
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
              <div className="iconBackground p-2">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">HD Streaming</h3>
                <p className="text-sm text-muted-foreground">
                  Crystal clear video quality for professional webinars
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="p-6 rounded-lg bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">
                  Marketing Director
                </p>
              </div>
            </div>
            <p className="text-sm italic">
              &quot;SpikeUp transformed our webinar strategy. The AI insights
              helped us increase engagement by 300%.&quot;
            </p>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center space-y-4">
              <div className="iconBackground p-4 relative overflow-hidden group">
                <Triangle className="w-8 h-8 fill-primary/20 stroke-2 group-hover:scale-110 transition-all duration-300" />
                <div
                  className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin opacity-20 group-hover:opacity-60 transition-opacity duration-300"
                  style={{ animationDuration: "8s" }}
                ></div>
                <div className="absolute inset-2 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                <div className="absolute -top-1 left-1/2 w-0.5 h-3 bg-gradient-to-t from-primary/60 to-transparent transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold">SpikeUp</h1>
                <p className="text-muted-foreground text-sm">
                  AI Assistant Webinar Management
                </p>
              </div>
            </div>

            {/* Sign In Component */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                <p className="text-muted-foreground">
                  Sign in to continue to your dashboard
                </p>
              </div>

              <SignIn
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none border-0",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                      "bg-background border border-border hover:bg-accent transition-colors",
                    socialButtonsBlockButtonText: "text-foreground",
                    dividerLine: "bg-border",
                    dividerText: "text-muted-foreground",
                    formFieldInput: "bg-background border border-border",
                    formButtonPrimary:
                      "bg-primary hover:bg-primary/90 text-primary-foreground",
                    footerActionLink:
                      "text-accent-primary hover:text-accent-primary/80",
                  },
                }}
              />

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;

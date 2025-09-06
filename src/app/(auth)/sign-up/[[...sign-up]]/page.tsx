"use client";
import { SignUp } from "@clerk/nextjs";
import { Triangle, Users, CheckCircle, BarChart3, Bot } from "lucide-react";
import Link from "next/link";
import React from "react";

const Signup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="iconBackground p-4 relative overflow-hidden group">
                <Triangle className="w-8 h-8 fill-primary/20 stroke-2 group-hover:scale-110 transition-all duration-300" />
                <div
                  className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin opacity-20 group-hover:opacity-60 transition-opacity duration-300"
                  style={{ animationDuration: "8s" }}
                ></div>
                <div className="absolute inset-2 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                <div className="absolute -top-1 left-1/2 w-0.5 h-3 bg-gradient-to-t from-primary/60 to-transparent transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
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
              Join thousands using{" "}
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                AI-powered webinars
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Create your free account and discover the future of webinar
              management. Start building engaging experiences with AI
              automation.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">
              What you&apos;ll get:
            </h3>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
              <div className="iconBackground p-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold">Free Plan Included</h4>
                <p className="text-sm text-muted-foreground">
                  Start with 3 webinars per month at no cost
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
              <div className="iconBackground p-2">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">AI Assistant Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Smart automation for better engagement
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
              <div className="iconBackground p-2">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">Advanced Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Detailed insights and performance metrics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
              <div className="iconBackground p-2">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">Unlimited Attendees</h4>
                <p className="text-sm text-muted-foreground">
                  Scale your webinars without limits
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-6 rounded-lg bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-primary">50K+</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-primary">1M+</div>
              <div className="text-xs text-muted-foreground">
                Webinars Hosted
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-primary">
                99.9%
              </div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
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

            {/* Sign Up Component */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
                <p className="text-muted-foreground">
                  Start your free webinar journey today
                </p>
              </div>

              <SignUp
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
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Terms */}
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="text-accent-primary hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-accent-primary hover:underline"
                  >
                    Privacy Policy
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

export default Signup;

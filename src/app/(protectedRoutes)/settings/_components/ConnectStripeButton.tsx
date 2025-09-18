"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LucideArrowRight, Shield, Sparkles } from "lucide-react";

type Props = {
  stripeLink: string;
  isConnected: boolean;
};

const ConnectStripeButton: React.FC<Props> = ({ stripeLink, isConnected }) => {
  const [open, setOpen] = React.useState(false);

  const goToStripe = () => {
    window.location.href = stripeLink;
  };

  if (isConnected) {
    return (
      <Button
        onClick={goToStripe}
        className="px-5 p-2.5 rounded-md font-medium text-sm flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground"
      >
        Manage Stripe <LucideArrowRight size={16} />
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="px-5 p-2.5 rounded-md font-medium text-sm flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white">
          Connect Stripe <LucideArrowRight size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md border-2 border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-lg" />
        <DialogHeader className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold">
              Before you connect
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You&apos;ll be redirected to Stripe to connect your account.
              </li>
              <li>
                You should have an existing Stripe account and know your email
                and password.
              </li>
              <li>
                If you don&apos;t have one yet, please create it first at
                <a
                  href="https://stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 underline"
                >
                  stripe.com
                </a>
                .
              </li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 mt-2 text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-3 w-3 text-primary" />
            </span>
            Use your own Stripe credentials - your payouts go to your account.
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-3 w-3 text-primary" />
            </span>
            You can manage verification and payouts on Stripe after connecting.
          </div>
        </div>

        <DialogFooter className="relative z-10">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={goToStripe}
            className="bg-primary text-primary-foreground"
          >
            Yes, I have
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectStripeButton;

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { switchToManagedCreator, updateCreatorType } from "@/actions/creator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreatorTypeSelectorProps {
  currentType: "CONNECTED_STRIPE" | "MANAGED_CREATOR";
  isConnected: boolean;
}

export default function CreatorTypeSelector({
  currentType,
  isConnected,
}: CreatorTypeSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSwitchToManaged = () => {
    startTransition(async () => {
      try {
        const result = await switchToManagedCreator();
        if (result.success) {
          toast.success("Successfully switched to managed creator mode");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to switch creator type");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      }
    });
  };

  const handleSwitchToConnected = () => {
    startTransition(async () => {
      try {
        const result = await updateCreatorType("CONNECTED_STRIPE");
        if (result.success) {
          toast.success("Switched to connected Stripe mode");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to switch creator type");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Creator Account Type
        </CardTitle>
        <CardDescription>
          Choose how you want to handle payments and earnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Managed Creator Option */}
          <div
            className={`p-4 border rounded-lg ${
              currentType === "MANAGED_CREATOR"
                ? "border-primary bg-primary/5"
                : "border-muted"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Managed Creator</h3>
              </div>
              {currentType === "MANAGED_CREATOR" && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Current
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              We handle all payments for you. No Stripe account needed. Perfect
              for getting started quickly.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 mb-4">
              <li>• No Stripe account required</li>
              <li>• Platform handles all payments</li>
              <li>• Earnings tracked separately</li>
              <li>• Manual payouts available</li>
              <li>• 10% platform fee</li>
            </ul>
            {currentType !== "MANAGED_CREATOR" && (
              <Button
                onClick={handleSwitchToManaged}
                disabled={isPending}
                size="sm"
                className="w-full"
              >
                {isPending ? "Switching..." : "Switch to Managed"}
              </Button>
            )}
          </div>

          {/* Connected Stripe Option */}
          <div
            className={`p-4 border rounded-lg ${
              currentType === "CONNECTED_STRIPE"
                ? "border-primary bg-primary/5"
                : "border-muted"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Connected Stripe</h3>
              </div>
              {currentType === "CONNECTED_STRIPE" && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Current
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your own Stripe account for direct payments. Full control
              over your finances.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 mb-4">
              <li>• Your own Stripe account</li>
              <li>• Direct payments to you</li>
              <li>• Full financial control</li>
              <li>• Stripe&apos;s processing fees only</li>
              <li>• Advanced reporting</li>
            </ul>
            <div className="flex items-center gap-2 mb-4">
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs">Stripe Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs">Stripe Not Connected</span>
                </div>
              )}
            </div>
            {currentType !== "CONNECTED_STRIPE" && (
              <Button
                onClick={handleSwitchToConnected}
                disabled={isPending}
                size="sm"
                variant="outline"
                className="w-full"
              >
                {isPending ? "Switching..." : "Switch to Connected"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

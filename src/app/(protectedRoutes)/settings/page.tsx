import { OnAuthenticateUser } from "@/actions/auth";
import { getCreatorDetails } from "@/actions/creator";
import PageHeader from "@/components/ReusableComponents/PageHeader";
import { getStripeOAuthLink } from "@/lib/stripe/utils";
import {
  HomeIcon,
  LucideAlertCircle,
  LucideCheckCircle2,
  Settings,
  Sparkle,
  Star,
} from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

import ProductManager from "./_components/ProductManager";
import ConnectStripeButton from "./_components/ConnectStripeButton";
import CreatorTypeSelector from "./_components/CreatorTypeSelector";
import EarningsDashboard from "./_components/EarningsDashboard";

const page = async () => {
  const userExits = await OnAuthenticateUser();
  if (!userExits.user) {
    redirect("/sign-in");
  }

  const creatorDetails = await getCreatorDetails(userExits.user.id);
  const creator = creatorDetails.success
    ? creatorDetails.creator
    : userExits.user;

  // Serialize decimal values for client components
  const serializedCreator = creator
    ? {
        ...creator,
        totalEarnings: Number(creator.totalEarnings || 0),
        pendingBalance: Number(creator.pendingBalance || 0),
        // Serialize nested objects if they exist
        products:
          creator.products?.map((product: any) => ({
            ...product,
            price: Number(product.price || 0),
          })) || [],
        earnings:
          creator.earnings?.map((earning: any) => ({
            ...earning,
            amount: Number(earning.amount || 0),
            netAmount: Number(earning.netAmount || 0),
            platformFee: Number(earning.platformFee || 0),
          })) || [],
        payouts:
          creator.payouts?.map((payout: any) => ({
            ...payout,
            amount: Number(payout.amount || 0),
          })) || [],
      }
    : null;

  const isConnected = !!serializedCreator?.stripeConnectId;
  const isManagedCreator = serializedCreator?.creatorType === "MANAGED_CREATOR";

  const stripeLink = getStripeOAuthLink(
    "api/stripe-connect",
    userExits.user.id
  );

  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        heading="Payment Integration"
        leftIcon={<Sparkle className="w-3 h-3" />}
        mainIcon={<Settings className="w-8 h-8" />}
        rightIcon={<HomeIcon className="w-3 h-3" />}
        placeholder="Search for a setting..."
      />

      {/* Creator Type Selection */}
      <CreatorTypeSelector
        currentType={serializedCreator?.creatorType || "MANAGED_CREATOR"}
        isConnected={isConnected}
      />

      {/* Stripe Connect Section */}
      <div className="w-full p-6 border border-input rounded-lg bg-background shadow-sm">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center mr-4">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">
              {isManagedCreator ? "Managed Creator Account" : "Stripe Connect"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isManagedCreator
                ? "You're using our platform account to accept payments."
                : "Connect your Stripe account to accept payments."}
            </p>
          </div>
        </div>

        <div className="my-6 p-4 bg-muted rounded-md">
          <div className="flex items-start">
            {(isConnected && !isManagedCreator) || isManagedCreator ? (
              <LucideCheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <LucideAlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {isManagedCreator
                  ? "Your account is set up for managed payments."
                  : isConnected
                  ? "Your Stripe account is connected."
                  : "Your Stripe account is not connected."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isManagedCreator
                  ? "You can create products and we'll handle payments for you. Earnings will be tracked separately."
                  : isConnected
                  ? "You can now accept payments directly to your account."
                  : "Connect your stripe account to accept payments and manage subscriptions."}
              </p>
            </div>
          </div>
        </div>

        {!isManagedCreator && (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                {isConnected
                  ? "You can reconnect anytime if needed."
                  : "You will be redirected to Stripe to complete the connection."}
              </div>

              <ConnectStripeButton
                stripeLink={stripeLink}
                isConnected={isConnected}
              />
            </div>

            {!isConnected && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-medium mb-2">
                  Why connect with Stripe?
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    </div>
                    Process payments securely from customers worldwide.
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    </div>
                    Manage subscriptions and recurring payments easily.
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    </div>
                    Access detailed financial reporting and analytics.
                  </li>
                </ul>
              </div>
            )}
          </>
        )}

        {/* Products Section */}
        {((isConnected && !isManagedCreator) || isManagedCreator) && (
          <div className="mt-10 pt-6 border-t border-border space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-1">Products & Pricing</h3>
              <p className="text-xs text-muted-foreground">
                {isManagedCreator
                  ? "Create products using our platform account. Use the Price ID when attaching a price to a webinar CTA."
                  : "Create products & prices in your connected Stripe account. Use the Price ID when attaching a price to a webinar CTA."}
              </p>
            </div>
            <ProductManager />
          </div>
        )}
      </div>

      {/* Earnings Dashboard for Managed Creators */}
      {isManagedCreator && creatorDetails.success && serializedCreator && (
        <EarningsDashboard
          creator={serializedCreator}
          totalEarnings={Number(creatorDetails.creator?.totalEarnings || 0)}
          unpaidEarnings={Number(creatorDetails.creator?.unpaidEarnings || 0)}
        />
      )}
    </div>
  );
};

export default page;

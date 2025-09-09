"use client";
import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";
import { ArrowLeft, Zap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import PurpleIcon from "../PurpleIcon";
import CreateWebinarButton from "../CreateWebinarButton";
import { StripeElements } from "../Stripe/Element";
import SubscriptionModal from "../SubscriptionModal";
import { Assistant } from "@vapi-ai/server-sdk/api";

interface SimpleStripeProduct {
  id: string;
  name: string;
  description?: string | null;
  active?: boolean;
  created?: number;
  default_price?: {
    id: string;
    unit_amount?: number | null;
    currency?: string;
  } | null;
  // Allow any extra fields silently (forward compatibility)
  [key: string]: any;
}

type Props = {
  user: User;
  stripeProducts: SimpleStripeProduct[] | [];
  assistants: Assistant[] | [];
};

const Header = ({ user, stripeProducts, assistants }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="w-full px-4 pt-10 sticky top-0 z-10 flex justify-between items-center flex-wrap gap-4 bg-background">
      {pathname.includes("pipeline") ? (
        <Button
          className="bg-primary/10 border border-border rounded-xl cursor-pointer"
          variant={"outline"}
          onClick={() => router.push("/webinars")}
        >
          <ArrowLeft /> Back to Webinar
        </Button>
      ) : (
        <div className="px-4 py-3 flex justiry-center text-bold items-center rounded-xl bg-background border border-border text-primary capitalize">
          {pathname.split("/")[1]}
        </div>
      )}

      <div className="flex gap-6 items-center flex-wrap">
        <PurpleIcon>
          <Zap />
        </PurpleIcon>

        {user.subscription ? (
          <CreateWebinarButton
            stripeProducts={stripeProducts}
            assistants={assistants}
          />
        ) : (
          <StripeElements>
            <SubscriptionModal user={user} />
          </StripeElements>
        )}
      </div>
    </div>
  );
};

export default Header;

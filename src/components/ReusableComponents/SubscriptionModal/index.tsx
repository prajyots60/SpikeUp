import { onGetStripeClientSecret } from "@/actions/stripe";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "@prisma/client";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Loader2, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  user: User;
};

const SubscriptionModal = ({ user }: Props) => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      if (!stripe || !elements) {
        return toast.error("Stripe is not loaded yet. Please try again later.");
      }

      const intent = await onGetStripeClientSecret(user.email, user.id);

      if (!intent?.secret) {
        setLoading(false);
        return toast.error("Failed to create subscription. Please try again.");
      }

      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setLoading(false);
        throw new Error("Card element not found. Please try again.");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        intent.secret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        setLoading(false);
        throw new Error(`Payment failed: ${error.message}`);
      }

      console.log("Payment Successful:", paymentIntent);
      router.refresh();
    } catch (error) {
      console.error("Error confirming subscription:", error);
      toast.error("Failed to confirm subscription. Please try again.");
    } finally {
      setLoading(false);
      router.refresh();
      toast.success("Subscription created successfully!");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20">
          <PlusIcon />
          Create Webinar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>SpikeUp Subscription</DialogTitle>
        </DialogHeader>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#B4B0AE",
                "::placeholder": {
                  color: "#B4B0AE",
                },
              },
            },
          }}
        />

        <DialogFooter className="gap-4 items-center">
          <DialogClose
            className="w-full sm:w-auto border border-border rounded-md px-3 py-2"
            disabled={loading}
          >
            Cancel
          </DialogClose>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;

import { createCheckoutLink } from "@/actions/stripe";
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
import { WebinarWithPresenter } from "@/lib/type";
import { ChevronRight, Loader, Loader2, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  webinar: WebinarWithPresenter;
  userId: string;
};

const CTADialogBox = ({
  open,
  onOpenChange,
  trigger,
  webinar,
  userId,
}: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      if (webinar.ctaType === "BOOK_A_CALL") {
        router.push(`/live-webinar/${webinar.id}/call?attendeeId=${userId}`);
      } else {
        if (!webinar.priceId || !webinar.presenter.stripeConnectId) {
          return toast.error(
            "No priceId or presenter Stripe Connect ID found."
          );
        }
      }

      const session = await createCheckoutLink(
        webinar.priceId!,
        webinar.presenter.stripeConnectId!,
        userId,
        webinar.id,
        true
      );
      if (!session.sessionUrl) {
        throw new Error("Session URL not found");
      }

      window.open(session.sessionUrl, "_blank");
    } catch (error) {
      console.error("Error creating checkout link:", error);
      toast.error("Failed to create checkout link. Please try again later.");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {webinar.ctaType === "BOOK_A_CALL" ? "Book a Call" : "Buy Now"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {webinar.ctaType === "BOOK_A_CALL"
              ? "Book a call with the presenter to discuss further."
              : "Purchase the webinar to access exclusive content."}
          </p>
        </DialogHeader>

        <div className="flex mt-4 space-x-4">
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-background items-center justify-center">
              <Play />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold">{webinar.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {webinar.description}
            </p>
          </div>
        </div>
        <DialogFooter className="flex justify-between items-center mt-4 sm:mt-0">
          <DialogClose>Close</DialogClose>
          <Button
            disabled={loading}
            className="flex items-center"
            onClick={handleClick}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : webinar?.ctaType === "BOOK_A_CALL" ? (
              "Join Break-Room"
            ) : (
              "Buy Now"
            )}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CTADialogBox;

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
import {
  ChevronRight,
  Loader2,
  Play,
  Calendar,
  Users,
  Clock,
  Star,
} from "lucide-react";
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

        // window.open(session.sessionUrl, "_blank");
        window.location.href = session.sessionUrl;
      }
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
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background via-card to-background border-2 border-primary/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-lg" />

        <DialogHeader className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              {webinar.ctaType === "BOOK_A_CALL" ? (
                <Calendar className="h-5 w-5 text-primary" />
              ) : (
                <Star className="h-5 w-5 text-primary" />
              )}
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary via-primary/70 to-primary bg-clip-text text-transparent">
              {webinar.ctaType === "BOOK_A_CALL"
                ? "Book a Call"
                : "Premium Access"}
            </DialogTitle>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {webinar.ctaType === "BOOK_A_CALL"
                ? "Schedule a personalized one-on-one session with our expert presenter to dive deeper into the topics that matter most to you."
                : "Unlock exclusive premium content, resources, and lifetime access to this comprehensive webinar series."}
            </p>
          </div>
        </DialogHeader>

        <div className="relative z-10 mt-6">
          <div className="bg-gradient-to-r from-card via-muted/20 to-card p-6 rounded-xl border border-border/30 shadow-inner">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                    <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    {webinar.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {webinar.description}
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>Live Session</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Interactive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="relative z-10 flex justify-between items-center mt-8 pt-4 border-t border-border/30">
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Maybe Later
            </Button>
          </DialogClose>

          <Button
            disabled={loading}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 px-6"
            onClick={handleClick}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="font-semibold">
                  {webinar?.ctaType === "BOOK_A_CALL"
                    ? "Join Break-Room"
                    : "Get Access Now"}
                </span>
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CTADialogBox;

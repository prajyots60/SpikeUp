"use client";
import { registerAttendee } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAttendeeStore } from "@/store/useAttendeeStore";
import { WebinarStatusEnum } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  webinarId: string;
  webinarStatus: string;
  onResgistered?: () => void;
};

const WaitListComponent = ({
  webinarId,
  webinarStatus,
  onResgistered,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const { setAttendee } = useAttendeeStore();

  const router = useRouter();

  const buttonText = () => {
    switch (webinarStatus) {
      case WebinarStatusEnum.SCHEDULED:
        return "Get Reminder";
      case WebinarStatusEnum.LIVE:
        return "Join Webinar";
      case WebinarStatusEnum.WAITING_ROOM:
        return "Get Remainder";
      default:
        return "Register Now";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await registerAttendee({ email, name, webinarId });

      if (!res.success) {
        throw new Error(res.error || "Failed to register");
      }

      if (res.data?.user) {
        setAttendee({
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          callStatus: "PENDING",
          createdAt: res.data.user.createdAt,
          updatedAt: res.data.user.updatedAt,
        });
      }

      toast.success(
        webinarStatus === WebinarStatusEnum.LIVE
          ? "You have joined the webinar successfully!"
          : "You have been registered to the webinar successfully!"
      );

      setEmail("");
      setName("");
      setSubmitted(true);

      setTimeout(() => {
        setIsOpen(false);
        if (webinarStatus === WebinarStatusEnum.LIVE) {
          router.refresh();
        }

        if (onResgistered) {
          onResgistered();
        }
      }, 1500);
    } catch (error) {
      console.log("Error registering attendee:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to register"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`${
            webinarStatus === WebinarStatusEnum.LIVE
              ? "bg-red-600 hover:bg-red-700"
              : "bg-primary hover:bg-primary/90"
          } rounded-md px-4 py-2 text-primary-foreground text-sm font-semibold`}
        >
          {webinarStatus === WebinarStatusEnum.LIVE && (
            <span className="mr-2 h-2 w-2 bg-white rounded-full animate-pulse">
              {/* Join Webinar */}
            </span>
          )}
          {buttonText()}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-0 bg-transparent" showCloseButton={true}>
        <DialogHeader className="justify-center items-center border border-input rounded-xl p-4 bg-background">
          <DialogTitle className="text-center text-lg font-semibold mb-4">
            {webinarStatus === WebinarStatusEnum.LIVE
              ? "Join the Live Webinar"
              : "Join the Waitlist"}
          </DialogTitle>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            {!submitted && (
              <React.Fragment>
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </React.Fragment>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || submitted}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  {""}
                  {webinarStatus === WebinarStatusEnum.LIVE
                    ? "Joining..."
                    : "Registering..."}
                </>
              ) : submitted ? (
                webinarStatus === WebinarStatusEnum.LIVE ? (
                  "Joined Successfully!"
                ) : (
                  "Registered Successfully!"
                )
              ) : webinarStatus === WebinarStatusEnum.LIVE ? (
                "Join Webinar"
              ) : (
                "Register Now"
              )}
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default WaitListComponent;

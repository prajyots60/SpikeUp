"use client";
import { User, Webinar, WebinarStatusEnum } from "@prisma/client";
import React, { useState } from "react";
import CountdownTimer from "./CountdownTimer";
import Image from "next/image";
import WaitListComponent from "./WaitListComponent";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { changeWebinarStatus } from "@/actions/webinar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatISTDateLabel, formatISTTimeLabel } from "@/lib/utils";
import { createAndStartStream } from "@/actions/streamIo";

type Props = {
  webinar: Webinar;
  currentUser: User | null;
};

const WebinarUpcomingState = ({ webinar, currentUser }: Props) => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleStartWebinar = async () => {
    setLoading(true);
    try {
      if (!currentUser) {
        toast.error("You must be logged in to start a webinar.");
        return;
      }

      await createAndStartStream(webinar);
      const res = await changeWebinarStatus(webinar.id, "LIVE");

      if (!res.success) {
        throw new Error(res.message || "Failed to start webinar");
      }

      toast.success("Webinar started successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error starting webinar:", error);
      toast.error("Failed to start webinar. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full min-h-screen mx-auto max-w-[400px] flex flex-col justify-center items-center gap-8 py-20">
      <div className="space-y-6">
        <p className="text-3xl font-semibold text-primary text-center">
          Seems like you are little early for this webinar!
        </p>

        <CountdownTimer
          targetDate={new Date(webinar.startTime)}
          className="text-center"
          webinarId={webinar.id}
          webinarStatus={webinar.webinarStatus}
        />
      </div>
      <div className="space-y-6 w-full h-full flex flex-col justify-center items-center">
        <div className="w-full max-w-md aspect-[4/3] relative rounded-4xl overflow-hidden mb-6">
          <Image
            src={"/course_thumbnail.jpg"}
            alt={webinar.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {webinar?.webinarStatus === "SCHEDULED" ? (
          <WaitListComponent webinarId={webinar.id} webinarStatus="SCHEDULED" />
        ) : webinar?.webinarStatus === "WAITING_ROOM" ? (
          <>
            {currentUser?.id === webinar?.presenterId ? (
              <Button
                className="w-full max-w-[300px] font-semibold"
                onClick={handleStartWebinar}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Starting Webinar...
                  </>
                ) : (
                  "Start Webinar"
                )}
              </Button>
            ) : (
              <WaitListComponent
                webinarId={webinar.id}
                webinarStatus="WAITING_ROOM"
              />
            )}
          </>
        ) : webinar?.webinarStatus === WebinarStatusEnum.LIVE ? (
          <WaitListComponent webinarId={webinar.id} webinarStatus="LIVE" />
        ) : webinar?.webinarStatus === WebinarStatusEnum.CANCELLED ? (
          <p className="text-xl text-foreground text-center font-semibold">
            Webinar has been cancelled.
          </p>
        ) : (
          <Button>Ended</Button>
        )}
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold text-primary">{webinar.title}</h3>
        <p className="text-sm text-muted-foreground">{webinar.description}</p>
        <div className="w-full justify-center flex gap-2 flex-wrap items-center">
          <Button
            variant="outline"
            className="rounded-md bg-secondary backdrop-blur-2xl"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {formatISTDateLabel(webinar.startTime)}
          </Button>

          <Button variant={"outline"}>
            <Clock className="h-4 w-4 mr-2" />
            {formatISTTimeLabel(webinar.startTime)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebinarUpcomingState;

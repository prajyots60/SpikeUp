"use client";
import { User, Webinar, WebinarStatusEnum } from "@prisma/client";
import React from "react";
import WebinarUpcomingState from "./UpcomingWebinar/WebinarUpcomingState";
import { usePathname, useRouter } from "next/navigation";
import { useAttendeeStore } from "@/store/useAttendeeStore";
import LiveStreamState from "./LiveWebinar/LiveStreamState";
import { WebinarWithPresenter } from "@/lib/type";
import Participant from "./Participant/Participant";

type Props = {
  user: User | null;
  apiKey: string;
  token: string;
  callId: string;
  error?: string;
  webinar: WebinarWithPresenter;
};

const RenderWebinar = ({
  user,
  apiKey,
  token,
  callId,
  error,
  webinar,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { attendee } = useAttendeeStore();
  return (
    <React.Fragment>
      {webinar.webinarStatus === WebinarStatusEnum.SCHEDULED ? (
        <WebinarUpcomingState webinar={webinar} user={user || null} />
      ) : webinar.webinarStatus === WebinarStatusEnum.WAITING_ROOM ? (
        <WebinarUpcomingState webinar={webinar} user={user || null} />
      ) : webinar.webinarStatus === WebinarStatusEnum.LIVE ? (
        <React.Fragment>
          {user?.id === webinar.presenterId ? (
            <LiveStreamState
              apiKey={apiKey}
              token={token}
              callId={callId}
              webinar={webinar}
              user={user}
            />
          ) : attendee ? (
            <Participant apiKey={apiKey} webinar={webinar} callId={callId} />
          ) : (
            <WebinarUpcomingState webinar={webinar} user={user || null} />
          )}
        </React.Fragment>
      ) : webinar.webinarStatus === WebinarStatusEnum.CANCELLED ? (
        <div className="flex justify-center items-center h-full w-full">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold text-primary">
              {webinar.title}
            </h3>
            <p className="text-muted-foreground text-xs">
              This webinar has been cancelled.
            </p>
          </div>
        </div>
      ) : (
        <WebinarUpcomingState webinar={webinar} user={user || null} />
      )}
    </React.Fragment>
  );
};

export default RenderWebinar;

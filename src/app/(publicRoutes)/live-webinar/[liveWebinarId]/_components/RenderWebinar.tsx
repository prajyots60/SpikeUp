"use client";
import { User, WebinarStatusEnum } from "@prisma/client";
import React from "react";
import WebinarUpcomingState from "./UpcomingWebinar/WebinarUpcomingState";
import { useAttendeeStore } from "@/store/useAttendeeStore";
import LiveStreamState from "./LiveWebinar/LiveStreamState";
import { StreamCallRecording, WebinarWithPresenter } from "@/lib/type";
import Participant from "./Participant/Participant";

type Props = {
  user: User | null;
  apiKey: string;
  error: string | undefined;
  webinar: WebinarWithPresenter;
  recording?: StreamCallRecording;
};

const RenderWebinar = ({ user, apiKey, webinar, recording }: Props) => {
  const { attendee } = useAttendeeStore();
  return (
    /* 
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
    */

    <React.Fragment>
      {webinar.webinarStatus === WebinarStatusEnum.LIVE ? (
        <React.Fragment>
          {user?.id === webinar.presenterId ? (
            <LiveStreamState
              apiKey={apiKey}
              webinar={webinar}
              user={user}
              callId={webinar.id}
            />
          ) : attendee ? (
            <Participant
              apiKey={apiKey}
              webinar={webinar}
              callId={webinar.id}
            />
          ) : (
            <WebinarUpcomingState
              webinar={webinar}
              currentUser={user || null}
            />
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
      ) : webinar.webinarStatus === WebinarStatusEnum.ENDED ? (
        recording?.url ? (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-4xl">
              <h2 className="text-2xl font-bold text-center mb-4">
                {webinar.title} - Recording
              </h2>
              <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                <video
                  src={recording.url}
                  controls
                  className="w-full h-auto"
                  poster="/darkthumbnail.png"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>
                  Recorded:{" "}
                  {new Date(recording.start_time).toLocaleDateString()}
                </p>
                <p>Duration: {recording.filename}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full w-full">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-semibold text-primary">
                {webinar.title}
              </h3>
              <p className="text-muted-foreground text-xs">
                The webinar has ended. No recordings available.
              </p>
            </div>
          </div>
        )
      ) : (
        <WebinarUpcomingState webinar={webinar} currentUser={user || null} />
      )}
    </React.Fragment>
  );
};

export default RenderWebinar;

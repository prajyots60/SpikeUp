import { User, Webinar } from "@prisma/client";
import React from "react";
import WebinarUpcomingState from "./UpcomingWebinar/WebinarUpcomingState";

type Props = {
  user: User | null;
  apiKey: string;
  token: string;
  callId: string;
  error?: string;
  webinar: Webinar;
};

const RenderWebinar = ({
  user,
  apiKey,
  token,
  callId,
  error,
  webinar,
}: Props) => {
  return (
    <React.Fragment>
      {webinar.webinarStatus === "SCHEDULED" && user ? (
        <WebinarUpcomingState webinar={webinar} user={user} />
      ) : (
        ""
      )}
    </React.Fragment>
  );
};

export default RenderWebinar;

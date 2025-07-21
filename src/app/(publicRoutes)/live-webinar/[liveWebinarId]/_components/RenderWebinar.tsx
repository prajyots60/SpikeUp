import { User, Webinar } from "@prisma/client";
import React from "react";

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
  return <div>RenderWebinar</div>;
};

export default RenderWebinar;

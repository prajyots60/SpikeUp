import {
  StreamVideo,
  StreamVideoClient,
  User as StreamUser,
} from "@stream-io/video-react-sdk";

import { WebinarWithPresenter } from "@/lib/type";
import { User } from "@prisma/client";
import React, { useEffect, useState } from "react";
import CustomLivestreamPlayer from "./CustomLivestreamPlayer";
import { getTokenForHost } from "@/actions/streamIo";

type Props = {
  apiKey: string;
  callId: string;
  webinar: WebinarWithPresenter;
  user: User;
};

const hostUser: StreamUser = { id: process.env.NEXT_PUBLIC_STREAM_USER_ID! };
const LiveStreamState = ({ apiKey, callId, webinar, user }: Props) => {
  const [hostToken, setHostToken] = useState<string | null>(null);
  const client = new StreamVideoClient({ apiKey, user: hostUser, token });

  useEffect(() => {
    const init = async () => {
      try {
        const token = await getTokenForHost(user.id, user.name, user.name);
        setHostToken(token);
      } catch (error) {
        console.error("Error initializing Stream Video Client:", error);
      }
    };
    init();
  }, [apiKey, webinar]);
  return (
    <StreamVideo client={client}>
      <CustomLivestreamPlayer
        callId={callId}
        callType="livestream"
        webinar={webinar}
        username={user.name}
        token={token}
      />
    </StreamVideo>
  );
};

export default LiveStreamState;

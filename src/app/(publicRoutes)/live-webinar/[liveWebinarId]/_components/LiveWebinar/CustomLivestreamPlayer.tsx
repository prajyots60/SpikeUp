"use client";
import {
  Call,
  StreamCall,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import LiveWebinarView from "../Common/LiveWebinarView";

type Props = {
  callId: string;
  callType: "livestream" | "video";
  webinar: any; // Replace with actual type
  username: string;
  token: string;
};

const CustomLivestreamPlayer = ({
  callId,
  callType,
  webinar,
  username,
  token,
}: Props) => {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call>();
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    if (!client) return;
    const myCall = client.call(callType, callId);
    setCall(myCall);
    myCall.join({ create: true }).then(
      () => setCall(myCall),
      () => console.error("Failed to join call")
    );

    return () => {
      // myCall.leave().catch((e) => {
      //   console.log("Error leaving call:", e);
      // });
      setCall(undefined);
    };
  }, [client, callId, callType, username]);

  if (!call) return null;
  return (
    <StreamCall call={call}>
      <LiveWebinarView
        showChat={showChat}
        setShowChat={setShowChat}
        webinar={webinar}
        username={username}
        isHost={true}
        userToken={token}
        userId={webinar.presenter.id}
        call={call}
      />
    </StreamCall>
  );
};

export default CustomLivestreamPlayer;

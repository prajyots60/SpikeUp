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
    const myCall = client.call(callId, callType);
    setCall(myCall);
    myCall.join().catch((e) => {
      console.log("Error joining call:", e);
    });

    return () => {
      myCall.leave().catch((e) => {
        console.log("Error leaving call:", e);
      });
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
        userId={process.env.NEXT_PUBLIC_STREAM_USER_ID!}
      />
    </StreamCall>
  );
};

export default CustomLivestreamPlayer;

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
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Triangle } from "lucide-react";

type Props = {
  apiKey: string;
  callId: string;
  webinar: WebinarWithPresenter;
  user: User;
};

const LiveStreamState = ({ apiKey, callId, webinar, user }: Props) => {
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await getTokenForHost(
          webinar.presenterId,
          webinar.presenter.name,
          webinar.presenter.profileImage
        );

        const hostUser: StreamUser = {
          id: webinar.presenterId,
          name: webinar.presenter.name,
          image: webinar.presenter.profileImage || "",
        };

        const streamClient = new StreamVideoClient({
          apiKey,
          user: hostUser,
          token,
        });
        setHostToken(token);
        setClient(streamClient);
      } catch (error) {
        console.error("Error initializing Stream Video Client:", error);
      }
    };
    init();
  }, [apiKey, webinar]);

  if (!client || !hostToken) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="iconBackground p-4 relative overflow-hidden group">
            <Triangle className="w-8 h-8 fill-primary/20 stroke-2 group-hover:scale-110 transition-all duration-300" />
            <div
              className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin opacity-20 group-hover:opacity-60 transition-opacity duration-300"
              style={{ animationDuration: "8s" }}
            ></div>
            <div className="absolute inset-2 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
            <div className="absolute -top-1 left-1/2 w-0.5 h-3 bg-gradient-to-t from-primary/60 to-transparent transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="relative w-[320px] sm:w-[560px] md:w-[720px] aspect-video">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
          <div
            className="flex items-center gap-2 text-muted-foreground"
            aria-busy="true"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Preparing your livestream...</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <StreamVideo client={client}>
      <CustomLivestreamPlayer
        callId={callId}
        callType="livestream"
        webinar={webinar}
        username={user.name}
        token={hostToken}
      />
    </StreamVideo>
  );
};

export default LiveStreamState;

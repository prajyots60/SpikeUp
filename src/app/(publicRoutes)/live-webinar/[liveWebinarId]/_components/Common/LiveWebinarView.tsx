"use client";
import { WebinarWithPresenter } from "@/lib/type";
import { Loader2, MessageSquare, Users } from "lucide-react";
import { StreamChat } from "stream-chat";
import {
  ParticipantView,
  useCallStateHooks,
  type Call,
} from "@stream-io/video-react-sdk";
import React, { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CtaTypeEnum } from "@prisma/client";
import { Chat, Channel, MessageList, MessageInput } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import CTADialogBox from "./CTADialogBox";
import { changeWebinarStatus } from "@/actions/webinar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ObsDialogBox from "./ObsDialogBox";

type Props = {
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  webinar: WebinarWithPresenter;
  username: string;
  isHost?: boolean;
  userToken: string;
  userId: string;
  call: Call;
};

const LiveWebinarView = ({
  showChat,
  setShowChat,
  webinar,
  username,
  isHost,
  userToken,
  userId,
  call,
}: Props) => {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const { useParticipantCount, useParticipants } = useCallStateHooks();
  const viewerCount = useParticipantCount();
  const participants = useParticipants();
  const hostParticipant = participants.length > 0 ? participants[0] : null;

  const [obsDialogBox, setObsDialogOpen] = useState(false);

  const router = useRouter();

  const handleCTAButtonClick = async () => {
    if (!channel) return;
    console.log("CTA button click", channel);
    await channel.sendEvent({
      type: "open-cta-dialog",
    });
  };

  const handleEndStream = async () => {
    setLoading(true);
    try {
      call.stopLive({
        continue_recording: false,
      });

      call.endCall();

      const res = await changeWebinarStatus(webinar.id, "ENDED");
      if (!res.success) {
        throw new Error(res.message || "Failed to end webinar");
      }

      toast.success("Webinar ended successfully");
      router.push("/webinars");
    } catch (error) {
      console.log("Error in ending stream", error);
      toast.error("Error in ending stream");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initChat = async () => {
      const client = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY!
      );

      await client.connectUser(
        {
          id: userId,
          name: username,
        },
        userToken
      );

      const channel = client.channel("livestream", webinar.id, {
        name: webinar.title,
      });

      await channel.watch();
      setChatClient(client);
      setChannel(channel);
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [userId, username, userToken, webinar.id, webinar.title]);

  useEffect(() => {
    if (chatClient && channel) {
      channel.on((event: any) => {
        if (event.type === "open-cta-dialog" && !isHost) {
          setDialogOpen(true);
        }

        if (event.type === "start-live") {
          window.location.reload();
        }
      });
    }
  }, [chatClient, channel, isHost]);

  // useEffect(() => {
  //   call.on("call.rtmp_broadcast_started", () => {
  //     toast.success("Webinar started successfully");
  //     router.refresh();
  //   });

  //   call.on("call.rtmp_broadcast_failed", () => {
  //     toast.success("Stream failed to start");
  //   });
  // }, [call, router]);

  //TODO: Handle recording events
  useEffect(() => {
    call.on("call.recording_started", () => {
      toast.success("Recording started successfully");
    });
    call.on("call.recording_stopped", () => {
      toast.success("Recording stopped successfully");
    });
  }, [call]);

  if (!chatClient || !channel) return null;
  return (
    <div className="flex flex-col w-full h-screen max-h-screen overflow-hidden bg-background text-foreground">
      <div className="py-2 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-accent-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive animate-pulse"></span>
            </span>
            LIVE
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-muted/50 px-3 py-1 rounded-full">
            <Users size={16} />
            <span className="text-sm font-medium">{viewerCount}</span>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
              showChat
                ? "bg-accent-primary text-primary-foreground"
                : "bg-muted/50"
            }`}
          >
            <MessageSquare size={16} />
            <span>Chat</span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 p-2 gap-2 overflow-hidden">
        <div className="flex-1 rounded-lg overflow-hidden border border-border flex flex-col bg-card">
          <div className="flex-1 relative overflow-hidden">
            {hostParticipant ? (
              <div className="h-full w-full">
                <ParticipantView
                  participant={hostParticipant}
                  className="w-full h-full object-cover !max-w-full "
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col space-y-4">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <Users size={40} className="text-muted-foreground" />
                </div>
                <p>Waiting for stream to start...</p>
              </div>
            )}

            {isHost && (
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                Host
              </div>
            )}
          </div>
          <div className="p-2 border-t border-border flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium capitalize">
                {webinar?.title}
              </div>
            </div>

            {isHost && (
              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => setObsDialogOpen(true)}
                  variant={"outline"}
                  className="mr-2"
                >
                  Get OBS Creds
                </Button>
                <Button
                  variant={"outline"}
                  className="mr-2"
                  onClick={async () => {
                    await channel.sendEvent({
                      type: "start-live",
                    });
                  }}
                >
                  Go Live
                </Button>
                <Button
                  onClick={handleEndStream}
                  disabled={loading}
                  variant={"destructive"}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    "End Stream"
                  )}
                </Button>
                <Button onClick={handleCTAButtonClick}>
                  {webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
                    ? "Book a Call"
                    : "Buy Now"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {showChat && (
          <Chat client={chatClient}>
            <Channel channel={channel}>
              <div className="w-72 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="py-2 px-3 text-primary border-b border-border font-medium flex items-center justify-between">
                  <span>Chat</span>
                  <span className="text-xs bg-muted/50 px-2 py-0.5 rounded-full">
                    {viewerCount} viewers
                  </span>
                </div>
                <MessageList />
                <div className="p-2 border-t border-border">
                  <MessageInput />
                </div>
              </div>
            </Channel>
          </Chat>
        )}
      </div>

      {!isHost && dialogOpen && (
        <CTADialogBox
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          webinar={webinar}
          userId={userId}
        />
      )}

      {obsDialogBox && (
        <ObsDialogBox
          open={obsDialogBox}
          onOpenChange={setObsDialogOpen}
          rtmpURL={`rtmps://ingress.stream-io-video.com:443/${process.env.NEXT_PUBLIC_STREAM_API_KEY}.livestream.${webinar.id}`}
          streamKey={userToken}
        />
      )}
    </div>
  );
};

export default LiveWebinarView;

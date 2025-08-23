"use client";
import { changeCallStatus } from "@/actions/attendance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WebinarWithPresenter } from "@/lib/type";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi/vapiClient";
import { CallStatusEnum } from "@prisma/client";
import { set } from "date-fns";
import { Bot, Clock, Mic, MicOff } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CallStatus = {
  CONNECTING: "CONNECTING",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
};

type Props = {
  userName: string;
  assistantId: string;
  webinar: WebinarWithPresenter;
  userId: string;
  callTimeLimit?: number;
  assistantName?: string;
};

const AutoConnectCall = ({
  userName = "User",
  assistantId,
  webinar,
  userId,
  callTimeLimit = 180,
  assistantName = "Ai Assistant",
}: Props) => {
  const [callStatus, setCallStatus] = useState(CallStatus.CONNECTING);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [userIsSpeaking, setUserIsSpeaking] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(callTimeLimit);

  const refs = useRef({
    countdownTimer: undefined as NodeJS.Timeout | undefined,
    audioStream: null as MediaStream | null,
    userSpeakingTimeout: undefined as NodeJS.Timeout | undefined,
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const cleanup = () => {
    if (refs.current.countdownTimer) {
      clearInterval(refs.current.countdownTimer);
      refs.current.countdownTimer = undefined;
    }
    if (refs.current.userSpeakingTimeout) {
      clearTimeout(refs.current.userSpeakingTimeout);
      refs.current.userSpeakingTimeout = undefined;
    }
    if (refs.current.audioStream) {
      refs.current.audioStream.getTracks().forEach((track) => track.stop());
      refs.current.audioStream = null;
    }
  };

  const setupAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      refs.current.audioStream = stream;

      //Simple speech detection using audioContext
      const audioContext = new (window.AudioContext || window.AudioContext)();
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyzer);

      //monitor audio levels
      const checkAudioLevel = () => {
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);

        //calculate avg volume
        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedVolume = average / 256;

        //detect the speech based on volume
        if (normalizedVolume > 0.15 && !assistantIsSpeaking && !isMicMuted) {
          setUserIsSpeaking(true);

          //clear previous timeout
          if (refs.current.userSpeakingTimeout) {
            clearTimeout(refs.current.userSpeakingTimeout);
          }

          //reset after short delay
          refs.current.userSpeakingTimeout = setTimeout(() => {
            setUserIsSpeaking(false);
          }, 500);
        }
        //continue monitoring
        requestAnimationFrame(checkAudioLevel);
      };
      checkAudioLevel();
    } catch (error) {
      console.error("Error setting up audio:", error);
    }
  };

  const stopCall = async () => {
    try {
      vapi.stop();
      setCallStatus(CallStatus.FINISHED);
      cleanup();
      const res = await changeCallStatus(userId, CallStatusEnum.COMPLETED);
      if (!res.success) {
        throw new Error("Failed to change call status");
      }
      toast.success("Call ended Successfully");
    } catch (error) {
      console.error("Error stopping call:", error);
      toast.error("Failed to end call");
    }
  };

  useEffect(() => {
    const onCallStart = async () => {
      console.log("Call started");
      setCallStatus(CallStatus.ACTIVE);
      setupAudio();

      setTimeRemaining(callTimeLimit);
      refs.current.countdownTimer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(refs.current.countdownTimer);
            stopCall();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setCallStatus(CallStatus.FINISHED);
      cleanup();
    };

    const onSpeechStart = () => {
      setAssistantIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setAssistantIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("Vapi occurred:", error);
      setCallStatus(CallStatus.FINISHED);
      cleanup();
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [userName, callTimeLimit]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-background">
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 relative">
        <div className="flex-1 bg-card rounded-xl overflow-hidden shadow-lg relative">
          <div className="absolute top-4 left-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 z-10">
            <Mic
              className={cn(
                "h-4 w-4",
                assistantIsSpeaking ? "text-accent-primary" : ""
              )}
            />
            <span>{assistantName}</span>
          </div>

          <div className="h-full flex items-center justify-center">
            <div className="relative">
              {assistantIsSpeaking && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-accent-primary animate-ping opacity-10"
                    style={{ margin: "-8px" }}
                  />

                  <div
                    className="absolute inset-0 rounded-full border-4 border-accent-primary animate-ping opacity-10"
                    style={{ margin: "-16px", animationDelay: "0.5s" }}
                  />
                </>
              )}

              <div
                className={cn(
                  "flex justify-center items-center rounded-full overflow-hidden border-4 p-6 ",
                  assistantIsSpeaking
                    ? "border-accent-primary"
                    : "border-accent-secondary/50"
                )}
              >
                <Bot className="w-[70px] h-[70px]" />
              </div>

              {assistantIsSpeaking && (
                <div className="absolute -bottom-2 -right-2 bg-accent-primary text-white p-2 rounded-full">
                  <Mic className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-card rounded-xl overflow-hidden shadow-lg relative">
          <div className="absolute top-4 left-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 z-10">
            {isMicMuted ? (
              <>
                <MicOff className="h-4 w-4 text-destructive" />
                <span>Muted</span>
              </>
            ) : (
              <>
                <Mic
                  className={cn(
                    "h-4 w-4",
                    userIsSpeaking ? "text-accent-primary" : ""
                  )}
                />
                <span>{userName}</span>
              </>
            )}
          </div>

          <div className="absolute top-4 right-4 bg-black/40 text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 z-10">
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeRemaining)}</span>
          </div>

          <div className="h-full flex items-center justify-center">
            <div className="relative">
              {userIsSpeaking && !isMicMuted && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-accent-secondary animate-ping opacity-20"
                    style={{ margin: "-8px" }}
                  />
                </>
              )}

              <div
                className={cn(
                  "flex justify-center items-center overflow-hidden rounded-full border-4",
                  isMicMuted
                    ? "border-destructive/50 "
                    : userIsSpeaking
                    ? "border-accent-secondary"
                    : "border-accent-secondary/50"
                )}
              >
                <Avatar className="w-[100px] h-[100px]">
                  <AvatarImage src={"/user-avatar.png"} alt={userName} />
                  <AvatarFallback>{userName.split("")?.[0]}</AvatarFallback>
                </Avatar>
              </div>

              {isMicMuted && (
                <div className="absolute -bottom-2 -right-2 bg-destructive text-white p-2 rounded-full">
                  <MicOff className="h-5 w-5" />
                </div>
              )}

              {userIsSpeaking && !isMicMuted && (
                <div className="absolute -bottom-2 -right-2 bg-accent-secondary text-white p-2 rounded-full">
                  <Mic className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoConnectCall;

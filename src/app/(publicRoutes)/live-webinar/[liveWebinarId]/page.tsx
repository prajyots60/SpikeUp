import { OnAuthenticateUser } from "@/actions/auth";
import { getWebinarById } from "@/actions/webinar";
import React from "react";
import RenderWebinar from "./_components/RenderWebinar";
import { WebinarWithPresenter, StreamCallRecording } from "@/lib/type";
import { WebinarStatusEnum } from "@prisma/client";
import { getWebinarRecordings } from "@/actions/streamIo";

type Props = {
  params: Promise<{
    liveWebinarId: string;
  }>;
  searchParams: Promise<{
    error: string;
  }>;
};

const page = async ({ params, searchParams }: Props) => {
  const { liveWebinarId } = await params;
  const { error } = await searchParams;

  const webinarData = await getWebinarById(liveWebinarId);

  let recording: StreamCallRecording | null = null;

  // if (webinarData?.webinarStatus === WebinarStatusEnum.ENDED) {
  //   try {
  //     const recordings = await getWebinarRecordings(liveWebinarId);
  //     // Get the most recent recording if multiple exist
  //     if (recordings?.recordings && recordings.recordings.length > 0) {
  //       // Map the Stream.io recording to our type
  //       const streamRecording = recordings.recordings[0];
  //       recording = {
  //         filename: streamRecording.filename,
  //         url: streamRecording.url,
  //         start_time: streamRecording.start_time.toString(),
  //         end_time: streamRecording.end_time.toString(),
  //         session_id: streamRecording.session_id,
  //       };
  //     }
  //   } catch (error) {
  //     console.error("Error fetching recordings:", error);
  //     // recording remains null if there's an error
  //   }
  // }
  if (!webinarData) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center text-lg sm:text-4xl">
        Webinar Not Found
      </div>
    );
  }

  const checkUser = await OnAuthenticateUser();

  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY as string;

  return (
    <div className="w-full min-h-screen mx-auto">
      <RenderWebinar
        user={checkUser.user || null}
        apiKey={apiKey}
        error={error}
        webinar={webinarData as WebinarWithPresenter}
        recording={recording || undefined}
      />
    </div>
  );
};

export default page;

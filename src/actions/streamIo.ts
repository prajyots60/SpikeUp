"use server";

import { prismaClient } from "@/lib/prismaClient";
import { getStreamClient } from "@/lib/stream/streamClient";
import { Attendee, Webinar } from "@prisma/client";
import { UserRequest } from "@stream-io/node-sdk";

export const getStreamIoToken = async (attendee: Attendee | null) => {
  try {
    const newUser: UserRequest = {
      id: attendee?.id || "guest",
      role: "user",
      name: attendee?.name || "Guest",
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${
        attendee?.name || "Guest"
      }`,
    };

    await getStreamClient.upsertUsers([newUser]);

    const validity = 60 * 60 * 60;

    const token = getStreamClient.generateUserToken({
      user_id: attendee?.id || "guest",
      validity_in_seconds: validity,
    });

    return token;
  } catch (error) {
    console.error("Error generating Stream IO token:", error);
    throw new Error("Failed to generate Stream IO token");
  }
};

export const getTokenForHost = async (
  userId: string,
  username: string,
  profilePic: string
) => {
  try {
    const newUser: UserRequest = {
      id: userId,
      role: "user",
      name: username || "Guest",
      image:
        profilePic ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${username || "Guest"}`,
    };
    await getStreamClient.upsertUsers([newUser]);

    const validity = 60 * 60 * 60;
    const token = getStreamClient.generateUserToken({
      user_id: userId,
      validity_in_seconds: validity,
    });
    return token;
  } catch (error) {
    console.log("Error generating token for host:", error);
    throw new Error("Failed to generate token for host");
  }
};

export const createAndStartStream = async (webinar: Webinar) => {
  try {
    const checkWebinar = await prismaClient.webinar.findMany({
      where: {
        presenterId: webinar.presenterId,
        webinarStatus: "LIVE",
      },
    });

    if (checkWebinar.length > 0) {
      throw new Error("You already have a live webinar running");
    }

    const call = getStreamClient.video.call("livestream", webinar.id);
    await call.getOrCreate({
      data: {
        created_by_id: webinar.presenterId,
        members: [
          {
            user_id: webinar.presenterId,
            role: "host",
          },
        ],
      },
    });

    // Start the live stream
    await call.goLive({});

    // Start recording automatically when going live
    // await call.startRecording();

    console.log("Stream started successfully");
    return {
      id: call.id,
      type: call.type,
      createdBy: webinar.presenterId,
    };
  } catch (error) {
    console.error("Error starting stream:", error);
    throw new Error("Failed to start stream");
  }
};

export const getWebinarRecordings = async (webinarId: string) => {
  try {
    const call = getStreamClient.video.call(webinarId, "livestream");

    // Get all recordings for this call
    const recordings = await call.listRecordings();

    return recordings;
  } catch (error) {
    console.error("Error getting recordings:", error);
    throw new Error("Failed to get recordings");
  }
};

export const getWebinarRecordingById = async (
  webinarId: string,
  recordingId: string
) => {
  try {
    const call = getStreamClient.video.call(webinarId, "livestream");

    // Get all recordings for this call and filter by recording ID
    const recordings = await call.listRecordings();

    // Find the specific recording by ID
    const recording = recordings.recordings.find(
      (rec: any) =>
        rec.filename === recordingId || rec.url.includes(recordingId)
    );

    if (!recording) {
      throw new Error("Recording not found");
    }

    return recording;
  } catch (error) {
    console.error("Error getting recording by ID:", error);
    throw new Error("Failed to get recording");
  }
};

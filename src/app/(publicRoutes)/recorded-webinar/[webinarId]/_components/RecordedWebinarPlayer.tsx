"use client";

import React, { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import WebinarInfo from "./WebinarInfo";
import WebinarSidebar from "./WebinarSidebar";
import WebinarHeader from "./WebinarHeader";
import { RecordedWebinarData } from "@/lib/type";

interface RecordedWebinarPlayerProps {
  webinar: RecordedWebinarData;
}

const RecordedWebinarPlayer: React.FC<RecordedWebinarPlayerProps> = ({
  webinar,
}) => {
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Extract the key from the full URL (assuming the URL format)
  const getKeyFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Remove the leading slash and extract the path
      const fullPath = urlObj.pathname.substring(1);

      // If the path starts with the bucket name, remove it
      const bucketName = "spikeup";
      if (fullPath.startsWith(bucketName + "/")) {
        return fullPath.substring(bucketName.length + 1);
      }

      return fullPath;
    } catch (error) {
      console.error("Error parsing URL:", error);
      return "";
    }
  };

  // Fetch signed URL for the video
  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        setVideoLoading(true);
        setVideoError(null);

        // Use recordingKey if available, otherwise extract from recordingUrl
        let videoKey: string;
        if (webinar.recordingKey) {
          videoKey = webinar.recordingKey;
          console.log("Using recordingKey:", videoKey);
        } else if (webinar.recordingUrl) {
          videoKey = getKeyFromUrl(webinar.recordingUrl);
          console.log("Original URL:", webinar.recordingUrl);
          console.log("Extracted key:", videoKey);
        } else {
          throw new Error("No recording URL or key available");
        }

        if (!videoKey) {
          throw new Error("Invalid video URL or key");
        }

        const response = await fetch("/api/media/signed-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: videoKey,
            expiresIn: 3600, // 1 hour
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error(`Failed to get signed URL: ${response.status}`);
        }

        const data = await response.json();

        console.log("Signed URL response:", data);

        if (data.success && data.url) {
          console.log("Generated signed URL:", data.url);
          setSignedVideoUrl(data.url);
        } else {
          throw new Error(data.error || "Failed to get signed URL");
        }
      } catch (error) {
        console.error("Error fetching signed URL:", error);
        setVideoError(
          error instanceof Error ? error.message : "Failed to load video"
        );
      } finally {
        setVideoLoading(false);
      }
    };

    fetchSignedUrl();
  }, [webinar.recordingUrl, webinar.recordingKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <WebinarHeader />

      <div className="w-full px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Video Section */}
          <div className="xl:col-span-3 space-y-6">
            {/* Video Player */}
            <VideoPlayer
              videoUrl={signedVideoUrl}
              thumbnail={webinar.thumbnail}
              isLoading={videoLoading}
              error={videoError}
            />

            {/* Webinar Information */}
            <WebinarInfo webinar={webinar} />
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <WebinarSidebar webinar={webinar} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordedWebinarPlayer;

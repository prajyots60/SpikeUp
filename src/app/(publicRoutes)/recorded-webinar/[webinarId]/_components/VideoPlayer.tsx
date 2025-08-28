"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string | null;
  thumbnail?: string | null;
  isLoading: boolean;
  error: string | null;
  onShare?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnail,
  isLoading,
  error,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [seekFeedback, setSeekFeedback] = useState<string | null>(null);
  const seekFeedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeekTimeRef = useRef<number>(0);

  // Add fullscreen styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .fullscreen-container:fullscreen {
        background: black;
      }
      .fullscreen-container:fullscreen video {
        width: 100vw;
        height: 100vh;
        object-fit: contain;
      }
      .fullscreen-hide-cursor {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const showSeekFeedback = (direction: "forward" | "backward") => {
    const message = direction === "forward" ? "+10 seconds" : "-10 seconds";
    setSeekFeedback(message);

    if (seekFeedbackTimeoutRef.current) {
      clearTimeout(seekFeedbackTimeoutRef.current);
    }

    seekFeedbackTimeoutRef.current = setTimeout(() => {
      setSeekFeedback(null);
    }, 1000);
  };

  // Add keyboard and fullscreen event listeners
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          (activeElement as HTMLElement).contentEditable === "true")
      ) {
        return;
      }

      if (!videoUrl || isLoading || error) {
        return;
      }

      switch (e.code) {
        case "KeyF":
          e.preventDefault();
          e.stopPropagation();
          toggleFullscreen();
          break;
        case "Space":
          e.preventDefault();
          e.stopPropagation();
          handlePlayPause();
          break;
        case "KeyM":
          e.preventDefault();
          e.stopPropagation();
          toggleMute();
          break;
        case "ArrowLeft":
          e.preventDefault();
          e.stopPropagation();
          if (videoRef.current) {
            const now = Date.now();
            if (now - lastSeekTimeRef.current > 100) {
              const newTime = Math.max(0, videoRef.current.currentTime - 10);
              videoRef.current.currentTime = newTime;
              setCurrentTime(newTime);
              showSeekFeedback("backward");
              lastSeekTimeRef.current = now;
            }
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          e.stopPropagation();
          if (videoRef.current) {
            const now = Date.now();
            if (now - lastSeekTimeRef.current > 100) {
              const newTime = Math.min(
                videoRef.current.duration || duration,
                videoRef.current.currentTime + 10
              );
              videoRef.current.currentTime = newTime;
              setCurrentTime(newTime);
              showSeekFeedback("forward");
              lastSeekTimeRef.current = now;
            }
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          handleVolumeChange({
            target: { value: String(Math.min(1, volume + 0.1)) },
          } as any);
          break;
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          handleVolumeChange({
            target: { value: String(Math.max(0, volume - 0.1)) },
          } as any);
          break;
      }
    };

    const handleFullscreenChange = () => {
      const newIsFullscreen = !!document.fullscreenElement;
      setIsFullscreen(newIsFullscreen);

      setShowControls(true);

      if (!newIsFullscreen && hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };

    const handleMouseMove = () => {
      if (isFullscreen) {
        setShowControls(true);
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current);
        }
        hideControlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("mousemove", handleMouseMove);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      if (seekFeedbackTimeoutRef.current) {
        clearTimeout(seekFeedbackTimeoutRef.current);
      }
    };
  }, [isFullscreen, videoUrl, isLoading, error, volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(console.error);
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);

    setVolume(newVolume);
    if (video) {
      video.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    const videoContainer = videoRef.current?.parentElement;
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative group">
      <Card className="overflow-hidden bg-black border-gray-800/50 shadow-2xl">
        <div
          className={`relative aspect-video bg-black rounded-lg overflow-hidden ${
            isFullscreen ? "fullscreen-container" : ""
          } ${isFullscreen && !showControls ? "fullscreen-hide-cursor" : ""}`}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white text-lg font-medium">
                  Loading video...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400 text-2xl">⚠</span>
                </div>
                <p className="text-red-400 text-lg font-medium mb-2">
                  Error loading video
                </p>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {videoUrl && !isLoading && !error && (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={thumbnail || undefined}
              className="w-full h-full object-contain cursor-pointer"
              onClick={handlePlayPause}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                  videoRef.current.volume = volume;
                }
              }}
              onError={(e) => {
                console.error("Video error:", e);
              }}
            />
          )}

          {/* Seek Feedback Overlay */}
          {seekFeedback && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/90 text-white px-6 py-3 rounded-xl text-lg font-semibold backdrop-blur-sm border border-white/20">
                {seekFeedback}
              </div>
            </div>
          )}

          {/* Enhanced Controls Overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-all duration-300 ${
              isFullscreen ? "z-50" : ""
            } ${
              isFullscreen && !showControls
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            {/* Progress Bar */}
            <div className="px-6 pt-6 pb-2">
              <div className="relative group">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progressPercentage}
                  onChange={handleSeek}
                  disabled={isLoading || error !== null}
                  className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 group-hover:h-3 transition-all duration-200"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${progressPercentage}%, rgba(255,255,255,0.2) ${progressPercentage}%, rgba(255,255,255,0.2) 100%)`,
                  }}
                />
                {/* Time tooltip */}
                <div
                  className="absolute -top-10 left-0 transform -translate-x-1/2 bg-black/90 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                  style={{ left: `${progressPercentage}%` }}
                >
                  {formatTime(currentTime)}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handlePlayPause}
                    disabled={isLoading || error !== null || !videoUrl}
                    className="text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-12 h-12 p-0"
                  >
                    {playing ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-0.5" />
                    )}
                  </Button>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      disabled={isLoading || error !== null || !videoUrl}
                      className="text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                    >
                      {muted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="w-20 group">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        disabled={isLoading || error !== null || !videoUrl}
                        className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 group-hover:h-2 transition-all"
                      />
                    </div>
                  </div>

                  <div className="text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  disabled={isLoading || error !== null || !videoUrl}
                  className="text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VideoPlayer;

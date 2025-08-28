"use client";
import React from "react";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress = ({
  percentage,
  size = 40,
  strokeWidth = 4,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-300"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-purple-600 transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>

      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-purple-600">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

const GlobalUploadStatus = () => {
  const {
    isVideoUploading,
    videoUploadProgress,
    videoUploadStatus,
    videoFile,
    cancelVideoUpload,
  } = useVideoUpload();

  // Don't show anything if no upload is happening or completed
  if (!isVideoUploading && videoUploadStatus !== "success") {
    return null;
  }

  return (
    <div className="ml-12 mt-2 mb-4">
      <div className="flex items-center space-x-3">
        {isVideoUploading ? (
          <>
            <div className="relative">
              <CircularProgress
                percentage={videoUploadProgress.percentage}
                size={32}
                strokeWidth={3}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-300">Uploading...</p>
              <p className="text-xs text-gray-500 truncate">
                {videoFile?.name}
              </p>
            </div>
          </>
        ) : videoUploadStatus === "success" ? (
          <>
            <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-green-400">Ready!</p>
              <p className="text-xs text-green-500/70 truncate">
                {videoFile?.name}
              </p>
            </div>
          </>
        ) : null}

        {isVideoUploading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelVideoUpload}
            className="text-gray-500 hover:text-gray-300 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default GlobalUploadStatus;

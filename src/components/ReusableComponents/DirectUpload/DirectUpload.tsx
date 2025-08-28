"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { X, CheckCircle, AlertCircle, File, Video, Image } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FileType = "video" | "image" | "document";

interface DirectUploadProps {
  label: string;
  accept: string;
  maxSize: number; // in MB
  fileType: FileType;
  onUploadComplete: (url: string, key: string) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  currentFile?: string | null;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const DirectUpload: React.FC<DirectUploadProps> = ({
  label,
  accept,
  maxSize,
  fileType,
  onUploadComplete,
  onUploadStart,
  onUploadError,
  className,
  disabled = false,
  currentFile = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size must be less than ${maxSize}MB`,
      };
    }

    // Check file type - handle both MIME types and extensions
    const allowedTypes = accept.split(",").map((type) => type.trim());
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    // Common video MIME types for better support
    const videoMimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.m4v': 'video/x-m4v'
    };

    // Check if file type matches allowed types
    let isValidType = false;
    
    // Check direct MIME type match
    if (allowedTypes.includes(file.type)) {
      isValidType = true;
    }
    
    // Check file extension match
    if (!isValidType && allowedTypes.includes(fileExtension)) {
      isValidType = true;
    }
    
    // Check if it's a video file and we're accepting videos
    if (!isValidType && fileType === 'video') {
      // If accept includes video/* or specific video types, check common video extensions
      const acceptsVideo = allowedTypes.some(type => 
        type.includes('video/') || type.includes('.mp4') || type.includes('.mkv') || type.includes('.webm')
      );
      
      if (acceptsVideo && videoMimeTypes[fileExtension]) {
        isValidType = true;
      }
    }

    if (!isValidType) {
      return {
        valid: false,
        error: `Invalid file type. File: ${file.type || 'unknown'} (${fileExtension}). Allowed types: ${allowedTypes.join(", ")}`,
      };
    }

    return { valid: true };
  };

  const uploadToCloudflare = async (
    file: File,
    presignedUrl: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      abortControllerRef.current = new AbortController();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setUploadProgress({
            loaded: event.loaded,
            total: event.total,
            percentage,
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(
            new Error(
              `Upload failed with status ${xhr.status}: ${
                xhr.responseText || "Unknown error"
              }`
            )
          );
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error(`Network error during upload. Status: ${xhr.status}`));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
      });

      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.send(file);

      // Handle abort
      abortControllerRef.current.signal.addEventListener("abort", () => {
        xhr.abort();
      });
    });
  };

  const handleFileSelect = async (file: File) => {
    if (disabled || isUploading) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      onUploadError?.(validation.error || "File validation failed");
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });
    onUploadStart?.();

    try {
      // Get presigned URL from server
      const response = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          uploadType: fileType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get presigned URL");
      }

      const { presignedUrl, key, publicUrl } = await response.json();

      // Upload directly to Cloudflare R2
      await uploadToCloudflare(file, presignedUrl);

      // Success
      setUploadStatus("success");
      toast.success("File uploaded successfully!");
      onUploadComplete(publicUrl, key);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsUploading(false);
      setUploadStatus("idle");
      setSelectedFile(null);
      setUploadProgress({ loaded: 0, total: 0, percentage: 0 });
      toast.info("Upload cancelled");
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
    setUploadProgress({ loaded: 0, total: 0, percentage: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = () => {
    switch (fileType) {
      case "video":
        return <Video className="w-6 h-6" />;
      case "image":
        return <Image className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Label className="text-sm font-medium">{label}</Label>

      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all",
          isDragging
            ? "border-purple-500 bg-purple-500/10"
            : uploadStatus === "success"
            ? "border-green-500 bg-green-500/10"
            : uploadStatus === "error"
            ? "border-red-500 bg-red-500/10"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* File Input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Upload Content */}
        <div className="text-center">
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Uploading {selectedFile?.name}...
                </p>
                <Progress
                  value={uploadProgress.percentage}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadProgress.loaded)} /{" "}
                  {formatFileSize(uploadProgress.total)}(
                  {uploadProgress.percentage}%)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelUpload}
                  className="mt-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : uploadStatus === "success" && selectedFile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-700">
                  Upload successful!
                </p>
                <p className="text-xs text-gray-600">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFile}
                className="mt-2"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          ) : uploadStatus === "error" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center text-red-600">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-700">
                  Upload failed
                </p>
                <p className="text-xs text-gray-600">{selectedFile?.name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFile}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center text-gray-400">
                {getFileIcon()}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Drag and drop your {fileType} here, or{" "}
                  <span className="text-purple-600 hover:text-purple-700 cursor-pointer">
                    browse
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Max file size: {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current File Display */}
      {currentFile && uploadStatus !== "success" && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          {getFileIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">Current file:</p>
            <p className="text-xs text-gray-600 truncate">{currentFile}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectUpload;

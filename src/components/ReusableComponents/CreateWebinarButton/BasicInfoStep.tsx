"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, ymdInIST, formatISTDateLabel, istDateFromYMD } from "@/lib/utils";
import { useWebinarStore } from "@/store/useWebinarStore";
import {
  CalendarIcon,
  Clock,
  FileVideo,
  CheckCircle,
  Loader2,
  Video,
  X,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { Progress } from "@/components/ui/progress";

const BasicInfoStep = () => {
  const { formData, updateBasicInfoField, getStepValidationErrors } =
    useWebinarStore();

  const {
    isVideoUploading,
    videoUploadProgress,
    videoUploadStatus,
    videoFile,
    videoUrl: uploadedVideoUrl,
    startVideoUpload,
    cancelVideoUpload,
    clearVideoUpload,
  } = useVideoUpload();

  const errors = getStepValidationErrors("basicInfo");

  const { webinarName, description, date, time, timeFormat, isPreRecorded } =
    formData.basicInfo;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateBasicInfoField(name as keyof typeof formData.basicInfo, value);
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) {
      updateBasicInfoField("date", "");
      return;
    }

    // Convert picked date to YYYY-MM-DD in IST to avoid UTC drift
    const pickedYMD = ymdInIST(newDate);
    updateBasicInfoField("date", pickedYMD);

    // Prevent past dates based on IST calendar date
    const todayYMD = ymdInIST(new Date());
    if (pickedYMD < todayYMD) {
      updateBasicInfoField("date", todayYMD);
      toast.error("Webinar date cannot be in the past. Setting to today.");
    }
  };

  const handleTimeFormatChange = (value: "AM" | "PM") => {
    updateBasicInfoField("timeFormat", value);
  };

  const handleFileSelect = async (file: File) => {
    if (isVideoUploading) return;
    await startVideoUpload(file);
  };

  const validateFile = (
    file: File
  ): { valid: boolean; error?: string; warning?: string } => {
    // Check file size (500MB max)
    const maxSizeBytes = 500 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size must be less than 500MB`,
      };
    }

    // Check file type
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
      "video/avi",
    ];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));
    const allowedExtensions = [".mp4", ".webm", ".mov", ".avi"];
    const unsupportedExtensions = [".mkv"];

    // Check for unsupported formats
    if (
      unsupportedExtensions.includes(fileExtension) ||
      file.type === "video/x-matroska"
    ) {
      return {
        valid: false,
        error: `MKV files are not supported for web playback. Please convert to MP4, WebM, or MOV format first. You can use free tools like HandBrake or VLC to convert your video.`,
      };
    }

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      return {
        valid: false,
        error: `Invalid file type. Supported formats: MP4, WebM, MOV, AVI`,
      };
    }

    return { valid: true };
  };

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    await handleFileSelect(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="webinarName"
          className={errors.webinarName ? "text-red-400" : ""}
        >
          Webinar Name <span className="text-red-400">*</span>
        </Label>
        <Input
          id="webinarName"
          name="webinarName"
          value={webinarName || ""}
          onChange={handleChange}
          placeholder="Enter webinar name"
          className={cn(
            "!bg-background/50 border border-input",
            errors.webinarName && "border-red-400 focus-visible:ring-red-400"
          )}
        />
        {errors.webinarName && (
          <p className="text-sm text-red-400">{errors.webinarName}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="description"
          className={errors.description ? "text-red-400" : ""}
        >
          Description <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          value={description || ""}
          onChange={handleChange}
          placeholder="Enter webinar description"
          className={cn(
            "!bg-background/50 border border-input",
            errors.description && "border-red-400 focus-visible:ring-red-400"
          )}
          rows={3}
        >
          {errors.description && (
            <p className="text-sm text-red-400">{errors.description}</p>
          )}
        </Textarea>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className={errors.date ? "text-red-400" : ""}>
            Date <span className="text-red-400">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal !bg-background/50 border border-input",
                  !date && "text-gray-400",
                  errors.date && "border-red-400 focus-visible:ring-red-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? formatISTDateLabel(date) : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 !bg-background border border-input">
              <Calendar
                mode="single"
                selected={date ? istDateFromYMD(date as string) : undefined}
                onSelect={handleDateChange}
                initialFocus
                className="bg-background"
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Reset time
                  return date < today; // Disable past dates (client local)
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-sm text-red-400">{errors.date}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="time" className={errors.time ? "text-red-400" : ""}>
            Time <span className="text-red-400">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-foreground" />
              <Input
                id="time"
                name="time"
                value={time || ""}
                placeholder="12:00"
                onChange={handleChange}
                className={cn(
                  "pl-10 !bg-background/50 border border-input",
                  errors.time && "border-red-400 focus-visible:ring-red-400"
                )}
              />
              {errors.time && (
                <p className="text-sm text-red-400">{errors.time}</p>
              )}
            </div>
            <Select
              value={timeFormat || "AM"}
              onValueChange={handleTimeFormatChange}
            >
              <SelectTrigger className="w-20 !bg-background/50 border border-input">
                <SelectValue placeholder="AM" />
              </SelectTrigger>
              <SelectContent className="!bg-background border border-input">
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.timeFormat && (
            <p className="text-sm text-red-400">{errors.timeFormat}</p>
          )}
        </div>
      </div>

      {/* Video Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileVideo className="w-4 h-4" />
          <span>Upload a video to make this webinar pre-recorded</span>
          {isPreRecorded && (
            <span className="text-green-600 font-medium">
              (Pre-recorded mode)
            </span>
          )}
        </div>

        {/* Custom Video Upload Component */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Upload Video File</Label>

          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-6 transition-all",
              videoUploadStatus === "success"
                ? "border-green-500 bg-green-500/10"
                : videoUploadStatus === "error"
                ? "border-red-500 bg-red-500/10"
                : isVideoUploading
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-gray-300 hover:border-gray-400"
            )}
          >
            {/* File Input - Only show when not uploading */}
            {!isVideoUploading && (
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/avi,.mp4,.webm,.mov,.avi"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            )}

            {/* Upload Content */}
            <div className="text-center">
              {isVideoUploading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Uploading {videoFile?.name}...
                    </p>
                    <Progress
                      value={videoUploadProgress.percentage}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      {formatFileSize(videoUploadProgress.loaded)} /{" "}
                      {formatFileSize(videoUploadProgress.total)} (
                      {videoUploadProgress.percentage}%)
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await cancelVideoUpload();
                      }}
                      className="mt-2"
                    >
                      Cancel Upload
                    </Button>
                  </div>
                </div>
              ) : videoUploadStatus === "success" && uploadedVideoUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center text-green-600">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-700">
                      Upload successful!
                    </p>
                    <p className="text-xs text-gray-600">{videoFile?.name}</p>
                    <p className="text-xs text-gray-500">
                      {videoFile ? formatFileSize(videoFile.size) : ""}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => await clearVideoUpload()}
                    className="mt-2"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              ) : videoUploadStatus === "error" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center text-red-600">
                    <X className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-700">
                      Upload failed
                    </p>
                    <p className="text-xs text-gray-600">{videoFile?.name}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => await clearVideoUpload()}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center text-gray-400">
                    <Video className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Drag and drop your video here, or{" "}
                      <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer">
                        browse
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Max file size: 500MB • Supports: MP4, WebM, MOV, AVI
                    </p>
                    <p className="text-xs text-amber-600">
                      ⚠️ MKV files are not supported for web playback
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;

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
import { CalendarIcon, Clock, Upload, FileVideo } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import DirectUpload from "@/components/ReusableComponents/DirectUpload/DirectUpload";

const BasicInfoStep = () => {
  const { formData, updateBasicInfoField, getStepValidationErrors } =
    useWebinarStore();

  const errors = getStepValidationErrors("basicInfo");

  const {
    webinarName,
    description,
    date,
    time,
    timeFormat,
    videoFile,
    videoUrl,
    isPreRecorded,
  } = formData.basicInfo;

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

  const handleVideoUploadComplete = (url: string, key: string) => {
    updateBasicInfoField("videoUrl", url);
    updateBasicInfoField("videoKey", key);
    updateBasicInfoField("isPreRecorded", true);
    toast.success("Video uploaded successfully!");
  };

  const handleVideoUploadStart = () => {
    updateBasicInfoField("isPreRecorded", true);
  };

  const handleVideoUploadError = (error: string) => {
    updateBasicInfoField("videoUrl", "");
    updateBasicInfoField("videoKey", "");
    updateBasicInfoField("isPreRecorded", false);
    toast.error(`Video upload failed: ${error}`);
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

        <DirectUpload
          label="Upload Video File"
          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/avi"
          maxSize={500}
          fileType="video"
          onUploadComplete={handleVideoUploadComplete}
          onUploadStart={handleVideoUploadStart}
          onUploadError={handleVideoUploadError}
          currentFile={videoUrl}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;

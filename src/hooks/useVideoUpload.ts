import { useWebinarStore } from "@/store/useWebinarStore";
import { toast } from "sonner";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const useVideoUpload = () => {
  const { formData, updateBasicInfoField } = useWebinarStore();

  const uploadToCloudflare = async (
    file: File,
    presignedUrl: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // Store XMLHttpRequest in the global store instead of local ref
      updateBasicInfoField("uploadXhr", xhr);

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage,
          };
          updateBasicInfoField("videoUploadProgress", progress);
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
    });
  };

  const startVideoUpload = async (file: File) => {
    try {
      // Set initial upload state
      updateBasicInfoField("isVideoUploading", true);
      updateBasicInfoField("videoUploadStatus", "uploading");
      updateBasicInfoField("videoUploadProgress", {
        loaded: 0,
        total: file.size,
        percentage: 0,
      });
      updateBasicInfoField("videoFile", file);

      // Get presigned URL from server
      const response = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          uploadType: "video",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get presigned URL");
      }

      const { presignedUrl, key, publicUrl } = await response.json();

      // Upload directly to Cloudflare R2
      await uploadToCloudflare(file, presignedUrl);

      // Success - update state
      updateBasicInfoField("videoUploadStatus", "success");
      updateBasicInfoField("isVideoUploading", false);
      updateBasicInfoField("videoUrl", publicUrl);
      updateBasicInfoField("videoKey", key);
      updateBasicInfoField("isPreRecorded", true);

      toast.success("Video uploaded successfully!");

      return { success: true, url: publicUrl, key };
    } catch (error) {
      console.error("Upload error:", error);

      // Error - update state
      updateBasicInfoField("videoUploadStatus", "error");
      updateBasicInfoField("isVideoUploading", false);
      updateBasicInfoField("videoUrl", "");
      updateBasicInfoField("videoKey", "");
      updateBasicInfoField("isPreRecorded", false);

      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    } finally {
      updateBasicInfoField("uploadXhr", null);
    }
  };

  const deleteVideoFromCloudflare = async (videoKey: string) => {
    try {
      console.log(`Attempting to delete video from Cloudflare: ${videoKey}`);

      // Try DELETE method first
      let response = await fetch("/api/upload/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: videoKey,
        }),
      });

      // If DELETE fails with 405, try POST as fallback
      if (!response.ok && response.status === 405) {
        console.log("DELETE method not allowed, trying POST as fallback");
        response = await fetch("/api/upload/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: videoKey,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete video");
      }

      console.log(`Successfully deleted video from Cloudflare: ${videoKey}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting video from Cloudflare:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  };

  const cancelVideoUpload = async () => {
    const xhr = formData.basicInfo.uploadXhr;
    const videoKey = formData.basicInfo.videoKey;

    console.log("cancelVideoUpload called", {
      xhr,
      isUploading: formData.basicInfo.isVideoUploading,
      videoKey,
    });

    if (xhr) {
      xhr.abort();
    }

    // Clean up state
    updateBasicInfoField("isVideoUploading", false);
    updateBasicInfoField("videoUploadStatus", "idle");
    updateBasicInfoField("videoFile", null);
    updateBasicInfoField("uploadXhr", null);
    updateBasicInfoField("videoUploadProgress", {
      loaded: 0,
      total: 0,
      percentage: 0,
    });

    // Delete from Cloudflare if video was already uploaded
    if (videoKey) {
      toast.info("Cancelling upload and cleaning up...");
      const deleteResult = await deleteVideoFromCloudflare(videoKey);
      if (deleteResult.success) {
        updateBasicInfoField("videoUrl", "");
        updateBasicInfoField("videoKey", "");
        updateBasicInfoField("isPreRecorded", false);
        toast.success("Upload cancelled and cleaned up");
      } else {
        toast.error("Upload cancelled but cleanup failed");
      }
    } else {
      toast.info("Upload cancelled");
    }
  };

  const clearVideoUpload = async () => {
    const videoKey = formData.basicInfo.videoKey;

    // Delete from Cloudflare if video exists
    if (videoKey) {
      console.log("Clearing video upload and deleting from Cloudflare");
      const deleteResult = await deleteVideoFromCloudflare(videoKey);
      if (!deleteResult.success) {
        console.error(
          "Failed to delete video during clear:",
          deleteResult.error
        );
      }
    }

    updateBasicInfoField("videoFile", null);
    updateBasicInfoField("videoUploadStatus", "idle");
    updateBasicInfoField("videoUploadProgress", {
      loaded: 0,
      total: 0,
      percentage: 0,
    });
    updateBasicInfoField("videoUrl", "");
    updateBasicInfoField("videoKey", "");
    updateBasicInfoField("isPreRecorded", false);
  };

  return {
    // State
    isVideoUploading: formData.basicInfo.isVideoUploading || false,
    videoUploadProgress: formData.basicInfo.videoUploadProgress || {
      loaded: 0,
      total: 0,
      percentage: 0,
    },
    videoUploadStatus: formData.basicInfo.videoUploadStatus || "idle",
    videoFile: formData.basicInfo.videoFile,
    videoUrl: formData.basicInfo.videoUrl,
    videoKey: formData.basicInfo.videoKey,

    // Actions
    startVideoUpload,
    cancelVideoUpload,
    clearVideoUpload,
    deleteVideoFromCloudflare,
  };
};

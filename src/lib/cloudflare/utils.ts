import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_CONFIG, FileType } from "./r2-client";

/**
 * Generate a unique file name with timestamp and random string
 */
export const generateFileName = (
  originalName: string,
  type: FileType
): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop()?.toLowerCase() || "";
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");

  return `${type}s/${timestamp}_${randomString}_${cleanName}`;
};

/**
 * Validate file type and size
 */
export const validateFile = (
  file: File,
  type: FileType
): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > R2_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${
        R2_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
      }MB`,
    };
  }

  // Check file type
  const allowedTypes =
    type === "video"
      ? R2_CONFIG.ALLOWED_VIDEO_TYPES
      : type === "image"
      ? R2_CONFIG.ALLOWED_IMAGE_TYPES
      : ([
          ...R2_CONFIG.ALLOWED_VIDEO_TYPES,
          ...R2_CONFIG.ALLOWED_IMAGE_TYPES,
        ] as readonly string[]);

  if (!allowedTypes.includes(file.type as any)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
};

/**
 * Generate presigned URL for direct client upload to Cloudflare R2
 */
export const generatePresignedUploadUrl = async (
  fileName: string,
  fileType: string,
  type: FileType
): Promise<{
  success: boolean;
  presignedUrl?: string;
  key?: string;
  publicUrl?: string;
  error?: string;
}> => {
  try {
    // Generate unique file name
    const key = generateFileName(fileName, type);

    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // Add metadata for better tracking
      Metadata: {
        "original-name": fileName,
        "upload-type": type,
        "uploaded-at": new Date().toISOString(),
      },
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Generate public URL (remove query parameters for clean URL)
    const publicUrl = `${R2_CONFIG.BASE_URL}/${key}`;

    console.log("Generated presigned URL:", {
      key,
      presignedUrl: presignedUrl.substring(0, 100) + "...",
      publicUrl,
    });

    return {
      success: true,
      presignedUrl,
      key,
      publicUrl,
    };
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate presigned URL",
    };
  }
};

/**
 * Upload file to Cloudflare R2
 */
export const uploadToR2 = async (
  file: File,
  type: FileType
): Promise<{
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}> => {
  try {
    // Validate file
    const validation = validateFile(file, type);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique file name
    const key = generateFileName(file.name, type);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
    });

    await r2Client.send(command);

    // Generate public URL
    const publicUrl = `${R2_CONFIG.BASE_URL}/${key}`;

    return {
      success: true,
      url: publicUrl,
      key: key,
    };
  } catch (error) {
    console.error("R2 Upload Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};

/**
 * Delete file from Cloudflare R2
 */
export const deleteFromR2 = async (
  key: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return { success: true };
  } catch (error) {
    console.error("R2 Delete Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
};

/**
 * Generate signed URL for private access (if needed)
 */
export const generateSignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const command = new GetObjectCommand({
      Bucket: R2_CONFIG.BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });

    return {
      success: true,
      url: signedUrl,
    };
  } catch (error) {
    console.error("Signed URL Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate signed URL",
    };
  }
};

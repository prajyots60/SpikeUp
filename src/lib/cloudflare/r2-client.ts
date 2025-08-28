import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 client configuration
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for R2
});

// Configuration constants
export const R2_CONFIG = {
  BUCKET_NAME: process.env.CLOUDFLARE_BUCKET_NAME!,
  ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID!,
  BASE_URL: process.env.CLOUDFLARE_API_URL!,
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  ALLOWED_VIDEO_TYPES: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/avi",
    "video/x-matroska",
    "video/mpeg",
  ],
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
} as const;

export type FileType = "video" | "image" | "document";

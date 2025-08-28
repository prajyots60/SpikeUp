import { NextRequest, NextResponse } from "next/server";

import { OnAuthenticateUser } from "@/actions/auth";
import { FileType } from "@/lib/cloudflare";
import { generatePresignedUploadUrl } from "@/lib/cloudflare/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await OnAuthenticateUser();
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileType, uploadType } = body;

    if (!fileName || !fileType || !uploadType) {
      return NextResponse.json(
        { error: "Missing required fields: fileName, fileType, uploadType" },
        { status: 400 }
      );
    }

    const validUploadTypes: FileType[] = ["video", "image", "document"];
    if (!validUploadTypes.includes(uploadType)) {
      return NextResponse.json(
        {
          error: "Invalid upload type. Must be 'video', 'image', or 'document'",
        },
        { status: 400 }
      );
    }

    // Validate file type (skip size validation for presigned URLs)
    const allowedTypes =
      uploadType === "video"
        ? [
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-msvideo",
            "video/avi",
          ]
        : uploadType === "image"
        ? ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
        : ["application/pdf", "application/msword"];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        {
          error: `Invalid file type for ${uploadType}. Allowed types: ${allowedTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    const result = await generatePresignedUploadUrl(
      fileName,
      fileType,
      uploadType
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate presigned URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      presignedUrl: result.presignedUrl,
      key: result.key,
      publicUrl: result.publicUrl,
    });
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

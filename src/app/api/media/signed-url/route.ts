import { NextRequest, NextResponse } from "next/server";
import { generateSignedUrl } from "@/lib/cloudflare/utils";

export async function POST(request: NextRequest) {
  try {
    const { key, expiresIn = 3600 } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    const result = await generateSignedUrl(key, expiresIn);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate signed URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
    });
  } catch (error) {
    console.error("Signed URL API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

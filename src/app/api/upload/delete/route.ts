import { NextRequest, NextResponse } from "next/server";
import { OnAuthenticateUser } from "@/actions/auth";
import { deleteFromR2 } from "@/lib/cloudflare/utils";

async function handleDelete(request: NextRequest) {
  try {
    const user = await OnAuthenticateUser();
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Missing required field: key" },
        { status: 400 }
      );
    }

    console.log(`Deleting file from R2: ${key}`);

    const result = await deleteFromR2(key);

    if (!result.success) {
      console.error(`Failed to delete file from R2: ${result.error}`);
      return NextResponse.json(
        { error: result.error || "Failed to delete file" },
        { status: 500 }
      );
    }

    console.log(`Successfully deleted file from R2: ${key}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Support both DELETE and POST methods
export const DELETE = handleDelete;
export const POST = handleDelete;

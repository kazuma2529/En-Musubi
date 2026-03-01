import { NextResponse } from "next/server";
import { adminDb } from "@/lib/adminDb";

const DEV_EMAIL = process.env.DEV_AUTH_EMAIL ?? "dev@musubi.local";

export async function POST() {
  if (process.env.NEXT_PUBLIC_MOCK_AUTH !== "true") {
    return NextResponse.json(
      { error: "Dev sign-in is only available when NEXT_PUBLIC_MOCK_AUTH=true" },
      { status: 403 }
    );
  }

  try {
    const token = await adminDb.auth.createToken({ email: DEV_EMAIL });
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Dev sign-in error:", error);
    return NextResponse.json(
      { error: "Failed to create dev token" },
      { status: 500 }
    );
  }
}

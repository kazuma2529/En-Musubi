import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/adminDb";
import { sendWeeklySummaryEmail } from "@/lib/resend";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "userId and userEmail are required" },
        { status: 400 }
      );
    }

    const { people } = await adminDb.query({
      people: {
        $: { where: { "owner.id": userId } },
      },
    });

    const noContactCount = people.filter(
      (p: { lastContactDate: number }) =>
        Date.now() - (p.lastContactDate ?? 0) >= NINETY_DAYS_MS
    ).length;

    await sendWeeklySummaryEmail(
      userEmail,
      noContactCount,
      process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    );

    return NextResponse.json({ success: true, count: noContactCount });
  } catch (error) {
    console.error("Weekly summary error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send" },
      { status: 500 }
    );
  }
}

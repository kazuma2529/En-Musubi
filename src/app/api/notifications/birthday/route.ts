import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/adminDb";
import { sendBirthdayReminderEmail } from "@/lib/resend";

function daysUntilBirthday(
  birthdayStr: string | null | undefined,
  withinDays: number
): number | null {
  if (!birthdayStr) return null;
  const [y, m, d] = birthdayStr.replace("--", "2000-").split("-").map(Number);
  const today = new Date();
  const thisYear = today.getFullYear();
  let next = new Date(thisYear, m - 1, d);
  if (next < today) next = new Date(thisYear + 1, m - 1, d);
  const diff = Math.ceil((next.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  return diff >= 0 && diff <= withinDays ? diff : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, daysAhead = 7 } = body;

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
    let sent = 0;

    for (const p of people) {
      const days = daysUntilBirthday(p.birthday, daysAhead);
      if (days !== null) {
        await sendBirthdayReminderEmail(
          userEmail,
          p.name,
          days,
          appUrl,
          p.id
        );
        sent++;
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("Birthday reminder error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send" },
      { status: 500 }
    );
  }
}

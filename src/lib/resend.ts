import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "縁結び <onboarding@resend.dev>";

export async function sendWeeklySummaryEmail(
  toEmail: string,
  count: number,
  appUrl: string
) {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: `【縁結び】3ヶ月以上連絡していない人が${count}人います`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #ff9a8b; font-size: 24px;">縁結び</h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          3ヶ月以上連絡していない人が<strong>${count}人</strong>います。
        </p>
        <p style="color: #8a8a8a; font-size: 14px;">
          大切な人との縁を繋ぎましょう。
        </p>
        <a href="${appUrl}/alerts" style="
          display: inline-block;
          margin-top: 16px;
          padding: 12px 24px;
          background: #ff9a8b;
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
        ">アラートを見る</a>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function sendBirthdayReminderEmail(
  toEmail: string,
  personName: string,
  daysUntil: number,
  appUrl: string,
  personId: string
) {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: `【縁結び】${personName}さんの誕生日まであと${daysUntil}日です`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #ff9a8b; font-size: 24px;">縁結び</h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          <strong>${personName}</strong>さんの誕生日まであと<strong>${daysUntil}日</strong>です。
        </p>
        <p style="color: #8a8a8a; font-size: 14px;">
          お祝いのメッセージを送ってみてはいかがでしょうか。
        </p>
        <a href="${appUrl}/person/${personId}" style="
          display: inline-block;
          margin-top: 16px;
          padding: 12px 24px;
          background: #ff9a8b;
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
        ">詳細を見る</a>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
  return data;
}

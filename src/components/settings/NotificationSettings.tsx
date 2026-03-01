"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { WEEKDAYS, BIRTHDAY_OPTIONS } from "@/lib/constants/notification";

type SettingsEntity = {
  id: string;
  weeklyReminderEnabled: boolean;
  weeklyReminderDay: number;
  weeklyReminderTime: string;
  birthdayReminderEnabled: boolean;
  birthdayReminderDays: number;
};

interface NotificationSettingsProps {
  settings: SettingsEntity | null | undefined;
  userEmail: string | null | undefined;
  userId: string;
}

export function NotificationSettings({
  settings,
  userEmail,
  userId,
}: NotificationSettingsProps) {
  const [sendingWeekly, setSendingWeekly] = useState(false);
  const [sendingBirthday, setSendingBirthday] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  if (!settings) return null;

  return (
    <>
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-primary)]">週次サマリー通知</span>
          <input
            type="checkbox"
            checked={settings.weeklyReminderEnabled}
            onChange={(e) =>
              db.transact(
                db.tx.settings[settings.id].update({
                  weeklyReminderEnabled: e.target.checked,
                })
              )
            }
            className="w-5 h-5 rounded accent-[var(--primary)]"
          />
        </div>
        {settings.weeklyReminderEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <select
              value={settings.weeklyReminderDay}
              onChange={(e) =>
                db.transact(
                  db.tx.settings[settings.id].update({
                    weeklyReminderDay: Number(e.target.value),
                  })
                )
              }
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--text-primary)]"
            >
              {WEEKDAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <Input
              type="time"
              value={settings.weeklyReminderTime}
              onChange={(e) =>
                db.transact(
                  db.tx.settings[settings.id].update({
                    weeklyReminderTime: e.target.value,
                  })
                )
              }
            />
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <span className="text-[var(--text-primary)]">誕生日通知</span>
          <input
            type="checkbox"
            checked={settings.birthdayReminderEnabled}
            onChange={(e) =>
              db.transact(
                db.tx.settings[settings.id].update({
                  birthdayReminderEnabled: e.target.checked,
                })
              )
            }
            className="w-5 h-5 rounded accent-[var(--primary)]"
          />
        </div>
        {settings.birthdayReminderEnabled && (
          <select
            value={settings.birthdayReminderDays}
            onChange={(e) =>
              db.transact(
                db.tx.settings[settings.id].update({
                  birthdayReminderDays: Number(e.target.value),
                })
              )
            }
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--text-primary)]"
          >
            {BIRTHDAY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </Card>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        通知はメールで送信されます。Resend APIを使用します。
      </p>
      {userEmail && (
        <div className="mt-4 space-y-2">
          <Button
            variant="secondary"
            onClick={async () => {
              setSendingWeekly(true);
              setNotificationMessage("");
              try {
                const res = await fetch("/api/notifications/weekly-summary", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId,
                    userEmail,
                  }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setNotificationMessage(
                  `週次サマリーを送信しました（${data.count}人）`
                );
              } catch (e) {
                setNotificationMessage(
                  `送信失敗: ${e instanceof Error ? e.message : "Unknown"}`
                );
              } finally {
                setSendingWeekly(false);
              }
            }}
            disabled={sendingWeekly}
          >
            {sendingWeekly ? "送信中..." : "週次サマリーを今すぐ送信"}
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              setSendingBirthday(true);
              setNotificationMessage("");
              try {
                const res = await fetch("/api/notifications/birthday", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId,
                    userEmail,
                    daysAhead: settings?.birthdayReminderDays ?? 7,
                  }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setNotificationMessage(
                  `誕生日通知を${data.sent}件送信しました`
                );
              } catch (e) {
                setNotificationMessage(
                  `送信失敗: ${e instanceof Error ? e.message : "Unknown"}`
                );
              } finally {
                setSendingBirthday(false);
              }
            }}
            disabled={sendingBirthday}
          >
            {sendingBirthday ? "送信中..." : "誕生日通知を今すぐ送信"}
          </Button>
          {notificationMessage && (
            <p
              className={`text-sm ${notificationMessage.startsWith("送信失敗") ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
            >
              {notificationMessage}
            </p>
          )}
        </div>
      )}
    </>
  );
}

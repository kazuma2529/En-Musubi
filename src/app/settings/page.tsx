"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/layout/PageLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import type { Category } from "@/lib/types";

const WEEKDAYS = [
  { value: 0, label: "日曜日" },
  { value: 1, label: "月曜日" },
  { value: 2, label: "火曜日" },
  { value: 3, label: "水曜日" },
  { value: 4, label: "木曜日" },
  { value: 5, label: "金曜日" },
  { value: 6, label: "土曜日" },
];

const BIRTHDAY_OPTIONS = [
  { value: 3, label: "3日前" },
  { value: 7, label: "7日前" },
  { value: 14, label: "14日前" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { isLoading, user, signOut } = useAuth();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [sendingWeekly, setSendingWeekly] = useState(false);
  const [sendingBirthday, setSendingBirthday] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    if (
      !isLoading &&
      !user &&
      process.env.NEXT_PUBLIC_MOCK_AUTH !== "true"
    ) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  const { data } = db.useQuery(
    user
      ? {
          categories: {
            $: { where: { "owner.id": user.id } },
          },
          settings: {
            $: { where: { "owner.id": user.id } },
          },
        }
      : {
          categories: { $: { where: { "owner.id": "00000000-0000-0000-0000-000000000000" } } },
          settings: { $: { where: { "owner.id": "00000000-0000-0000-0000-000000000000" } } },
        }
  );

  // カテゴリの重複を除去
  const uniqueCategories = Array.from(
    new Map((data?.categories ?? []).map((cat: Category) => [cat.id, cat])).values()
  ) as Category[];
  const categories = uniqueCategories;
  const settings = data?.settings?.[0];

  const addCategory = () => {
    if (!user || !newCategoryName.trim()) return;
    const maxOrder = Math.max(0, ...categories.map((c) => c.order ?? 0));
    const catId = id();
    db.transact([
      db.tx.categories[catId]
        .update({
          name: newCategoryName.trim(),
          order: maxOrder + 1,
          isDefault: false,
        })
        .link({ owner: user.id }),
    ]);
    setNewCategoryName("");
  };

  const updateCategory = (catId: string, name: string) => {
    if (!name.trim()) return;
    db.transact(db.tx.categories[catId].update({ name: name.trim() }));
    setEditingId(null);
    setEditingName("");
  };

  const deleteCategory = (cat: Category) => {
    if (!cat.isDefault && confirm(`「${cat.name}」を削除しますか？`)) {
      db.transact(db.tx.categories[cat.id].delete());
    }
  };

  useEffect(() => {
    if (!user || settings) return;
    const settingsId = id();
    db.transact([
      db.tx.settings[settingsId]
        .update({
          weeklyReminderEnabled: true,
          weeklyReminderDay: 1,
          weeklyReminderTime: "09:00",
          birthdayReminderEnabled: true,
          birthdayReminderDays: 7,
        })
        .link({ owner: user.id }),
    ]);
  }, [user?.id, settings]);

  if (isLoading) {
    return (
      <PageLayout showBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-[var(--text-secondary)]">
            読み込み中...
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout showBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <p className="text-[var(--text-secondary)]">ログインが必要です</p>
        </div>
      </PageLayout>
    );
  }

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <PageLayout>
      <Header title="設定" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            通知設定
          </h2>
          <Card className="space-y-4">
            {settings && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-primary)]">
                    週次サマリー通知
                  </span>
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
                  <span className="text-[var(--text-primary)]">
                    誕生日通知
                  </span>
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
              </>
            )}
          </Card>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            通知はメールで送信されます。Resend APIを使用します。
          </p>
          {user?.email && (
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
                        userId: user.id,
                        userEmail: user.email,
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
                        userId: user.id,
                        userEmail: user.email,
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
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            カテゴリ管理
          </h2>
          <Card className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="新しいカテゴリ"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addCategory}
                disabled={!newCategoryName.trim()}
              >
                追加
              </Button>
            </div>
            <ul className="space-y-2">
              {sortedCategories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-[var(--border)] last:border-0"
                >
                  {editingId === cat.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          updateCategory(cat.id, editingName)
                        }
                      >
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                      >
                        取消
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-[var(--text-primary)]">
                        {cat.name}
                        {cat.isDefault && (
                          <span className="ml-2 text-xs text-[var(--text-secondary)]">
                            (既定)
                          </span>
                        )}
                      </span>
                      {!cat.isDefault && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditingName(cat.name);
                            }}
                            className="text-sm text-[var(--primary)]"
                          >
                            編集
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCategory(cat)}
                            className="text-sm text-[var(--danger)]"
                          >
                            削除
                          </button>
                        </>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section>
          <Link href="/login">
            <Button variant="ghost" fullWidth onClick={() => signOut()}>
              ログアウト
            </Button>
          </Link>
        </section>
      </main>
    </PageLayout>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOwnerId } from "@/hooks/useOwnerId";
import { PageLayout } from "@/components/layout/PageLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { UnauthorizedMessage } from "@/components/layout/UnauthorizedMessage";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { CategoryManagement } from "@/components/settings/CategoryManagement";
import type { Category } from "@/lib/types";
import {
  uniqueCategoriesForSettings,
  sortCategoriesByOrder,
} from "@/lib/categories";

export default function SettingsPage() {
  const { isLoading, user, signOut } = useRequireAuth();
  const ownerId = useOwnerId();

  const { data } = db.useQuery({
    categories: {
      $: { where: { "owner.id": ownerId } },
    },
    settings: {
      $: { where: { "owner.id": ownerId } },
    },
  });

  const categories = uniqueCategoriesForSettings(
    (data?.categories ?? []) as Category[]
  );
  const sortedCategories = sortCategoriesByOrder(categories);
  const settings = data?.settings?.[0];

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

  if (isLoading) return <LoadingScreen />;
  if (!user) return <UnauthorizedMessage />;

  return (
    <PageLayout>
      <Header title="設定" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            通知設定
          </h2>
          <NotificationSettings
            settings={settings}
            userEmail={user?.email}
            userId={user.id}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            カテゴリ管理
          </h2>
          <CategoryManagement
            categories={sortedCategories}
            userId={user.id}
          />
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

"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/layout/PageLayout";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { ContactButton } from "@/components/person/ContactButton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  isOver90DaysAgo,
  daysSinceContact,
  daysUntilBirthday,
  formatBirthday,
} from "@/lib/dateUtils";
import type { PersonWithCategories } from "@/lib/types";

export default function AlertsPage() {
  const router = useRouter();
  const { isLoading, user } = useAuth();

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
          people: {
            $: { where: { "owner.id": user.id } },
            categories: {},
          },
        }
      : {
          people: {
            $: { where: { "owner.id": "00000000-0000-0000-0000-000000000000" } },
            categories: {},
          },
        }
  );

  const people = (data?.people ?? []) as PersonWithCategories[];

  const noContactList = useMemo(
    () =>
      people.filter((p) => isOver90DaysAgo(p.lastContactDate)),
    [people]
  );

  const birthdayList = useMemo(
    () =>
      people.filter((p) => daysUntilBirthday(p.birthday, 7) !== null),
    [people]
  );

  const alertCount = noContactList.length + birthdayList.length;

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
          <p className="text-[var(--text-secondary)]">
            ログインが必要です
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout alertCount={alertCount}>
      <Header title="アラート" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            3ヶ月以上連絡していない人
          </h2>
          {noContactList.length === 0 ? (
            <EmptyState
              icon="✨"
              title="みんなと連絡取れています！"
              description="3ヶ月以上連絡していない人はいません"
            />
          ) : (
            <div className="space-y-3">
              {noContactList.map((person) => {
                const days = daysSinceContact(person.lastContactDate);
                return (
                  <Card key={person.id} padding="md">
                    <div className="flex items-center justify-between gap-4">
                      <Link
                        href={`/person/${person.id}`}
                        className="flex-1 min-w-0"
                      >
                        <h3 className="font-medium text-[var(--text-primary)] truncate">
                          {person.name}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {days}日間連絡なし
                        </p>
                      </Link>
                      <div onClick={(e) => e.stopPropagation()}>
                        <ContactButton person={person} size="sm" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            近日中に誕生日の人
          </h2>
          {birthdayList.length === 0 ? (
            <EmptyState
              icon="🎂"
              title="近日中の誕生日はありません"
              description="7日以内に誕生日が来る人はいません"
            />
          ) : (
            <div className="space-y-3">
              {birthdayList
                .map((person) => ({
                  person,
                  days: daysUntilBirthday(person.birthday, 7)!,
                }))
                .sort((a, b) => a.days - b.days)
                .map(({ person, days }) => (
                  <Card key={person.id} padding="md">
                    <div className="flex items-center justify-between gap-4">
                      <Link
                        href={`/person/${person.id}`}
                        className="flex-1 min-w-0"
                      >
                        <h3 className="font-medium text-[var(--text-primary)] truncate">
                          {person.name}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {formatBirthday(person.birthday)} あと{days}日
                        </p>
                      </Link>
                      <div onClick={(e) => e.stopPropagation()}>
                        <ContactButton person={person} size="sm" />
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </section>
      </main>
    </PageLayout>
  );
}

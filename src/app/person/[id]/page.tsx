"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOwnerId } from "@/hooks/useOwnerId";
import { PageLayout } from "@/components/layout/PageLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ContactButton } from "@/components/person/ContactButton";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import {
  formatLastContact,
  formatBirthday,
  daysUntilBirthday,
} from "@/lib/dateUtils";
import { dedupeCategoriesById } from "@/lib/categories";
import type { PersonWithCategories, Category } from "@/lib/types";

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;
  const { isLoading, user } = useRequireAuth();
  const ownerId = useOwnerId();

  const { data } = db.useQuery({
    people: {
      $: { where: { id: personId, "owner.id": ownerId } },
      categories: {},
    },
  });

  const person = (data?.people?.[0] ?? null) as PersonWithCategories | null;
  const categories = person
    ? dedupeCategoriesById((person.categories ?? []) as Category[])
    : [];

  const handleDelete = () => {
    if (!person || !confirm("この人を削除しますか？")) return;
    db.transact(db.tx.people[person.id].delete());
    router.push("/home");
  };

  if (isLoading) return <LoadingScreen />;
  if (!user) return null;

  if (!person) {
    return (
      <PageLayout>
        <Header title="人物" showBack backHref="/home" />
        <main className="max-w-lg mx-auto px-4 py-8">
          <p className="text-[var(--text-secondary)]">見つかりませんでした</p>
          <Link href="/home" className="text-[var(--primary)] mt-4 inline-block">
            ホームに戻る
          </Link>
        </main>
      </PageLayout>
    );
  }

  const birthdayDays = daysUntilBirthday(person.birthday, 14);

  return (
    <PageLayout>
      <Header
        title={person.name}
        showBack
        backHref="/home"
        right={
          <div className="flex items-center gap-2">
            <Link
              href={`/person/${person.id}/edit`}
              className="px-3 py-1.5 text-sm text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-lg"
            >
              編集
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg"
            >
              削除
            </button>
          </div>
        }
      />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge key={cat.id} variant="primary">
                  {cat.name}
                </Badge>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              {person.birthday && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">誕生日</span>
                  <span>
                    {formatBirthday(person.birthday)}
                    {birthdayDays !== null && (
                      <span className="ml-2 text-[var(--primary)]">
                        （あと{birthdayDays}日）
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">最終連絡</span>
                <span>
                  {person.lastContactDate
                    ? formatLastContact(person.lastContactDate)
                    : "-"}
                </span>
              </div>
              {person.memo && (
                <div>
                  <span className="text-[var(--text-secondary)]">メモ</span>
                  <p className="mt-1 text-[var(--text-primary)] whitespace-pre-wrap">
                    {person.memo}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <ContactButton person={person} size="lg" fullWidth />
          <Link href={`/person/${person.id}/edit`} className="block">
            <Button variant="secondary" fullWidth>
              情報を編集
            </Button>
          </Link>
        </div>
      </main>
    </PageLayout>
  );
}

"use client";

import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/PageLayout";
import { Header } from "@/components/layout/Header";
import { PersonForm } from "@/components/person/PersonForm";
import type { Category } from "@/lib/types";

export default function NewPersonPage() {
  const { isLoading, user } = useAuth();

  const { data } = db.useQuery(
    user
      ? {
          categories: {
            $: { where: { "owner.id": user.id } },
          },
        }
      : { categories: { $: { where: { "owner.id": "00000000-0000-0000-0000-000000000000" } } } }
  );

  // 重複を除去
  const uniqueCategories = Array.from(
    new Map((data?.categories ?? []).map((cat: Category) => [cat.id, cat])).values()
  ) as Category[];
  const categories = uniqueCategories;

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
      <PageLayout>
        <Header title="新規登録" showBack backHref="/home" />
        <main className="max-w-lg mx-auto px-4 py-8">
          <p className="text-[var(--text-secondary)]">ログインが必要です</p>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Header title="新規登録" showBack backHref="/home" />
      <main className="max-w-lg mx-auto px-4 py-6">
        <PersonForm categories={categories} userId={user.id} />
      </main>
    </PageLayout>
  );
}

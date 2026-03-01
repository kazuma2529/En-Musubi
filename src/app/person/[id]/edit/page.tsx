"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/PageLayout";
import { Header } from "@/components/layout/Header";
import { PersonForm } from "@/components/person/PersonForm";
import type { PersonWithCategories } from "@/lib/types";
import type { Category } from "@/lib/types";

export default function EditPersonPage() {
  const params = useParams();
  const personId = params.id as string;
  const { isLoading, user } = useAuth();

  const ownerId = user?.id ?? "00000000-0000-0000-0000-000000000000";
  const { data } = db.useQuery({
    people: {
      $: { where: { id: personId, "owner.id": ownerId } },
      categories: {},
    },
    categories: {
      $: { where: { "owner.id": ownerId } },
    },
  });

  const person = (data?.people?.[0] ?? null) as PersonWithCategories | null;
  const categories = (data?.categories ?? []) as Category[];

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
        <Header title="編集" showBack backHref="/home" />
        <main className="max-w-lg mx-auto px-4 py-8">
          <p className="text-[var(--text-secondary)]">ログインが必要です</p>
        </main>
      </PageLayout>
    );
  }

  if (!person) {
    return (
      <PageLayout>
        <Header title="編集" showBack backHref="/home" />
        <main className="max-w-lg mx-auto px-4 py-8">
          <p className="text-[var(--text-secondary)]">見つかりませんでした</p>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Header
        title={`${person.name} を編集`}
        showBack
        backHref={`/person/${person.id}`}
      />
      <main className="max-w-lg mx-auto px-4 py-6">
        <PersonForm
          person={person}
          categories={categories}
          userId={user.id}
        />
      </main>
    </PageLayout>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOwnerId } from "@/hooks/useOwnerId";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/PageLayout";
import { Header } from "@/components/layout/Header";
import { PersonForm } from "@/components/person/PersonForm";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { UnauthorizedMessage } from "@/components/layout/UnauthorizedMessage";
import { dedupeCategoriesById } from "@/lib/categories";
import type { PersonWithCategories } from "@/lib/types";
import type { Category } from "@/lib/types";

export default function EditPersonPage() {
  const params = useParams();
  const personId = params.id as string;
  const { isLoading, user } = useRequireAuth();
  const ownerId = useOwnerId();

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
  const categories = dedupeCategoriesById(
    (data?.categories ?? []) as { id: string }[]
  ) as Category[];

  if (isLoading) return <LoadingScreen />;
  if (!user) return <UnauthorizedMessage />;

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

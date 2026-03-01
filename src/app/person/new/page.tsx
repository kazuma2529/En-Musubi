"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOwnerId } from "@/hooks/useOwnerId";
import { db } from "@/lib/db";
import { PageLayout } from "@/components/layout/PageLayout";
import { Header } from "@/components/layout/Header";
import { PersonForm } from "@/components/person/PersonForm";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { UnauthorizedMessage } from "@/components/layout/UnauthorizedMessage";
import { dedupeCategoriesById } from "@/lib/categories";
import type { Category } from "@/lib/types";

export default function NewPersonPage() {
  const { isLoading, user } = useRequireAuth();
  const ownerId = useOwnerId();

  const { data } = db.useQuery({
    categories: {
      $: { where: { "owner.id": ownerId } },
    },
  });

  const categories = dedupeCategoriesById(
    (data?.categories ?? []) as { id: string }[]
  ) as Category[];

  if (isLoading) return <LoadingScreen />;
  if (!user) return <UnauthorizedMessage />;

  return (
    <PageLayout>
      <Header title="新規登録" showBack backHref="/home" />
      <main className="max-w-lg mx-auto px-4 py-6">
        <PersonForm categories={categories} userId={user.id} />
      </main>
    </PageLayout>
  );
}

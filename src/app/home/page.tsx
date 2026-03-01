"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { useDefaultCategories } from "@/hooks/useDefaultCategories";
import { PageLayout } from "@/components/layout/PageLayout";
import { Header } from "@/components/layout/Header";
import { PersonCard } from "@/components/person/PersonCard";
import { SortMenu, type SortOption } from "@/components/person/SortMenu";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatLastContact, isOver90DaysAgo, daysUntilBirthday } from "@/lib/dateUtils";
import type { PersonWithCategories } from "@/lib/types";

export default function HomePage() {
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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("lastContact_asc");

  const query = {
    people: {
      $: {
        where: user ? { "owner.id": user.id } : { "owner.id": "00000000-0000-0000-0000-000000000000" },
      },
      categories: {},
    },
    categories: {
      $: {
        where: user ? { "owner.id": user.id } : { "owner.id": "00000000-0000-0000-0000-000000000000" },
      },
    },
  };

  const { data, error } = db.useQuery(query);

  const people = (data?.people ?? []) as PersonWithCategories[];
  
  // カテゴリの重複を除去
  const uniqueCategories = Array.from(
    new Map((data?.categories ?? []).map((cat: any) => [cat.id, cat])).values()
  );
  const categories = uniqueCategories;

  useDefaultCategories(user?.id, categories);

  const filteredAndSorted = useMemo(() => {
    let list = people;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.memo && p.memo.toLowerCase().includes(q))
      );
    }

    if (categoryFilter.length > 0) {
      list = list.filter((p) =>
        (p.categories ?? []).some((c) => categoryFilter.includes(c.id))
      );
    }

    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "lastContact_asc":
          return (a.lastContactDate ?? 0) - (b.lastContactDate ?? 0);
        case "lastContact_desc":
          return (b.lastContactDate ?? 0) - (a.lastContactDate ?? 0);
        case "name_asc":
          return (a.name ?? "").localeCompare(b.name ?? "");
        case "birthday_asc": {
          const da = daysUntilBirthday(a.birthday, 365) ?? 9999;
          const db_ = daysUntilBirthday(b.birthday, 365) ?? 9999;
          return da - db_;
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [people, search, categoryFilter, sort]);

  const alertCount = useMemo(() => {
    let count = 0;
    for (const p of people) {
      if (isOver90DaysAgo(p.lastContactDate)) count++;
      if (daysUntilBirthday(p.birthday, 7) !== null) count++;
    }
    return count;
  }, [people]);

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

  const sortedCategories = [...categories].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <PageLayout alertCount={alertCount}>
      <Header
        title="縁結び"
        right={
          <Link
            href="/person/new"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary)] text-white text-xl hover:bg-[var(--primary-hover)] transition-colors"
            aria-label="新規追加"
          >
            +
          </Link>
        }
      />

      <main className="max-w-lg mx-auto px-4 pb-6">
        <div className="space-y-4 py-4">
          <Input
            placeholder="名前・メモで検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            {sortedCategories.map((cat) => {
              const active = categoryFilter.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setCategoryFilter((prev) =>
                      active ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                    )
                  }
                  className={`
                    px-3 py-1.5 rounded-full text-sm
                    ${active ? "bg-[var(--primary)] text-white" : "bg-[var(--primary-light)] text-[var(--text-secondary)]"}
                  `}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <SortMenu value={sort} onChange={setSort} />
          </div>
        </div>

        {error && (
          <p className="text-[var(--danger)] text-sm py-4">{error.message}</p>
        )}

        {filteredAndSorted.length === 0 ? (
          <EmptyState
            icon="👋"
            title={people.length === 0 ? "大切な人を登録しましょう" : "該当する人はいません"}
            description={
              people.length === 0
                ? "右上の + ボタンから追加できます"
                : "検索条件を変えてみてください"
            }
            action={
              people.length === 0 ? (
                <Link href="/person/new">
                  <span className="inline-flex px-6 py-2 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)]">
                    最初の人を追加
                  </span>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredAndSorted.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </main>
    </PageLayout>
  );
}

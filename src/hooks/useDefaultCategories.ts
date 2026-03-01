"use client";

import { useEffect } from "react";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";

const DEFAULT_CATEGORIES = [
  { name: "友人・旧友", order: 0 },
  { name: "仕事・元同僚", order: 1 },
  { name: "家族・親戚", order: 2 },
  { name: "オンライン", order: 3 },
];

// グローバルな初期化フラグ（ユーザーごと）
const initializedUsers = new Set<string>();

const DEFAULT_NAMES = new Set(DEFAULT_CATEGORIES.map((d) => d.name));

export function useDefaultCategories(
  userId: string | undefined,
  categories: { id: string; name?: string }[]
) {
  useEffect(() => {
    if (!userId || initializedUsers.has(userId)) return;
    // 既に同名の既定カテゴリが1件でもあれば作成しない（二重作成防止）
    const hasDefaultByName = categories.some(
      (c) => c.name && DEFAULT_NAMES.has(c.name)
    );
    if (hasDefaultByName || categories.length > 0) return;

    // このユーザーは初期化済みとマーク（transact 前にマークして競合を防ぐ）
    initializedUsers.add(userId);

    const txs = DEFAULT_CATEGORIES.map((def) => {
      const catId = id();
      return db.tx.categories[catId]
        .update({
          name: def.name,
          order: def.order,
          isDefault: true,
        })
        .link({ owner: userId });
    });

    db.transact(txs);
  }, [userId, categories.length]);
}

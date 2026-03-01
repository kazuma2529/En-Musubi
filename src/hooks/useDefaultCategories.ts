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

export function useDefaultCategories(
  userId: string | undefined,
  categories: { id: string }[]
) {
  useEffect(() => {
    if (!userId || categories.length > 0 || initializedUsers.has(userId)) return;

    // このユーザーは初期化済みとマーク
    initializedUsers.add(userId);

    const txs = DEFAULT_CATEGORIES.map((def, i) => {
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

import type { Category } from "@/lib/types";

/** id で重複を除去（先に出た id を優先）。戻り値の要素型は入力と同じ。 */
export function dedupeCategoriesById<T extends { id: string }>(
  categories: T[]
): T[] {
  return Array.from(
    new Map(categories.map((cat) => [cat.id, cat])).values()
  ) as T[];
}

/** 名前で重複を除去（同じ名前は先頭1件だけ残す） */
export function dedupeCategoriesByName<T extends { id: string; name: string }>(
  categories: T[]
): T[] {
  const byName = new Map<string, T>();
  for (const cat of categories) {
    if (!byName.has(cat.name)) byName.set(cat.name, cat);
  }
  return Array.from(byName.values());
}

/** order で昇順ソート */
export function sortCategoriesByOrder<T extends { order?: number }>(
  categories: T[]
): T[] {
  return [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** 設定画面用: id で一意化したあと名前で1件にまとめる */
export function uniqueCategoriesForSettings(
  categories: Category[]
): Category[] {
  const byId = new Map<string, Category>();
  for (const cat of categories) {
    byId.set(cat.id, cat);
  }
  return dedupeCategoriesByName(Array.from(byId.values()));
}

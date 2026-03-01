"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import type { Category } from "@/lib/types";

interface CategoryManagementProps {
  categories: Category[];
  userId: string;
}

export function CategoryManagement({
  categories,
  userId,
}: CategoryManagementProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const maxOrder = Math.max(0, ...categories.map((c) => c.order ?? 0));
    const catId = id();
    db.transact([
      db.tx.categories[catId]
        .update({
          name: newCategoryName.trim(),
          order: maxOrder + 1,
          isDefault: false,
        })
        .link({ owner: userId }),
    ]);
    setNewCategoryName("");
  };

  const updateCategory = (catId: string, name: string) => {
    if (!name.trim()) return;
    db.transact(db.tx.categories[catId].update({ name: name.trim() }));
    setEditingId(null);
    setEditingName("");
  };

  const deleteCategory = (cat: Category) => {
    if (!cat.isDefault && confirm(`「${cat.name}」を削除しますか？`)) {
      db.transact(db.tx.categories[cat.id].delete());
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="新しいカテゴリ"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addCategory())
          }
        />
        <Button
          type="button"
          variant="secondary"
          onClick={addCategory}
          disabled={!newCategoryName.trim()}
        >
          追加
        </Button>
      </div>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between gap-2 py-2 border-b border-[var(--border)] last:border-0"
          >
            {editingId === cat.id ? (
              <>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => updateCategory(cat.id, editingName)}
                >
                  保存
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setEditingName("");
                  }}
                >
                  取消
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-[var(--text-primary)]">
                  {cat.name}
                  {cat.isDefault && (
                    <span className="ml-2 text-xs text-[var(--text-secondary)]">
                      (既定)
                    </span>
                  )}
                </span>
                {!cat.isDefault && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingName(cat.name);
                      }}
                      className="text-sm text-[var(--primary)]"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat)}
                      className="text-sm text-[var(--danger)]"
                    >
                      削除
                    </button>
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

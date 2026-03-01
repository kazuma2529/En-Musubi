"use client";

import type { Category } from "@/lib/types";

interface CategoryPickerProps {
  categories: Category[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

export function CategoryPicker({
  categories,
  selectedIds,
  onChange,
  label = "カテゴリ",
}: CategoryPickerProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {sorted.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--primary-light)] text-[var(--text-secondary)] hover:bg-[var(--primary)]/30"
                }
              `}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export type SortOption =
  | "lastContact_asc"
  | "lastContact_desc"
  | "name_asc"
  | "birthday_asc";

const SORT_LABELS: Record<SortOption, string> = {
  lastContact_asc: "最終連絡が古い順",
  lastContact_desc: "最終連絡が新しい順",
  name_asc: "名前順",
  birthday_asc: "誕生日が近い順",
};

interface SortMenuProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortMenu({ value, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const options: SortOption[] = [
    "lastContact_asc",
    "lastContact_desc",
    "name_asc",
    "birthday_asc",
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--text-primary)]"
      >
        {SORT_LABELS[value]}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 mt-1 z-20 py-1 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-lg min-w-[180px]">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  ${value === opt ? "bg-[var(--primary-light)] text-[var(--primary-hover)]" : "text-[var(--text-primary)] hover:bg-[var(--primary-light)]/50"}
                `}
              >
                {SORT_LABELS[opt]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

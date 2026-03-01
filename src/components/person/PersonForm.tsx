"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CategoryPicker } from "./CategoryPicker";
import { BirthdayInput } from "./BirthdayInput";
import type { PersonWithCategories } from "@/lib/types";
import type { Category } from "@/lib/types";

interface PersonFormProps {
  person?: PersonWithCategories | null;
  categories: Category[];
  userId: string;
  onSuccess?: () => void;
}

export function PersonForm({
  person,
  categories,
  userId,
  onSuccess,
}: PersonFormProps) {
  const router = useRouter();
  const isEdit = !!person;

  const [name, setName] = useState(person?.name ?? "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    () => (person?.categories ?? []).map((c) => c.id)
  );
  const [birthday, setBirthday] = useState(person?.birthday ?? "");
  const [omitYear, setOmitYear] = useState(
    () => !!(person?.birthday && person.birthday.startsWith("--"))
  );
  const [memo, setMemo] = useState(person?.memo ?? "");
  const [lastContactDate, setLastContactDate] = useState<number | null>(
    () => person?.lastContactDate ?? null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (person) {
      setName(person.name);
      setSelectedCategoryIds((person.categories ?? []).map((c) => c.id));
      setBirthday(person.birthday ?? "");
      setOmitYear(!!(person.birthday && person.birthday.startsWith("--")));
      setMemo(person.memo ?? "");
      setLastContactDate(person.lastContactDate ?? null);
    }
  }, [person]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }

    if (selectedCategoryIds.length === 0) {
      setError("カテゴリを1つ以上選択してください");
      return;
    }

    const now = Date.now();
    const birthdayFormatted = birthday.trim() || undefined;
    const finalLastContact = lastContactDate ?? (isEdit ? person!.lastContactDate : now);

    if (isEdit && person) {
      const txs = [
        db.tx.people[person.id].update({
          name: name.trim(),
          memo: memo.trim() || undefined,
          birthday: birthdayFormatted || undefined,
          lastContactDate: finalLastContact,
        }),
      ];

      const currentCatIds = (person.categories ?? []).map((c) => c.id);
      const toUnlink = currentCatIds.filter((id) => !selectedCategoryIds.includes(id));
      const toLink = selectedCategoryIds.filter((id) => !currentCatIds.includes(id));

      if (toUnlink.length > 0) {
        txs.push(db.tx.people[person.id].unlink({ categories: toUnlink }));
      }
      if (toLink.length > 0) {
        txs.push(db.tx.people[person.id].link({ categories: toLink }));
      }

      db.transact(txs);
    } else {
      const personId = id();
      db.transact([
        db.tx.people[personId]
          .update({
            name: name.trim(),
            memo: memo.trim() || undefined,
            birthday: birthdayFormatted || undefined,
            lastContactDate: finalLastContact,
            createdAt: now,
          })
          .link({ owner: userId }),
        db.tx.people[personId].link({ categories: selectedCategoryIds }),
      ]);
    }

    onSuccess?.();
    router.push(isEdit ? `/person/${person?.id}` : "/home");
  };

  const displayBirthday = omitYear && birthday.startsWith("--")
    ? `${birthday.slice(2, 4)}/${birthday.slice(5, 7)}`
    : birthday;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-[var(--danger)] bg-[var(--danger)]/10 rounded-lg p-3">
          {error}
        </p>
      )}

      <Input
        label="名前 *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="山田 太郎"
        required
      />

      <CategoryPicker
        categories={categories}
        selectedIds={selectedCategoryIds}
        onChange={setSelectedCategoryIds}
      />

      <BirthdayInput
        value={birthday}
        onChange={setBirthday}
        omitYear={omitYear}
        onOmitYearChange={setOmitYear}
      />

      {isEdit && (
        <Input
          label="最終連絡日"
          type="date"
          value={
            lastContactDate
              ? new Date(lastContactDate).toISOString().slice(0, 10)
              : ""
          }
          onChange={(e) =>
            setLastContactDate(
              e.target.value ? new Date(e.target.value).getTime() : 0
            )
          }
        />
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
          メモ
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="趣味・好きなものなど"
          rows={4}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 resize-none"
        />
      </div>

      <Button type="submit" fullWidth size="lg">
        {isEdit ? "保存" : "登録"}
      </Button>
    </form>
  );
}

"use client";

import { Input } from "@/components/ui/Input";

interface BirthdayInputProps {
  value: string;
  onChange: (value: string) => void;
  omitYear?: boolean;
  onOmitYearChange?: (omit: boolean) => void;
}

export function BirthdayInput({
  value,
  onChange,
  omitYear = false,
  onOmitYearChange,
}: BirthdayInputProps) {
  if (omitYear) {
    const mmdd =
      value.startsWith("--") ?
        `${value.slice(2, 4)}/${value.slice(5, 7)}`
      : value;

    return (
      <div className="space-y-3">
        {onOmitYearChange && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="omit-year"
              checked={omitYear}
              onChange={(e) => onOmitYearChange(e.target.checked)}
              className="rounded border-[var(--border)]"
            />
            <label
              htmlFor="omit-year"
              className="text-sm text-[var(--text-secondary)]"
            >
              年を省略する
            </label>
          </div>
        )}
        <Input
          type="text"
          label="誕生日"
          placeholder="MM/DD"
          value={mmdd}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            if (v.length >= 4) {
              onChange(`--${v.slice(0, 2)}-${v.slice(2, 4)}`);
            } else if (v.length >= 2) {
              onChange(`--${v.slice(0, 2)}-${v.slice(2)}`);
            } else if (v.length >= 1) {
              onChange(`--${v}`);
            } else {
              onChange("");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {onOmitYearChange && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="omit-year"
            checked={omitYear}
            onChange={(e) => onOmitYearChange(e.target.checked)}
            className="rounded border-[var(--border)]"
          />
          <label
            htmlFor="omit-year"
            className="text-sm text-[var(--text-secondary)]"
          >
            年を省略する
          </label>
        </div>
      )}
      <Input
        type="date"
        label="誕生日"
        value={value && !value.startsWith("--") ? value.slice(0, 10) : ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

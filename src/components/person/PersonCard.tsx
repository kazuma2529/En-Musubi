"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ContactButton } from "./ContactButton";
import { formatLastContact } from "@/lib/dateUtils";
import type { PersonWithCategories } from "@/lib/types";

interface PersonCardProps {
  person: PersonWithCategories;
}

export function PersonCard({ person }: PersonCardProps) {
  const categories = person.categories ?? [];
  const lastContact = person.lastContactDate
    ? formatLastContact(person.lastContactDate)
    : null;

  return (
    <Link href={`/person/${person.id}`} className="block">
      <div
        className="
          rounded-2xl bg-[var(--card)] border border-[var(--border)]
          p-4 shadow-sm hover:shadow-md hover:border-[var(--primary)]/30
          transition-all duration-300 active:scale-[0.99]
        "
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[var(--text-primary)] truncate">
              {person.name}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {categories.map((cat) => (
                <Badge key={cat.id} variant="primary">
                  {cat.name}
                </Badge>
              ))}
            </div>
            {lastContact && (
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                最終連絡: {lastContact}
              </p>
            )}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <ContactButton person={person} size="sm" className="w-full" />
        </div>
      </div>
    </Link>
  );
}

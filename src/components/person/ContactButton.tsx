"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import type { Person, PersonWithCategories } from "@/lib/types";

interface ContactButtonProps {
  person: Person | PersonWithCategories;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

export function ContactButton({
  person,
  size = "md",
  fullWidth,
  className = "",
}: ContactButtonProps) {
  const [recorded, setRecorded] = useState(false);

  const handleClick = () => {
    db.transact(db.tx.people[person.id].update({ lastContactDate: Date.now() }));
    setRecorded(true);
    setTimeout(() => setRecorded(false), 1500);
  };

  return (
    <Button
      variant="primary"
      size={size}
      fullWidth={fullWidth}
      onClick={handleClick}
      className={`transition-all duration-300 ${recorded ? "scale-105" : ""} ${className}`}
    >
      {recorded ? "✓ 記録しました" : "今日連絡した"}
    </Button>
  );
}

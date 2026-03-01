"use client";

import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_OWNER_ID } from "@/lib/constants";

/** 現在ユーザーのID。未ログイン時は DEFAULT_OWNER_ID（モック用） */
export function useOwnerId(): string {
  const { user } = useAuth();
  return user?.id ?? DEFAULT_OWNER_ID;
}

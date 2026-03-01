"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const isMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

/**
 * 認証必須ページ用。未ログインなら /login へリダイレクトし、auth 状態を返す。
 */
export function useRequireAuth() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading || isMockAuth) return;
    if (!auth.user) router.replace("/login");
  }, [auth.isLoading, auth.user, router]);

  return auth;
}

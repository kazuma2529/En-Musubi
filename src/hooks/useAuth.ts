"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";

const isMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

async function devSignIn(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/dev-signin", { method: "POST" });
    if (!res.ok) return false;
    const { token } = await res.json();
    await db.auth.signInWithToken(token);
    return true;
  } catch {
    return false;
  }
}

export function useAuth() {
  const instantAuth = db.useAuth();
  const [devSignInAttempted, setDevSignInAttempted] = useState(false);
  const attemptingRef = useRef(false);

  useEffect(() => {
    if (!isMockAuth) return;

    if (instantAuth.user || instantAuth.isLoading || devSignInAttempted) return;
    if (attemptingRef.current) return;

    attemptingRef.current = true;
    devSignIn().finally(() => {
      setDevSignInAttempted(true);
      attemptingRef.current = false;
    });
  }, [instantAuth.user, instantAuth.isLoading, devSignInAttempted]);

  if (isMockAuth) {
    return {
      isLoading: !devSignInAttempted || instantAuth.isLoading,
      user: instantAuth.user,
      error: instantAuth.error,
      signOut: () => db.auth.signOut(),
    };
  }

  return {
    isLoading: instantAuth.isLoading,
    user: instantAuth.user,
    error: instantAuth.error,
    signOut: () => db.auth.signOut(),
  };
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const isMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

export default function LoginPage() {
  const router = useRouter();
  const { isLoading, user } = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (user) {
    router.replace("/home");
    return null;
  }

  if (isMockAuth) {
    return (
      <PageLayout showBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-[var(--text-secondary)]">
            開発モード: ログイン中...
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await db.auth.sendMagicCode({ email });
      setStep("code");
    } catch (err: unknown) {
      setError((err as { body?: { message?: string } })?.body?.message ?? "送信に失敗しました");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await db.auth.signInWithMagicCode({ email, code });
      router.replace("/home");
    } catch (err: unknown) {
      setError((err as { body?: { message?: string } })?.body?.message ?? "認証に失敗しました");
      setCode("");
    }
  };

  return (
    <PageLayout showBottomNav={false}>
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          縁結び
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          大切な人との縁を管理
        </p>

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="w-full max-w-sm space-y-4">
            <Input
              type="email"
              label="メールアドレス"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <Button type="submit" fullWidth size="lg">
              認証コードを送信
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="w-full max-w-sm space-y-4">
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              {email} に6桁のコードを送りました
            </p>
            <Input
              type="text"
              label="認証コード"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              required
            />
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <Button type="submit" fullWidth size="lg">
              ログイン
            </Button>
            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setError(""); }}
              className="w-full text-sm text-[var(--text-secondary)] hover:text-[var(--primary)]"
            >
              別のメールアドレスを使う
            </button>
          </form>
        )}

      </div>
    </PageLayout>
  );
}

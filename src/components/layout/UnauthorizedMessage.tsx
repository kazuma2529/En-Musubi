"use client";

import { PageLayout } from "./PageLayout";

export function UnauthorizedMessage() {
  return (
    <PageLayout showBottomNav={false}>
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-[var(--text-secondary)]">ログインが必要です</p>
      </div>
    </PageLayout>
  );
}
